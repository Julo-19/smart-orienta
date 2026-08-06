"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Brain, ArrowLeft, ArrowRight } from "lucide-react";
import StepIndicator from "@/components/lyceen/StepIndicator";
import Button from "@/components/ui/button"

interface Etape {
  numero: number;
  titre: string;
  description: string;
  duree: number; // durée en ms avant de passer à l'étape suivante
}

const ETAPES: Etape[] = [
  {
    numero: 1,
    titre: "Validation des données",
    description: "Vérification plages [0–20], cohérence série/notes",
    duree: 1200,
  },
  {
    numero: 2,
    titre: "Preprocessing ML",
    description: "Normalisation [0–1], encodage one-hot des séries",
    duree: 1500,
  },
  {
    numero: 3,
    titre: "Inférence Niveau 1",
    description: "Classification parmi 9 catégories (Random Forest)",
    duree: 2000,
  },
  {
    numero: 4,
    titre: "Inférence Niveau 2",
    description: "Top 3 branches avec scores de compatibilité",
    duree: 1800,
  },
  {
    numero: 5,
    titre: "Module XAI",
    description: "Feature importance + génération explication dynamique",
    duree: 1500,
  },
  {
    numero: 6,
    titre: "Persistance & Notification",
    description: "Sauvegarde MySQL + notification conseiller (Kafka → SSE)",
    duree: 1000,
  },
];

type EtatEtape = "attente" | "en_cours" | "termine";

export default function AnalysePage() {
  const router = useRouter();

  // Index de l'étape en cours (-1 = pas encore démarré)
  const [etapeEnCours, setEtapeEnCours] = useState(0);
  const [etatsEtapes, setEtatsEtapes] = useState<EtatEtape[]>(
    ETAPES.map((_, i) => (i === 0 ? "en_cours" : "attente"))
  );
  const [termine, setTermine] = useState(false);

  useEffect(() => {
    // Lance la séquence d'étapes automatiquement
    let currentIndex = 0;

    const runEtape = (index: number) => {
      if (index >= ETAPES.length) {
        setTermine(true);
        return;
      }

      // Marque l'étape courante comme "en_cours"
      setEtapeEnCours(index);
      setEtatsEtapes((prev) => {
        const next = [...prev];
        next[index] = "en_cours";
        return next;
      });

      // Après la durée de l'étape, la marque comme "terminée"
      setTimeout(() => {
        setEtatsEtapes((prev) => {
          const next = [...prev];
          next[index] = "termine";
          return next;
        });
        // Passe à l'étape suivante
        runEtape(index + 1);
      }, ETAPES[index].duree);
    };

    runEtape(0);
  }, []);

  return (
    <div>
      <StepIndicator currentStep={4} />

      <div className="max-w-2xl mx-auto px-6 pb-12">

        {/* Icône cerveau animée */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {termine ? "Analyse terminée !" : "Analyse en cours..."}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {termine
              ? "Votre profil a été analysé avec succès"
              : "Le moteur ML traite votre profil composite"}
          </p>
        </div>

        {/* Liste des étapes */}
        <div className="space-y-3 mb-10">
          {ETAPES.map((etape, index) => {
            const etat = etatsEtapes[index];

            return (
              <div
                key={etape.numero}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border
                  transition-all duration-500
                  ${etat === "termine"
                    ? "bg-green-50 border-green-200"
                    : etat === "en_cours"
                    ? "bg-blue-50 border-blue-300 shadow-sm"
                    : "bg-white border-gray-200 opacity-50"
                  }
                `}
              >
                {/* Icône état */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    flex-shrink-0 transition-all duration-300
                    ${etat === "termine"
                      ? "bg-green-500"
                      : etat === "en_cours"
                      ? "bg-blue-600"
                      : "bg-gray-200"
                    }
                  `}
                >
                  {etat === "termine" ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  ) : etat === "en_cours" ? (
                    /* Spinner */
                    <svg
                      className="w-4 h-4 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">
                      {etape.numero}
                    </span>
                  )}
                </div>

                {/* Texte */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      etat === "attente" ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {etape.titre}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      etat === "attente" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {etape.description}
                  </p>
                </div>

                {/* Badge "En cours" */}
                {etat === "en_cours" && (
                  <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">
                    En cours...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          <Button
            onClick={() => router.push("/lyceen/resultats")}
            disabled={!termine}
          >
            Voir les résultats
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}