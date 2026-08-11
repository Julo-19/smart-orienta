"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Clock, ArrowLeft } from "lucide-react";
import StepIndicator from "@/components/lyceen/StepIndicator";
import RiasecRadar from "@/components/lyceen/RiasecRadar";
import Button from "@/components/ui/button";
import { Dimension } from "@/lib/riasecQuestions";
import { Lightbulb } from "lucide-react";

//  MOCK DATA  sera remplacé par les données de l'API 
const mockResultats = {
  statut: "EN_ATTENTE" as const,
  conseiller: "M. Ndiaye (Conseiller Sciences)",

  // Scores RIASEC issus du test
  scoresRIASEC: {
    R: 2.4, I: 4.2, A: 3.0,
    S: 2.8, E: 3.4, C: 2.6,
  } as Record<Dimension, number>,
  codeHolland: "IEA",

  // Prédictions ML
  categorie: "Sciences & Tech",
  top3: [
    { rang: 1, branche: "Informatique & IA",       categorie: "Sciences & Technologie", score: 87 },
    { rang: 2, branche: "Génie Électrique",         categorie: "Sciences & Technologie", score: 79 },
    { rang: 3, branche: "Mathématiques Appliquées", categorie: "Sciences & Technologie", score: 74 },
  ],

  // XAI — feature importance
  xai: [
    { variable: "note_maths",              label: "note_maths",               score: 32, color: "#3B82F6" },
    { variable: "score_I",                 label: "score_I (Investigateur)",  score: 28, color: "#8B5CF6" },
    { variable: "autonomie",               label: "autonomie",                score: 15, color: "#10B981" },
    { variable: "note_spe1",               label: "note_spe1 (Physique-Chimie)", score: 13, color: "#F59E0B" },
    { variable: "adaptabilite",            label: "adaptabilite",             score: 12, color: "#EF4444" },
  ],
  explicationTexte:
    "Votre profil est fortement ancré dans les sciences (note_maths élevée) et la curiosité analytique (score_I dominant). L'autonomie élevée renforce la compatibilité avec les filières d'ingénierie.",

  // Synthèse académique
  academique: {
    serie: "S2",
    moyennePonderee: 15.40,
    moyenneSciences: 16.50,
    moyenneLettres: 13.00,
  },
};

export default function ResultatsPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);

  const { statut, conseiller, scoresRIASEC, codeHolland,
          categorie, top3, xai, explicationTexte, academique } = mockResultats;

  // ── Export PDF ──
  const handleExportPDF = async () => {
    if (!pageRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF       = (await import("jspdf")).default;

      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f9fafb",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth  = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SmartOrienta_Resultats_${academique.serie}.pdf`);
    } catch (error) {
      console.error("Erreur export PDF:", error);
    }
  };

  return (
    <div>
      <StepIndicator currentStep={5} />

      {/* Zone capturée pour le PDF */}
      <div ref={pageRef} className="max-w-5xl mx-auto px-6 pb-12">

        {/* ── BANDEAU STATUT ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-700">
                Recommandation en attente de validation
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {conseiller} a reçu votre dossier. Délai maximum : 48h.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-600">
              En attente
            </span>
          </div>
        </div>

        {/* ── GRILLE PRINCIPALE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Profil RIASEC */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Profil RIASEC
              </h3>
              <div className="text-right">
                <p className="text-xs text-gray-400">Code Holland dominant</p>
                <p className="text-3xl font-black text-blue-600 tracking-wider">
                  {codeHolland}
                </p>
              </div>
            </div>
            <RiasecRadar scores={scoresRIASEC} />
          </div>

          {/* Top 3 recommandations */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Top 3 Recommandations ML
              </h3>
              <span className="text-xs text-gray-400">
                Catégorie : {categorie}
              </span>
            </div>

            <div className="space-y-3">
              {top3.map((item) => {
                const isFirst = item.rang === 1;
                return (
                  <div
                    key={item.rang}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border
                      transition-all duration-150
                      ${isFirst
                        ? "border-blue-200 bg-blue-50 shadow-sm"
                        : "border-gray-100 bg-gray-50"
                      }
                    `}
                  >
                    {/* Rang */}
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        font-bold text-sm flex-shrink-0
                        ${isFirst
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                        }
                      `}
                    >
                      {item.rang}
                    </div>

                    {/* Nom branche */}
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isFirst ? "text-gray-900" : "text-gray-700"}`}>
                        {item.branche}
                      </p>
                      <p className="text-xs text-gray-400">{item.categorie}</p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      {isFirst ? (
                        <div className="relative w-14 h-14 flex items-center justify-center">
                          <svg className="absolute inset-0" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                            <circle
                              cx="28" cy="28" r="24"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="4"
                              strokeDasharray={`${(item.score / 100) * 150.8} 150.8`}
                              strokeLinecap="round"
                              transform="rotate(-90 28 28)"
                            />
                          </svg>
                          <span className="text-sm font-black text-green-600">
                            {item.score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-600">
                          {item.score}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── DEUXIÈME GRILLE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* XAI */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Explicabilité XAI
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Les 5 variables les plus influentes dans la décision ML
            </p>

            <div className="space-y-3 mb-4">
              {xai.map((item) => (
                <div key={item.variable}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">{item.label}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: item.color }}
                    >
                      {item.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${item.score}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Texte explication */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-blue-800 leading-relaxed">
                <Lightbulb className="w-3 h-3 inline mr-1 text-blue-600" />
                <span className="font-bold">Explication : </span>
                {explicationTexte}
              </p>
            </div>
          </div>

          {/* Synthèse académique */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                Synthèse académique
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Série",          value: academique.serie,            color: "text-blue-600",  big: true  },
                  { label: "Moy. pondérée",  value: `${academique.moyennePonderee}`, color: "text-green-600", big: true  },
                  { label: "Moy. sciences",  value: `${academique.moyenneSciences}`, color: "text-blue-500",  big: false },
                  { label: "Moy. lettres",   value: `${academique.moyenneLettres}`,  color: "text-amber-500", big: false },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className={`font-black ${item.color} ${item.big ? "text-3xl" : "text-2xl"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton Export PDF */}
            <button
              onClick={handleExportPDF}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3
                border-2 border-blue-300 text-blue-600 rounded-xl text-sm font-semibold
                hover:bg-blue-50 transition-all duration-150"
            >
              <FileText className="w-4 h-4" />
              Exporter en PDF
            </button>
          </div>

        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>

      </div>
    </div>
  );
}