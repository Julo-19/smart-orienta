"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check, X, Pencil, GraduationCap, Brain, BarChart3, AlertCircle, MessageSquare, Lightbulb,
} from "lucide-react";
import RiasecRadar from "@/components/lyceen/RiasecRadar";
import { Dimension } from "@/lib/riasecQuestions";
import {
  getRecommandationsEnAttente, getMesDecisions, getMesEtudiants, getDossierEtudiant,
  validerRecommandation, modifierRecommandation, rejeterRecommandation,
  Recommandation, EtudiantListItem, DossierEtudiant, FacteurInfluent,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

type Statut = "EN_ATTENTE" | "VALIDEE" | "MODIFIEE" | "REJETEE";
type Filtre = "TOUS" | Statut;

const STATUT_CONFIG: Record<Statut, { label: string; color: string; bg: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",   dot: "bg-amber-500"  },
  VALIDEE:    { label: "Validée",    color: "text-green-600",  bg: "bg-green-50 border-green-200",   dot: "bg-green-500"  },
  MODIFIEE:   { label: "Modifiée",   color: "text-orange-600", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  REJETEE:    { label: "Rejetée",    color: "text-red-600",    bg: "bg-red-50 border-red-200",       dot: "bg-red-500"    },
};

const FILTRES: { id: Filtre; label: string }[] = [
  { id: "TOUS",       label: "Tous" },
  { id: "EN_ATTENTE", label: "En attente" },
  { id: "VALIDEE",    label: "Validées" },
  { id: "MODIFIEE",   label: "Modifiées" },
  { id: "REJETEE",    label: "Rejetées" },
];

function ScoreCarres({ score, max = 5 }: { score: number; max?: number }) {
  const arrondi = Math.round(score);
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-5 h-5 rounded-sm ${i < arrondi ? "bg-blue-500" : "bg-gray-200"}`} />
      ))}
    </div>
  );
}

export default function ConseillerDashboard() {
  const router = useRouter();

  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [etudiants, setEtudiants] = useState<EtudiantListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dossier, setDossier] = useState<DossierEtudiant | null>(null);
  const [filtre, setFiltre] = useState<Filtre>("TOUS");

  const [commentaire, setCommentaire] = useState("");
  const [nouvelleBranche, setNouvelleBranche] = useState("");
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: Statut; texte: string } | null>(null);
  const [error, setError] = useState("");

  /** Charge la file d'attente et l'historique des décisions. */
  const charger = async () => {
    try {
      const [attente, traitees, elevs] = await Promise.all([
        getRecommandationsEnAttente(),
        getMesDecisions(),
        getMesEtudiants(),
      ]);
      const toutes = [...attente, ...traitees];
      setRecommandations(toutes);
      setEtudiants(elevs);
      if (toutes.length > 0 && selectedId === null) {
        setSelectedId(toutes[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    charger();
  }, [router]);

  const selected = recommandations.find((r) => r.id === selectedId) ?? null;

  const eleve = selected
    ? etudiants.find((e) => e.userId === selected.etudiantUserId) ?? null
    : null;

  useEffect(() => {
    if (!eleve) {
      setDossier(null);
      return;
    }
    getDossierEtudiant(eleve.id).then(setDossier).catch(() => setDossier(null));
  }, [eleve?.id]);

  const affichees = filtre === "TOUS"
    ? recommandations
    : recommandations.filter((r) => r.statut === filtre);

  const nbAttente = recommandations.filter((r) => r.statut === "EN_ATTENTE").length;
  const nbTraitees = recommandations.filter((r) => r.statut !== "EN_ATTENTE").length;

  const scoresRIASEC = {
    R: dossier?.riasec?.scoreR ?? 0, I: dossier?.riasec?.scoreI ?? 0,
    A: dossier?.riasec?.scoreA ?? 0, S: dossier?.riasec?.scoreS ?? 0,
    E: dossier?.riasec?.scoreE ?? 0, C: dossier?.riasec?.scoreC ?? 0,
  } as Record<Dimension, number>;

  const moyenne = (() => {
    if (!dossier?.notes?.length) return null;
    let somme = 0, coefs = 0;
    for (const n of dossier.notes) {
      somme += n.valeur * n.coefficient;
      coefs += n.coefficient;
    }
    return coefs === 0 ? null : Math.round((somme / coefs) * 100) / 100;
  })();

  const facteurs: FacteurInfluent[] = (() => {
    try {
      return selected?.facteurs ? JSON.parse(selected.facteurs) : [];
    } catch {
      return [];
    }
  })();

  const handleAction = async (action: Statut) => {
    if (!selected) return;

    if (action === "REJETEE" && !commentaire.trim()) {
      setError("Un motif est obligatoire pour rejeter une recommandation.");
      return;
    }
    if (action === "MODIFIEE" && !nouvelleBranche.trim()) {
      setError("Indiquez la filière que vous retenez.");
      return;
    }

    setError("");
    setEnCours(true);
    try {
      let maj: Recommandation;
      if (action === "VALIDEE") {
        maj = await validerRecommandation(selected.id, commentaire);
      } else if (action === "MODIFIEE") {
        maj = await modifierRecommandation(selected.id, nouvelleBranche, commentaire);
      } else {
        maj = await rejeterRecommandation(selected.id, commentaire);
      }

      setRecommandations((prev) => prev.map((r) => (r.id === maj.id ? maj : r)));
      setCommentaire("");
      setNouvelleBranche("");
      setMessage({
        type: action,
        texte: action === "VALIDEE" ? "Dossier approuvé"
             : action === "MODIFIEE" ? "Filière ajustée"
             : "Dossier rejeté",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setEnCours(false);
    }
  };

  if (chargement) {
    return <div className="p-12 text-center text-gray-400">Chargement des dossiers…</div>;
  }

  if (recommandations.length === 0) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-semibold">Aucun dossier</p>
        <p className="text-sm text-gray-400 mt-1">
          Les recommandations concernant vos lycéens apparaîtront ici.
        </p>
        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  const statut = selected ? STATUT_CONFIG[selected.statut] : STATUT_CONFIG.EN_ATTENTE;
  const peutAgir = selected?.statut === "EN_ATTENTE";
  const scorePourcent = selected ? Math.round(selected.scoreConfiance * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-52px)]">

      {/* ── SIDEBAR ── */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

        <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-100">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-amber-600">{nbAttente}</p>
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide">En attente</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-600">{nbTraitees}</p>
            <p className="text-xs text-green-500 font-semibold uppercase tracking-wide">Traitées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-1 p-3 border-b border-gray-100 flex-wrap">
          {FILTRES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltre(f.id)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all
                ${filtre === f.id
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {affichees.length === 0 ? (
            <p className="p-6 text-center text-xs text-gray-400">
              Aucun dossier pour ce filtre.
            </p>
          ) : (
            affichees.map((reco) => {
              const s = STATUT_CONFIG[reco.statut];
              const el = etudiants.find((e) => e.userId === reco.etudiantUserId);
              const isSelected = reco.id === selectedId;
              const conf = Math.round(reco.scoreConfiance * 100);

              return (
                <button
                  key={reco.id}
                  onClick={() => setSelectedId(reco.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 transition-all duration-150
                    ${isSelected
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                      {el?.matricule ?? `Dossier #${reco.id}`}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    {el ? `Série ${el.serieCode} · ${el.etablissement.replace("Lycée ", "")}` : "—"}
                  </p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {reco.brancheFinale ?? reco.branche}
                    </p>
                    <p className={`text-xs font-bold ${
                      conf >= 50 ? "text-green-600" : conf >= 25 ? "text-amber-600" : "text-red-500"
                    }`}>
                      {conf}% conf.
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── CONTENU ── */}
      <main className="flex-1 overflow-y-auto p-5">

        <div className="bg-gray-800 text-white rounded-2xl p-5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center
              justify-center font-bold text-lg flex-shrink-0">
              {eleve?.matricule?.slice(-2) ?? "?"}
            </div>
            <div>
              <h2 className="text-lg font-bold">{eleve?.matricule ?? "Élève inconnu"}</h2>
              <p className="text-sm text-gray-400">
                {eleve ? `${eleve.serieCode} · ${eleve.etablissement}` : "—"}
                {" · "}Dossier #{selected?.id}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statut.bg}`}>
            <div className={`w-2 h-2 rounded-full ${statut.dot} ${peutAgir ? "animate-pulse" : ""}`} />
            <span className={`text-xs font-bold ${statut.color}`}>{statut.label}</span>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl border text-sm font-semibold flex items-center gap-2
            ${message.type === "VALIDEE" ? "bg-green-50 border-green-200 text-green-700"
              : message.type === "MODIFIEE" ? "bg-orange-50 border-orange-200 text-orange-700"
              : "bg-red-50 border-red-200 text-red-700"}`}>
            {message.type === "VALIDEE" && <Check className="w-4 h-4" />}
            {message.type === "MODIFIEE" && <Pencil className="w-4 h-4" />}
            {message.type === "REJETEE" && <X className="w-4 h-4" />}
            {message.texte}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Académique + RIASEC */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Académique</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-black text-blue-600">
                  {moyenne !== null ? moyenne.toFixed(2) : "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Moy. pondérée</p>
              </div>
              <div>
                <p className="text-2xl font-black text-green-600">{dossier?.notes?.length ?? 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">Notes saisies</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-500">{eleve?.serieCode ?? "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">Série</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Profil RIASEC
                </h3>
              </div>
              <span className="text-lg font-black text-blue-600 tracking-wider">
                · {dossier?.riasec?.codeHolland ?? "—"}
              </span>
            </div>
            <RiasecRadar scores={scoresRIASEC} />
          </div>
        </div>

        {/* Comportemental + Recommandation */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Variables comportementales
              </h3>
            </div>
            {dossier?.riasec ? (
              <div className="space-y-3">
                {[
                  { cle: "stress", val: dossier.riasec.stress },
                  { cle: "social", val: dossier.riasec.social },
                  { cle: "autonomie", val: dossier.riasec.autonomie },
                  { cle: "adaptabilité", val: dossier.riasec.adaptabilite },
                ].map((item) => (
                  <div key={item.cle} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize w-24">{item.cle}</span>
                    <div className="flex items-center gap-3">
                      <ScoreCarres score={item.val} />
                      <span className="text-xs font-bold text-gray-500 w-10">
                        {item.val.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Questionnaire non renseigné.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Recommandation
              </h3>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#10B981" strokeWidth="5"
                    strokeDasharray={`${(scorePourcent / 100) * 175.9} 175.9`}
                    strokeLinecap="round" transform="rotate(-90 32 32)" />
                </svg>
                <span className="text-sm font-black text-green-600">{scorePourcent}%</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 mb-1">
                  Catégorie : {selected?.categorie}
                </p>
                <p className="text-sm font-bold text-gray-800">{selected?.branche}</p>
                {selected?.brancheFinale && selected.brancheFinale !== selected.branche && (
                  <p className="text-xs text-orange-600 mt-1">
                    Retenu : {selected.brancheFinale}
                  </p>
                )}
              </div>
            </div>

            {/* Facteurs explicatifs */}
            {facteurs.length > 0 && (
              <div className="space-y-2 mb-3">
                {facteurs.slice(0, 3).map((f) => (
                  <div key={f.variable}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs text-gray-500">{f.libelle}</span>
                      <span className="text-xs font-bold text-blue-600">
                        {f.poids.toFixed(1)} %
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(f.poids * 4, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 italic leading-relaxed">
              {selected?.explication}
            </p>
          </div>
        </div>

        {/* Contexte */}
        {dossier?.contexte && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Contexte personnel
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Contraintes</p>
                <p className="text-gray-700">{dossier.contexte.contraintes || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Passions</p>
                <p className="text-gray-700">{dossier.contexte.passions || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Filières refusées</p>
                <p className="text-gray-700">{dossier.contexte.filieresRefusees || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Message au conseiller</p>
                <p className="text-gray-700">{dossier.contexte.messageConseiller || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── DÉCISION ── */}
        {peutAgir ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Votre décision
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Commentaire (obligatoire pour un rejet)"
                rows={2}
                className="text-sm border border-gray-200 rounded-lg p-3 resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
              <input
                type="text"
                value={nouvelleBranche}
                onChange={(e) => setNouvelleBranche(e.target.value)}
                placeholder="Filière retenue (si vous modifiez)"
                className="text-sm border border-gray-200 rounded-lg p-3 h-fit
                  focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleAction("VALIDEE")}
                disabled={enCours}
                className="p-4 rounded-xl border-2 border-green-300 bg-green-50
                  hover:bg-green-100 disabled:opacity-50 text-left transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">Approuver</span>
                </div>
                <p className="text-xs text-green-600">La proposition est cohérente</p>
              </button>

              <button
                onClick={() => handleAction("MODIFIEE")}
                disabled={enCours}
                className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50
                  hover:bg-amber-100 disabled:opacity-50 text-left transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Pencil className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700">Modifier</span>
                </div>
                <p className="text-xs text-amber-600">Retenir une autre filière</p>
              </button>

              <button
                onClick={() => handleAction("REJETEE")}
                disabled={enCours}
                className="p-4 rounded-xl border-2 border-red-300 bg-red-50
                  hover:bg-red-100 disabled:opacity-50 text-left transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-bold text-red-700">Rejeter</span>
                </div>
                <p className="text-xs text-red-600">Proposition inadaptée</p>
              </button>
            </div>
          </div>
        ) : (
          <div className={`flex items-start gap-4 p-5 rounded-xl border-2
            ${selected?.statut === "VALIDEE" ? "bg-green-50 border-green-300"
              : selected?.statut === "MODIFIEE" ? "bg-amber-50 border-amber-300"
              : "bg-red-50 border-red-300"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${selected?.statut === "VALIDEE" ? "bg-green-600"
                : selected?.statut === "MODIFIEE" ? "bg-amber-600" : "bg-red-600"}`}>
              {selected?.statut === "VALIDEE" && <Check className="w-5 h-5 text-white" />}
              {selected?.statut === "MODIFIEE" && <Pencil className="w-5 h-5 text-white" />}
              {selected?.statut === "REJETEE" && <X className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className={`text-sm font-bold ${statut.color}`}>
                Décision : {statut.label}
                {selected?.brancheFinale && ` — ${selected.brancheFinale}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {selected?.commentaireConseiller || "Aucun commentaire."}
              </p>
              {selected?.dateDecision && (
                <p className="text-xs text-gray-400 mt-2">
                  Décidé le {new Date(selected.dateDecision).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}