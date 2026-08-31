"""
Service de prédiction d'orientation.

Le modèle procède en deux temps : il détermine d'abord la catégorie
de filières qui correspond au profil, puis la branche précise au sein
de cette catégorie. Cette hiérarchie reflète la façon dont un conseiller
raisonne — du domaine général vers la spécialité.
"""

import json
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

ARTEFACTS = Path(__file__).parent / "artefacts"

app = FastAPI(
    title="SmartOrienta — Service de prédiction",
    description="Recommandation de filière à partir du profil scolaire et psychométrique",
    version="1.0.0",
)


# ─────────── Chargement des artefacts ───────────

def charger():
    """
    Charge les modèles et leurs préprocesseurs.

    Un modèle seul ne suffit pas : il attend des données transformées
    exactement comme à l'entraînement. Les préprocesseurs et encodeurs
    font donc partie intégrante de ce qui doit être déployé.
    """
    with open(ARTEFACTS / "metadonnees.json", encoding="utf-8") as f:
        meta = json.load(f)

    return {
        "meta": meta,
        "preprocessor_cat": joblib.load(ARTEFACTS / "preprocessor_cat.joblib"),
        "encoder_cat": joblib.load(ARTEFACTS / "label_encoder_cat.joblib"),
        "modele_cat": joblib.load(ARTEFACTS / "modele_categorie.joblib"),
        "preprocessor_branche": joblib.load(ARTEFACTS / "preprocessor_branche.joblib"),
        "encoder_branche": joblib.load(ARTEFACTS / "label_encoder_branche.joblib"),
        "modele_branche": joblib.load(ARTEFACTS / "modele_branche.joblib"),
    }


M = charger()


# ─────────── Contrat d'échange ───────────

class PredictionRequest(BaseModel):
    """Profil transmis par le service d'orientation."""

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
    codeHolland: str = ""          # non utilisé par le modèle, conservé pour la traçabilité

    stress: float = Field(0.0, ge=0, le=5)
    social: float = Field(0.0, ge=0, le=5)
    autonomie: float = Field(0.0, ge=0, le=5)
    adaptabilite: float = Field(0.0, ge=0, le=5)


class PredictionResponse(BaseModel):
    categorie: str
    branche: str
    scoreConfiance: float
    explication: str


# ─────────── Correspondance des noms de variables ───────────

def vers_dataframe(req: PredictionRequest) -> pd.DataFrame:
    """
    Traduit la requête dans le vocabulaire du jeu d'entraînement.

    Le service Java emploie une notation en casse mixte, le jeu de
    données une notation avec tirets bas. Cette traduction est le point
    de contact entre les deux mondes.
    """
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

    # L'ordre des colonnes doit être celui de l'entraînement :
    # le préprocesseur travaille par position, non par nom.
    return pd.DataFrame([valeurs])[M["meta"]["colonnes_niveau1"]]


# ─────────── Points d'entrée ───────────

@app.get("/health")
def sante():
    return {
        "statut": "UP",
        "modele": M["meta"]["modele"],
        "categories": len(M["meta"]["categories"]),
        "branches": len(M["meta"]["branches"]),
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

        # La confiance globale tient compte des deux étapes : une erreur
        # au premier niveau invalide le second.
        confiance = round(confiance_cat * confiance_branche, 4)

        explication = (
            f"Le profil oriente vers le domaine « {categorie} » "
            f"(confiance {confiance_cat:.0%}), et plus précisément vers "
            f"« {branche} » (confiance {confiance_branche:.0%}) au sein de ce domaine."
        )

        return PredictionResponse(
            categorie=categorie,
            branche=branche,
            scoreConfiance=confiance,
            explication=explication,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction : {e}")