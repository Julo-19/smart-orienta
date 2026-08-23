"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/lyceen/StepIndicator";
import RiasecRadar from "@/components/lyceen/RiasecRadar";
import Button from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  DIMENSION_COLORS,
  DIMENSION_LABELS,
  LIKERT_LABELS,
  Dimension,
} from "@/lib/riasecQuestions";
import { getQuestionsRiasec, soumettreRiasec, QuestionRiasec } from "@/lib/api";
import { getToken } from "@/lib/auth";

// Dimensions RIASEC uniquement (pas les comportementales)
const RIASEC_DIMS: Dimension[] = ["R", "I", "A", "S", "E", "C"];

export default function RiasecPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionRiasec[]>([]);
  const [reponses, setReponses] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Chargement des questions depuis l'API, puis mélange
  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    getQuestionsRiasec()
      .then((qs) => setQuestions([...qs].sort(() => Math.random() - 0.5)))
      .catch(() => setError("Impossible de charger le questionnaire"));
  }, [router]);

  const currentQuestion = questions[currentIndex];
  const totalReponses = Object.keys(reponses).length;
  const progression = questions.length
    ? Math.round((totalReponses / questions.length) * 100)
    : 0;
  const toutesRepondues = questions.length > 0 && totalReponses === questions.length;

  // Scores RIASEC calculés localement pour l'affichage du radar
  const scores = useMemo(() => {
    const s: Record<string, { total: number; count: number }> = {
      R: { total: 0, count: 0 },
      I: { total: 0, count: 0 },
      A: { total: 0, count: 0 },
      S: { total: 0, count: 0 },
      E: { total: 0, count: 0 },
      C: { total: 0, count: 0 },
    };

    questions.forEach((q) => {
      if (RIASEC_DIMS.includes(q.dimension as Dimension) && reponses[q.id] !== undefined) {
        s[q.dimension].total += reponses[q.id];
        s[q.dimension].count += 1;
      }
    });

    return Object.fromEntries(
      RIASEC_DIMS.map((dim) => [
        dim,
        s[dim].count > 0 ? Math.round((s[dim].total / s[dim].count) * 10) / 10 : 0,
      ])
    ) as Record<Dimension, number>;
  }, [reponses, questions]);

  const handleReponse = (valeur: number) => {
    setReponses((prev) => ({ ...prev, [currentQuestion.id]: valeur }));
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  };

  const handleContinuer = async () => {
    setError("");
    setIsLoading(true);
    try {
      const liste = Object.entries(reponses).map(([questionId, valeur]) => ({
        questionId: Number(questionId),
        valeur,
      }));
      await soumettreRiasec(liste);
      router.push("/lyceen/contexte");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setIsLoading(false);
    }
  };

  // Couleur et libellé, avec repli pour les dimensions comportementales
  const couleurDe = (dimension: string) =>
    DIMENSION_COLORS[dimension as Dimension] ?? "#9CA3AF";

  const libelleDe = (dimension: string) =>
    DIMENSION_LABELS[dimension as Dimension] ?? dimension;

  // Écran d'attente pendant le chargement
  if (!currentQuestion) {
    return (
      <div>
        <StepIndicator currentStep={2} />
        <div className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-400">
          {error || "Chargement du questionnaire…"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator currentStep={2} />

      <div className="max-w-5xl mx-auto px-6 pb-12">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm
            rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

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
                  {totalReponses}/{questions.length} réponses
                </span>
              </div>

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
                {questions.map((q, idx) => {
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
                        background: answered ? couleurDe(q.dimension) : "#E5E7EB",
                      }}
                      title={`Q${idx + 1} — ${libelleDe(q.dimension)}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Carte question */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">

              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: couleurDe(currentQuestion.dimension) }}
                >
                  • {libelleDe(currentQuestion.dimension)}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Question {currentIndex + 1}/{questions.length}
                </span>
              </div>

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
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  disabled={currentIndex === questions.length - 1}
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
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              {totalReponses}/{questions.length} réponses
            </span>
            <Button
              onClick={handleContinuer}
              disabled={!toutesRepondues || isLoading}
            >
              {isLoading ? "Enregistrement…" : "Continuer"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}