"""
Service de prédiction d'orientation.

Le modèle procède en deux temps : il détermine d'abord la catégorie
de filières qui correspond au profil, puis la branche précise au sein
de cette catégorie.

Chaque prédiction s'accompagne d'une explication : les variables qui
ont le plus pesé sur cette recommandation particulière. Le conseiller
dispose ainsi non seulement d'une proposition, mais des éléments qui
l'ont motivée.
"""

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List

ARTEFACTS = Path(__file__).parent / "artefacts"

app = FastAPI(
    title="SmartOrienta — Service de prédiction",
    description="Recommandation de filière, assortie de son explication",
    version="2.0.0",
)


# ─────────── Chargement ───────────

def charger():
    with open(ARTEFACTS / "metadonnees.json", encoding="utf-8") as f:
        meta = json.load(f)

    modele_branche = joblib.load(ARTEFACTS / "modele_branche.joblib")

    return {
        "meta": meta,
        "preprocessor_cat": joblib.load(ARTEFACTS / "preprocessor_cat.joblib"),
        "encoder_cat": joblib.load(ARTEFACTS / "label_encoder_cat.joblib"),
        "modele_cat": joblib.load(ARTEFACTS / "modele_categorie.joblib"),
        "preprocessor_branche": joblib.load(ARTEFACTS / "preprocessor_branche.joblib"),
        "encoder_branche": joblib.load(ARTEFACTS / "label_encoder_branche.joblib"),
        "modele_branche": modele_branche,
        # L'explainer est construit une fois au démarrage : sa création
        # parcourt l'ensemble des arbres, ce qui serait trop coûteux
        # à chaque requête.
        "explainer": shap.TreeExplainer(modele_branche),
    }


M = charger()


# ─────────── Libellés lisibles ───────────
# Les noms produits par le préprocesseur sont techniques
# (« num__note_maths », « cat__serie_S1 »). Cette table les traduit
# pour que le conseiller comprenne ce qu'il lit.

LIBELLES = {
    "note_maths": "la note de mathématiques",
    "note_francais": "la note de français",
    "note_anglais": "la note d'anglais",
    "note_hg": "la note d'histoire-géographie",
    "note_philo": "la note de philosophie",
    "note_spe1": "la note de première spécialité",
    "note_spe2": "la note de seconde spécialité",
    "score_R": "l'intérêt réaliste",
    "score_I": "l'intérêt investigateur",
    "score_A": "l'intérêt artistique",
    "score_S": "l'intérêt social",
    "score_E": "l'intérêt entreprenant",
    "score_C": "l'intérêt conventionnel",
    "stress": "la sensibilité au stress",
    "social": "l'aisance sociale",
    "autonomie": "l'autonomie",
    "adaptabilite": "la capacité d'adaptation",
    "serie": "la série du baccalauréat",
    "nom_spe1": "la première spécialité",
    "nom_spe2": "la seconde spécialité",
    "categorie": "le domaine retenu",
}


def libelle_de(nom_technique: str) -> str:
    """Traduit un nom de variable produit par le préprocesseur."""
    nom = nom_technique.split("__", 1)[-1]        # retire le préfixe num__ ou cat__
    if nom in LIBELLES:
        return LIBELLES[nom]
    # Les variables encodées portent la valeur en suffixe : serie_S1
    for cle, libelle in LIBELLES.items():
        if nom.startswith(cle + "_"):
            valeur = nom[len(cle) + 1:]
            return f"{libelle} ({valeur})"
    return nom


# ─────────── Contrat d'échange ───────────

class PredictionRequest(BaseModel):
    serie: str
    nomSpe1: str = "—"
    nomSpe2: str = "—"

    noteMaths: float = 0.0
    noteFrancais: float = 0.0
    noteAnglais: float = 0.0
    noteHg: float = 0.0
    notePhilo: float = 0.0
    noteSpe1: float = 0.0
    noteSpe2: float = 0.0

    scoreR: float = Field(0.0, ge=0, le=5)
    scoreI: float = Field(0.0, ge=0, le=5)
    scoreA: float = Field(0.0, ge=0, le=5)
    scoreS: float = Field(0.0, ge=0, le=5)
    scoreE: float = Field(0.0, ge=0, le=5)
    scoreC: float = Field(0.0, ge=0, le=5)
    codeHolland: str = ""

    stress: float = Field(0.0, ge=0, le=5)
    social: float = Field(0.0, ge=0, le=5)
    autonomie: float = Field(0.0, ge=0, le=5)
    adaptabilite: float = Field(0.0, ge=0, le=5)


class FacteurInfluent(BaseModel):
    variable: str
    libelle: str
    poids: float          # part de l'influence totale, en pourcentage


class PredictionResponse(BaseModel):
    categorie: str
    branche: str
    scoreConfiance: float
    explication: str
    facteurs: List[FacteurInfluent] = []


# ─────────── Correspondance des noms ───────────

