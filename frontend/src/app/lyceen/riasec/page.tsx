"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/lyceen/StepIndicator";
import RiasecRadar from "@/components/lyceen/RiasecRadar";
import {
  QUESTIONS,
  DIMENSION_COLORS,
  DIMENSION_LABELS,
  LIKERT_LABELS,
  Dimension,
} from "@/lib/riasecQuestions";


// Dimensions RIASEC uniquement (pas les comportementales)
const RIASEC_DIMS: Dimension[] = ["R", "I", "A", "S", "E", "C"];

export default function RiasecPage() {
  const router = useRouter();

  // Réponses : { [questionId]: valeur 1-5 }
  const [reponses, setReponses] = useState<Record<number, number>>({});

  // Index de la question courante
  const [currentIndex, setCurrentIndex] = useState(0);
 
  const [shuffled] = useState<typeof QUESTIONS>(
  () => [...QUESTIONS].sort(() => Math.random() - 0.5)
);


  const currentQuestion = shuffled[currentIndex];
  const totalReponses   = Object.keys(reponses).length;
  const progression     = Math.round((totalReponses / QUESTIONS.length) * 100);
  const toutesRepondues = totalReponses === QUESTIONS.length;

  // Calcul des scores RIASEC en temps réel
  const scores = useMemo(() => {
    const s: Record<Dimension, { total: number; count: number }> = {
      R: { total: 0, count: 0 },
      I: { total: 0, count: 0 },
      A: { total: 0, count: 0 },
      S: { total: 0, count: 0 },
      E: { total: 0, count: 0 },
      C: { total: 0, count: 0 },
    };

    QUESTIONS.forEach((q) => {
      // On calcule uniquement pour les 30 questions RIASEC (id 1-30)
      if (q.id <= 30 && reponses[q.id] !== undefined) {
        s[q.dimension].total += reponses[q.id];
        s[q.dimension].count += 1;
      }
    });

    return Object.fromEntries(
      RIASEC_DIMS.map((dim) => [
        dim,
        s[dim].count > 0
          ? Math.round((s[dim].total / s[dim].count) * 10) / 10
          : 0,
      ])
    ) as Record<Dimension, number>;
  }, [reponses]);

  const handleReponse = (valeur: number) => {
    setReponses((prev) => ({ ...prev, [currentQuestion.id]: valeur }));
    // Avance automatiquement à la question suivante
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  };

  const handleContinuer = () => {
    router.push("/lyceen/contexte");
  };

  return (
    <div>
      <StepIndicator currentStep={2} />

      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── COLONNE GAUCHE — Questions ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Barre de progression */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500">
                  Progression
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {totalReponses}/34 réponses
                </span>
              </div>

              {/* Barre colorée */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progression}%`,
                    background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                  }}
                />
              </div>

              {/* Carrés de progression */}
              <div className="flex flex-wrap gap-1.5">
                {shuffled.map((q, idx) => {
                  const answered = reponses[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`
                        w-6 h-6 rounded transition-all duration-150
                        ${isCurrent
                          ? "ring-2 ring-offset-1 ring-blue-400 scale-110"
                          : ""
                        }
                      `}
                      style={{
                        background: answered
                          ? DIMENSION_COLORS[q.dimension]
                          : "#E5E7EB",
                      }}
                      title={`Q${idx + 1} — ${DIMENSION_LABELS[q.dimension]}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Carte question */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">

              {/* Badge dimension + numéro */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: DIMENSION_COLORS[currentQuestion.dimension] }}
                >
                  • {DIMENSION_LABELS[currentQuestion.dimension]}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Question {currentIndex + 1}/{QUESTIONS.length}
                </span>
              </div>

              {/* Texte question */}
              <p className="text-gray-800 font-medium text-base leading-relaxed mb-6">
                {currentQuestion.texte}
              </p>

              {/* Boutons Likert */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = reponses[currentQuestion.id] === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleReponse(val)}
                      className={`
                        flex-1 py-3 rounded-xl border-2 text-sm font-bold
                        transition-all duration-150 flex flex-col items-center gap-1
                        ${isSelected
                          ? "border-blue-600 bg-blue-600 text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }
                      `}
                    >
                      <span className="text-lg">{val}</span>
                      <span className="text-[10px] font-normal opacity-75">
                        {LIKERT_LABELS[val]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Précédent / Suivant */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((i) =>
                      Math.min(QUESTIONS.length - 1, i + 1)
                    )
                  }
                  disabled={currentIndex === QUESTIONS.length - 1}
                  className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant →
                </button>
              </div>
            </div>

          </div>

          {/* ── COLONNE DROITE — Radar ── */}
          <div className="lg:col-span-1">
            <RiasecRadar scores={scores} />
          </div>

        </div>

        {/* Navigation bas de page */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Retour
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              {totalReponses}/34 réponses
            </span>
            <button
              onClick={handleContinuer}
              disabled={!toutesRepondues}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150
                ${toutesRepondues
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              Continuer →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}