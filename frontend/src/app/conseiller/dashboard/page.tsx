"use client";

import { useState } from "react";
import {
  Check, X, Pencil, Clock, ChevronRight,
  GraduationCap, Brain, BarChart3, AlertCircle
} from "lucide-react";
import RiasecRadar from "@/components/lyceen/RiasecRadar";
import { Dimension } from "@/lib/riasecQuestions";

// ── TYPES ──
type Statut = "EN_ATTENTE" | "VALIDEE" | "AJUSTEE" | "REJETEE";

interface Dossier {
  id: string;
  numero: string;
  nom: string;
  prenom: string;
  serie: string;
  lycee: string;
  dateSubmission: string;
  scoreConfiance: number;
  statut: Statut;
  academique: {
    moyGlobale: number;
    moySciences: number;
    moyLettres: number;
  };
  riasec: Record<Dimension, number>;
  codeHolland: string;
  comportementales: {
    stress: number;
    social: number;
    autonomie: number;
    adaptabilite: number;
  };
  recommandation: {
    categorie: string;
    top3: { branche: string; score: number }[];
    explication: string;
  };
}

// ── MOCK DATA ──
const DOSSIERS: Dossier[] = [
  {
    id: "1", numero: "D001",
    nom: "Diallo", prenom: "Aminata",
    serie: "S2", lycee: "Lycée Seydina Limamou Laye",
    dateSubmission: "27 Avr 2025 09:14",
    scoreConfiance: 87, statut: "EN_ATTENTE",
    academique: { moyGlobale: 15.4, moySciences: 16.5, moyLettres: 13.0 },
    riasec: { R: 2.4, I: 4.2, A: 3.0, S: 2.8, E: 3.4, C: 2.6 },
    codeHolland: "IEA",
    comportementales: { stress: 4, social: 3, autonomie: 4, adaptabilite: 4 },
    recommandation: {
      categorie: "Sciences & Technologie",
      top3: [
        { branche: "Informatique & IA", score: 87 },
        { branche: "Génie Électrique",  score: 79 },
        { branche: "Maths Appliquées",  score: 74 },
      ],
      explication: "Score Investigateur dominant (4.2/5) + excellence en maths. L'autonomie élevée renforce la compatibilité ingénierie.",
    },
  },
  {
    id: "2", numero: "D002",
    nom: "Sarr", prenom: "Moussa",
    serie: "S1", lycee: "Lycée Blaise Diagne",
    dateSubmission: "25 Avr 2025 14:30",
    scoreConfiance: 76, statut: "VALIDEE",
    academique: { moyGlobale: 13.2, moySciences: 14.1, moyLettres: 11.8 },
    riasec: { R: 3.5, I: 3.8, A: 2.2, S: 3.0, E: 2.8, C: 3.2 },
    codeHolland: "IRA",
    comportementales: { stress: 3, social: 3, autonomie: 4, adaptabilite: 3 },
    recommandation: {
      categorie: "Sciences & Technologie",
      top3: [
        { branche: "Génie Civil",    score: 76 },
        { branche: "Électrotechnique", score: 68 },
        { branche: "Génie Mécanique", score: 61 },
      ],
      explication: "Profil Réaliste-Investigateur adapté aux filières d'ingénierie classique.",
    },
  },
  {
    id: "3", numero: "D003",
    nom: "Ndiaye", prenom: "Fatou",
    serie: "L1", lycee: "Lycée J.F. Kennedy",
    dateSubmission: "24 Avr 2025 11:00",
    scoreConfiance: 64, statut: "AJUSTEE",
    academique: { moyGlobale: 14.1, moySciences: 11.0, moyLettres: 16.2 },
    riasec: { R: 1.8, I: 3.2, A: 4.5, S: 4.2, E: 3.8, C: 2.5 },
    codeHolland: "ASE",
    comportementales: { stress: 3, social: 5, autonomie: 3, adaptabilite: 4 },
    recommandation: {
      categorie: "Lettres & Communication",
      top3: [
        { branche: "Journalisme",     score: 64 },
        { branche: "Communication & RP", score: 58 },
        { branche: "Langues Étrangères", score: 52 },
      ],
      explication: "Profil Artistique-Social dominant. Excellente maîtrise du français.",
    },
  },
  {
    id: "4", numero: "D004",
    nom: "Faye", prenom: "Ibrahim",
    serie: "G1", lycee: "Lycée Tech. Limamou",
    dateSubmission: "23 Avr 2025 08:45",
    scoreConfiance: 42, statut: "REJETEE",
    academique: { moyGlobale: 10.8, moySciences: 11.2, moyLettres: 10.1 },
    riasec: { R: 3.0, I: 3.0, A: 3.0, S: 3.0, E: 3.0, C: 3.0 },
    codeHolland: "RIC",
    comportementales: { stress: 3, social: 3, autonomie: 3, adaptabilite: 3 },
    recommandation: {
      categorie: "Sciences Économiques",
      top3: [
        { branche: "Finance",         score: 42 },
        { branche: "Comptabilité",    score: 38 },
        { branche: "Management",      score: 35 },
      ],
      explication: "Profil trop homogène — test probablement rempli sans attention.",
    },
  },
  {
    id: "5", numero: "D005",
    nom: "Mbaye", prenom: "Rokhaya",
    serie: "S3", lycee: "Lycée Mariama Bâ",
    dateSubmission: "27 Avr 2025 11:30",
    scoreConfiance: 91, statut: "EN_ATTENTE",
    academique: { moyGlobale: 16.8, moySciences: 17.5, moyLettres: 14.2 },
    riasec: { R: 4.1, I: 4.8, A: 2.1, S: 3.5, E: 2.9, C: 3.8 },
    codeHolland: "IRA",
    comportementales: { stress: 5, social: 3, autonomie: 5, adaptabilite: 4 },
    recommandation: {
      categorie: "Sciences de la Santé",
      top3: [
        { branche: "Médecine",        score: 91 },
        { branche: "Pharmacie",       score: 83 },
        { branche: "Biotechnologie",  score: 76 },
      ],
      explication: "Excellent profil scientifique — forte autonomie et résistance au stress.",
    },
  },
];