def vers_dataframe(req: PredictionRequest) -> pd.DataFrame:
    valeurs = {
        "serie": req.serie,
        "nom_spe1": req.nomSpe1 or "—",
        "nom_spe2": req.nomSpe2 or "—",
        "note_maths": req.noteMaths,
        "note_francais": req.noteFrancais,
        "note_anglais": req.noteAnglais,
        "note_hg": req.noteHg,
        "note_philo": req.notePhilo,
        "note_spe1": req.noteSpe1,
        "note_spe2": req.noteSpe2,
        "score_R": req.scoreR,
        "score_I": req.scoreI,
        "score_A": req.scoreA,
        "score_S": req.scoreS,
        "score_E": req.scoreE,
        "score_C": req.scoreC,
        "stress": req.stress,
        "social": req.social,
        "autonomie": req.autonomie,
        "adaptabilite": req.adaptabilite,
    }
    return pd.DataFrame([valeurs])[M["meta"]["colonnes_niveau1"]]


# ─────────── Explicabilité ───────────

def expliquer(X_transforme, indice_branche: int, limite: int = 5):
    """
    Détermine les variables qui ont le plus pesé sur cette recommandation.

    Les valeurs de Shapley mesurent la contribution de chaque variable
    à l'écart entre la prédiction obtenue et la prédiction moyenne.
    Contrairement à l'importance globale du modèle, cette mesure est
    propre au dossier examiné.
    """
    X_dense = X_transforme.toarray() if hasattr(X_transforme, "toarray") else X_transforme
    X_dense = np.asarray(X_dense, dtype=np.float64)

    valeurs = M["explainer"].shap_values(X_dense)
    sv = np.array(valeurs)

    noms = M["preprocessor_branche"].get_feature_names_out()
    n = len(noms)

    # La forme varie selon les versions de SHAP : on retient l'axe
    # dont la taille correspond au nombre de variables.
    if sv.ndim == 3:
        if sv.shape[0] == n:            # (variables, échantillons, classes)
            contributions = np.abs(sv[:, 0, indice_branche])
        elif sv.shape[2] == n:          # (classes, échantillons, variables)
            contributions = np.abs(sv[indice_branche, 0, :])
        else:                           # (échantillons, variables, classes)
            contributions = np.abs(sv[0, :, indice_branche])
    else:
        contributions = np.abs(sv[0])

    total = contributions.sum()
    if total == 0:
        return []

    ordre = np.argsort(contributions)[::-1][:limite]

    return [
        FacteurInfluent(
            variable=str(noms[i]),
            libelle=libelle_de(str(noms[i])),
            poids=round(float(contributions[i] / total * 100), 1),
        )
        for i in ordre
    ]


# ─────────── Points d'entrée ───────────

@app.get("/health")
def sante():
    return {
        "statut": "UP",
        "modele": M["meta"]["modele"],
        "categories": len(M["meta"]["categories"]),
        "branches": len(M["meta"]["branches"]),
        "explicabilite": True,
    }


@app.get("/referentiel")
def referentiel():
    return {
        "categories": M["meta"]["categories"],
        "branches": M["meta"]["branches"],
    }


@app.post("/predict", response_model=PredictionResponse)
def predire(req: PredictionRequest):
    try:
        # ── Niveau 1 : la catégorie ──
        X = vers_dataframe(req)
        X_cat = M["preprocessor_cat"].transform(X)

        proba_cat = M["modele_cat"].predict_proba(X_cat)[0]
        indice_cat = int(proba_cat.argmax())
        categorie = M["encoder_cat"].inverse_transform([indice_cat])[0]
        confiance_cat = float(proba_cat[indice_cat])

        # ── Niveau 2 : la branche, sachant la catégorie prédite ──
        X2 = X.copy()
        X2["categorie"] = categorie
        X2 = X2[M["meta"]["colonnes_niveau2"]]

        X_branche = M["preprocessor_branche"].transform(X2)

        proba_branche = M["modele_branche"].predict_proba(X_branche)[0]
        indice_branche = int(proba_branche.argmax())
        branche = M["encoder_branche"].inverse_transform([indice_branche])[0]
        confiance_branche = float(proba_branche[indice_branche])

        # ── Explicabilité ──
        facteurs = expliquer(X_branche, indice_branche)

        # La confiance affichée est celle de la branche recommandée.
        confiance = round(confiance_branche, 4)

        if facteurs:
            principaux = ", ".join(f.libelle for f in facteurs[:3])
            motif = f" Cette proposition repose principalement sur {principaux}."
        else:
            motif = ""

        explication = (
            f"Le profil oriente vers le domaine « {categorie} », "
            f"retenu avec une probabilité de {confiance_cat:.0%} parmi neuf domaines. "
            f"Au sein de ce domaine, la filière « {branche} » ressort avec "
            f"{confiance_branche:.0%}, contre 2 % si le choix était aléatoire."
            + motif
        )

        return PredictionResponse(
            categorie=categorie,
            branche=branche,
            scoreConfiance=confiance,
            explication=explication,
            facteurs=facteurs,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction : {e}")