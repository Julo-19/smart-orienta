"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Rocket, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import StepIndicator from "@/components/lyceen/StepIndicator";
import Button from "@/components/ui/button";
import { enregistrerContexte } from "@/lib/api";
import { getToken } from "@/lib/auth";

const CONTRAINTES = [
  "Contrainte financière",
  "Mobilité géographique limitée",
  "Situation de handicap",
  "Charge familiale",
  "Besoin de travailler en parallèle",
];

export default function ContextePage() {
  const router = useRouter();

  const [contraintes, setContraintes]           = useState<string[]>([]);
  const [passion, setPassion]                   = useState("");
  const [filieresRefusees, setFilieresRefusees] = useState("");
  const [messageConseiller, setMessageConseiller] = useState("");
  const [isLoading, setIsLoading]               = useState(false);

  const toggleContrainte = (c: string) => {
    setContraintes((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

    const [error, setError] = useState("");

  const handleLancerML = async () => {
    setError("");
    setIsLoading(true);
    try {
      await enregistrerContexte({
        contraintes: contraintes.join(", "),
        passions: passion,
        filieresRefusees: filieresRefusees,
        messageConseiller: messageConseiller,
      });
      router.push("/lyceen/resultats");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <StepIndicator currentStep={3} />

              {error && (
          <div className="max-w-4xl mx-auto px-6 mb-5">
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm
              rounded-lg px-4 py-3">
              {error}
            </div>
          </div>
        )}

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── COLONNE GAUCHE — Contraintes ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-1">
              Contraintes particulières
            </h3>
            <p className="text-xs text-amber-600 flex items-center gap-1 mb-5">
              <Lock className="w-3 h-3" />
              Visible uniquement par votre conseiller assigné
            </p>

            <div className="space-y-3">
              {CONTRAINTES.map((c) => {
                const checked = contraintes.includes(c);
                return (
                  <label
                    key={c}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => toggleContrainte(c)}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded border-2 flex items-center
                        justify-content flex-shrink-0 transition-all duration-150
                        ${checked
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 group-hover:border-blue-400"
                        }
                      `}
                    >
                      {checked && (
                        <svg
                          className="w-3 h-3 text-white mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 select-none">
                      {c}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── COLONNE DROITE — Textes libres ── */}
          <div className="space-y-4">

            {/* Passion */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Ma passion / Domaine attractif
              </h3>
              <textarea
                value={passion}
                onChange={(e) => setPassion(e.target.value)}
                placeholder="Je suis passionné(e) par..."
                rows={3}
                className="w-full text-sm text-gray-700 placeholder-gray-300
                  border border-gray-200 rounded-lg p-3 resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-100
                  focus:border-blue-400 transition-all"
              />
            </div>

            {/* Filières refusées */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Filière(s) refusée(s)
              </h3>
              <textarea
                value={filieresRefusees}
                onChange={(e) => setFilieresRefusees(e.target.value)}
                placeholder="Je ne veux pas faire..."
                rows={2}
                className="w-full text-sm text-gray-700 placeholder-gray-300
                  border border-gray-200 rounded-lg p-3 resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-100
                  focus:border-blue-400 transition-all"
              />
            </div>

            {/* Message conseiller */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Message libre au conseiller{" "}
                <span className="text-blue-400 normal-case font-normal">
                  (optionnel)
                </span>
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Tout contexte jugé important non capturé par le test
              </p>
              <textarea
                value={messageConseiller}
                onChange={(e) => setMessageConseiller(e.target.value)}
                placeholder="Informations supplémentaires pour votre conseiller..."
                rows={3}
                className="w-full text-sm text-gray-700 placeholder-gray-300
                  border border-gray-200 rounded-lg p-3 resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-100
                  focus:border-blue-400 transition-all"
              />
            </div>

          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          <Button onClick={handleLancerML}
            isLoading={isLoading}
            >
                <Rocket className="w-4 h-4" />
                Lancer l'analyse ML
          </Button>
        </div>

      </div>
    </div>
  );
}