// ── HELPERS ──
const STATUT_CONFIG: Record<Statut, { label: string; color: string; bg: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", color: "text-amber-600",  bg: "bg-amber-50  border-amber-200",  dot: "bg-amber-500"  },
  VALIDEE:    { label: "Validée",    color: "text-green-600",  bg: "bg-green-50  border-green-200",  dot: "bg-green-500"  },
  AJUSTEE:    { label: "Ajustée",    color: "text-orange-600", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  REJETEE:    { label: "Rejetée",    color: "text-red-600",    bg: "bg-red-50    border-red-200",    dot: "bg-red-500"    },
};

// Carrés visuels pour variables comportementales (sur 5)
function ScoreCarres({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-sm ${
            i < score ? "bg-blue-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── PAGE PRINCIPALE ──
export default function ConseillerDashboard() {
  const [dossiers, setDossiers]           = useState<Dossier[]>(DOSSIERS);
  const [selected, setSelected]           = useState<Dossier>(DOSSIERS[0]);
  const [filtreStatut, setFiltreStatut]   = useState<Statut | "TOUS">("TOUS");
  const [actionFaite, setActionFaite]     = useState<string | null>(null);

  // Compteurs
  const nbAttente  = dossiers.filter((d) => d.statut === "EN_ATTENTE").length;
  const nbValidees = dossiers.filter((d) => d.statut === "VALIDEE").length;

  // Dossiers filtrés
  const dossiersFiltres = filtreStatut === "TOUS"
    ? dossiers
    : dossiers.filter((d) => d.statut === filtreStatut);

  // Actions conseiller — TODO: remplacer par appels API
  const handleAction = (action: "VALIDEE" | "AJUSTEE" | "REJETEE") => {
    setDossiers((prev) =>
      prev.map((d) => d.id === selected.id ? { ...d, statut: action } : d)
    );
    setSelected((prev) => ({ ...prev, statut: action }));
    setActionFaite(action);
    setTimeout(() => setActionFaite(null), 3000);
  };

  const statut = STATUT_CONFIG[selected.statut];
  const peutAgir = selected.statut === "EN_ATTENTE";

  return (
    <div className="flex h-[calc(100vh-52px)]">

      {/* ── SIDEBAR GAUCHE ── */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

        {/* Compteurs */}
        <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-100">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-amber-600">{nbAttente}</p>
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide">En attente</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-600">{nbValidees}</p>
            <p className="text-xs text-green-500 font-semibold uppercase tracking-wide">Validées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-1 p-3 border-b border-gray-100 flex-wrap">
          {(["TOUS", "EN_ATTENTE", "VALIDEE", "AJUSTEE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltreStatut(f)}
              className={`
                px-2 py-1 rounded-lg text-xs font-semibold transition-all
                ${filtreStatut === f
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }
              `}
            >
              {f === "TOUS" ? "Tous" : f.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Liste dossiers */}
        <div className="flex-1 overflow-y-auto">
          {dossiersFiltres.map((dossier) => {
            const s = STATUT_CONFIG[dossier.statut];
            const isSelected = dossier.id === selected.id;
            return (
              <button
                key={dossier.id}
                onClick={() => setSelected(dossier)}
                className={`
                  w-full text-left p-4 border-b border-gray-100
                  transition-all duration-150
                  ${isSelected
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                    {dossier.prenom} {dossier.nom}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className={`text-xs font-semibold ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Série {dossier.serie} · {dossier.lycee.replace("Lycée ", "")}
                </p>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">{dossier.dateSubmission}</p>
                  <p className={`text-xs font-bold ${
                    dossier.scoreConfiance >= 75 ? "text-green-600" :
                    dossier.scoreConfiance >= 50 ? "text-amber-600" : "text-red-500"
                  }`}>
                    {dossier.scoreConfiance}% conf.
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <main className="flex-1 overflow-y-auto p-5">

        {/* Header dossier */}
        <div className="bg-gray-800 text-white rounded-2xl p-5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              {selected.prenom[0]}{selected.nom[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {selected.prenom} {selected.nom}
              </h2>
              <p className="text-sm text-gray-400">
                {selected.serie} · {selected.lycee} · Dossier #{selected.numero}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statut.bg}`}>
            <div className={`w-2 h-2 rounded-full ${statut.dot} ${selected.statut === "EN_ATTENTE" ? "animate-pulse" : ""}`} />
            <span className={`text-xs font-bold ${statut.color}`}>
              {statut.label}
            </span>
          </div>
        </div>

        {/* Toast action */}
        {actionFaite && (
          <div className={`
            mb-4 p-3 rounded-xl border text-sm font-semibold flex items-center gap-2
            ${actionFaite === "VALIDEE"
              ? "bg-green-50 border-green-200 text-green-700"
              : actionFaite === "AJUSTEE"
              ? "bg-orange-50 border-orange-200 text-orange-700"
              : "bg-red-50 border-red-200 text-red-700"
            }
          `}>
            {actionFaite === "VALIDEE" && <Check className="w-4 h-4" />}
            {actionFaite === "AJUSTEE" && <Pencil className="w-4 h-4" />}
            {actionFaite === "REJETEE" && <X className="w-4 h-4" />}
            Dossier {actionFaite === "VALIDEE" ? "approuvé" : actionFaite === "AJUSTEE" ? "ajusté" : "rejeté"} avec succès
          </div>
        )}

        {/* Grille 1 — Académique + RIASEC */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Académique */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Académique
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Moy. globale", value: selected.academique.moyGlobale, color: "text-blue-600" },
                { label: "Sciences",     value: selected.academique.moySciences, color: "text-green-600" },
                { label: "Lettres",      value: selected.academique.moyLettres,  color: "text-amber-500" },
              ].map((item) => (
                <div key={item.label}>
                  <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIASEC */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Profil RIASEC
                </h3>
              </div>
              <span className="text-lg font-black text-blue-600 tracking-wider">
                · {selected.codeHolland}
              </span>
            </div>
            <RiasecRadar scores={selected.riasec} />
          </div>

        </div>

        {/* Grille 2 — Comportementales + Recommandation */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Variables comportementales */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Variables comportementales
              </h3>
            </div>
            <div className="space-y-3">
              {Object.entries(selected.comportementales).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize w-24">{key}</span>
                  <div className="flex items-center gap-3">
                    <ScoreCarres score={val} />
                    <span className="text-xs font-bold text-gray-500 w-6">
                      {val}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandation ML */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Recommandation ML
              </h3>
            </div>

            <div className="flex items-start gap-3 mb-3">
              {/* Cercle score confiance */}
              <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="28"
                    fill="none" stroke="#10B981" strokeWidth="5"
                    strokeDasharray={`${(selected.scoreConfiance / 100) * 175.9} 175.9`}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <span className="text-sm font-black text-green-600">
                  {selected.scoreConfiance}%
                </span>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 mb-1">
                  Catégorie : {selected.recommandation.categorie}
                </p>
                {selected.recommandation.top3.map((item, i) => (
                  <p key={i} className="text-xs text-gray-700">
                    <span className="font-semibold">{i + 1}. {item.branche}</span>
                    {" — "}
                    <span className="text-green-600 font-bold">{item.score}%</span>
                  </p>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 italic leading-relaxed">
              {selected.recommandation.explication}
            </p>
          </div>

        </div>

        {/* ── ZONE D'ACTION OU DÉCISION ── */}
{peutAgir ? (
  /* Dossier EN_ATTENTE — affiche les 3 boutons */
  <div className="grid grid-cols-3 gap-3">
    <button
      onClick={() => handleAction("VALIDEE")}
      className="p-4 rounded-xl border-2 border-green-300 bg-green-50
        hover:bg-green-100 cursor-pointer text-left transition-all duration-150"
    >
      <div className="flex items-center gap-2 mb-1">
        <Check className="w-4 h-4 text-green-600" />
        <span className="text-sm font-bold text-green-700">Approuver</span>
      </div>
      <p className="text-xs text-green-600">ML correct, dossier cohérent</p>
    </button>

    <button
      onClick={() => handleAction("AJUSTEE")}
      className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50
        hover:bg-amber-100 cursor-pointer text-left transition-all duration-150"
    >
      <div className="flex items-center gap-2 mb-1">
        <Pencil className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-bold text-amber-700">Modifier</span>
      </div>
      <p className="text-xs text-amber-600">Ajuster la branche recommandée</p>
    </button>

    <button
      onClick={() => handleAction("REJETEE")}
      className="p-4 rounded-xl border-2 border-red-300 bg-red-50
        hover:bg-red-100 cursor-pointer text-left transition-all duration-150"
    >
      <div className="flex items-center gap-2 mb-1">
        <X className="w-4 h-4 text-red-600" />
        <span className="text-sm font-bold text-red-700">Rejeter</span>
      </div>
      <p className="text-xs text-red-600">Données incohérentes / profil ambigu</p>
    </button>
  </div>
) : (
  /* Dossier déjà traité — affiche la décision */
  <div className={`
    flex items-start gap-4 p-5 rounded-xl border-2
    ${selected.statut === "VALIDEE"
      ? "bg-green-50 border-green-300"
      : selected.statut === "AJUSTEE"
      ? "bg-amber-50 border-amber-300"
      : "bg-red-50 border-red-300"
    }
  `}>
    {/* Icône décision */}
    <div className={`
      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
      ${selected.statut === "VALIDEE"
        ? "bg-green-500"
        : selected.statut === "AJUSTEE"
        ? "bg-amber-500"
        : "bg-red-500"
      }
    `}>
      {selected.statut === "VALIDEE" && <Check className="w-5 h-5 text-white" strokeWidth={2.5} />}
      {selected.statut === "AJUSTEE" && <Pencil className="w-5 h-5 text-white" />}
      {selected.statut === "REJETEE" && <X className="w-5 h-5 text-white" strokeWidth={2.5} />}
    </div>

    {/* Texte décision */}
    <div>
      <p className={`text-sm font-bold mb-1 ${
        selected.statut === "VALIDEE" ? "text-green-700" :
        selected.statut === "AJUSTEE" ? "text-amber-700" : "text-red-700"
      }`}>
        Décision : {selected.statut === "VALIDEE" ? "VALIDÉE" : selected.statut} par M. Ndiaye · {
          selected.statut === "VALIDEE" ? "26 Avr 2025 10:15" :
          selected.statut === "AJUSTEE" ? "24 Avr 2025 12:30" :
          "23 Avr 2025 09:10"
        }
      </p>
      <p className={`text-sm leading-relaxed ${
        selected.statut === "VALIDEE" ? "text-green-600" :
        selected.statut === "AJUSTEE" ? "text-amber-600" : "text-red-600"
      }`}>
        {selected.statut === "VALIDEE"
          ? "Recommandation pertinente. Le profil R dominant et les excellentes notes en physique confirment clairement l'orientation Génie Civil. Félicitations, continuez dans cette voie !"
          : selected.statut === "AJUSTEE"
          ? "Profil artistique fort mais orientation ajustée vers Communication & RP — plus adapté aux débouchés disponibles localement."
          : "Profil trop homogène — toutes les réponses autour de 3/5 suggèrent un test rempli sans attention. Merci de refaire le test sérieusement."
        }
      </p>
    </div>
  </div>
)}
      </main>
    </div>
  );
}