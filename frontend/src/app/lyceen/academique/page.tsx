"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/lyceen/StepIndicator";
import NoteInput from "@/components/lyceen/NoteInput";
import { SERIES_CONFIG, calculerMoyenne, Serie } from "@/lib/seriesConfig";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";

const SERIES: Serie[] = ["S1", "S2", "S3", "L1", "L2", "G"];

export default function AcademiquePage() {
  const router = useRouter();

  const [selectedSerie, setSelectedSerie] = useState<Serie>("S2");
  const [notes, setNotes] = useState<Record<string, number | null>>({});
  const [moyenne, setMoyenne] = useState<number | null>(null);
  const [saveTimer, setSaveTimer] = useState<number>(30);

  useEffect(() => {
    const config = SERIES_CONFIG[selectedSerie];
    const allFilled = config.matieres.every(
      (m) => notes[m.nom] !== null && notes[m.nom] !== undefined
    );
    setMoyenne(allFilled ? calculerMoyenne(notes, selectedSerie) : null);
  }, [notes, selectedSerie]);

  const handleSerieChange = (serie: Serie) => {
    setSelectedSerie(serie);
    setNotes({});
    setMoyenne(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSaveTimer((t) => {
        if (t <= 1) {
          console.log("Sauvegarde auto", { selectedSerie, notes });
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSerie, notes]);

  const handleNoteChange = (matiere: string, value: number | null) => {
    setNotes((prev) => ({ ...prev, [matiere]: value }));
  };

  const config = SERIES_CONFIG[selectedSerie];
  const matieresCommunnes  = config.matieres.filter((m) => m.groupe === "commune");
  const matieresSpecialite = config.matieres.filter((m) => m.groupe === "specialite");

  return (
    <div>
      {/* STEP INDICATOR */}
      <StepIndicator currentStep={1} />

      {/* CONTENU */}
      <div className="max-w-4xl mx-auto px-6 pb-12">

        {/* Sélection série */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">
            Série du Baccalauréat
          </h2>
          <div className="flex flex-wrap gap-2">
            {SERIES.map((serie) => (
              <button
                key={serie}
                onClick={() => handleSerieChange(serie)}
                className={`
                  px-4 py-2 rounded-lg border-2 text-sm font-semibold
                  transition-all duration-150
                  ${selectedSerie === serie
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }
                `}
              >
                {serie}
              </button>
            ))}
          </div>
          
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {selectedSerie} — {config.description}
          </p>
          
        </div>

        {/* Grilles de notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Matières communes
            </h3>
            {matieresCommunnes.map((matiere) => (
              <NoteInput
                key={matiere.nom}
                matiere={matiere.nom}
                coefficient={matiere.coefficient}
                value={notes[matiere.nom] ?? null}
                onChange={(val) => handleNoteChange(matiere.nom, val)}
              />
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Matières de spécialité
            </h3>
            {matieresSpecialite.map((matiere) => (
              <NoteInput
                key={matiere.nom}
                matiere={matiere.nom}
                coefficient={matiere.coefficient}
                value={notes[matiere.nom] ?? null}
                onChange={(val) => handleNoteChange(matiere.nom, val)}
              />
            ))}
          </div>

        </div>

        {/* Moyenne pondérée */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Moyenne pondérée globale
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Calculée avec coefficients officiels ·{" "}
                <span className="text-blue-500">
                  Sauvegarde auto dans {saveTimer}s
                </span>
              </p>
            </div>
            <div>
              {moyenne !== null ? (
                <span className="text-4xl font-bold text-green-600">
                  {moyenne.toFixed(2)}
                  <span className="text-lg text-gray-400 font-normal">/20</span>
                </span>
              ) : (
                <span className="text-2xl font-bold text-gray-300">— /20</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
           {/*Bouton Retour*/}
            <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
            </Button>
          {/*Bouton Continuer*/}
            <Button
            onClick={() => router.push("/lyceen/riasec")}
            disabled={moyenne === null}
            >
            Continuer
            <ArrowRight className="w-4 h-4" />
            </Button>
        </div>

      </div>
    </div>
  );
}