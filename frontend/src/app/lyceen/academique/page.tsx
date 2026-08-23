"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/lyceen/StepIndicator";
import NoteInput from "@/components/lyceen/NoteInput";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import { getMonProfil, getMatieres, saisirNote, Matiere, ProfileResponse } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AcademiquePage() {
  const router = useRouter();

  const [profil, setProfil] = useState<ProfileResponse | null>(null);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [notes, setNotes] = useState<Record<number, number | null>>({});
  const [semestre, setSemestre] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Chargement du profil, puis des matières de sa série
  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    getMonProfil()
      .then((p) => {
        setProfil(p);
        return getMatieres(p.serieId);
      })
      .then(setMatieres)
      .catch(() => {
        setError("Veuillez d'abord compléter votre profil scolaire.");
        setTimeout(() => router.push("/lyceen/profil"), 2000);
      });
  }, [router]);

  const handleNoteChange = (matiereId: number, value: number | null) => {
    setNotes((prev) => ({ ...prev, [matiereId]: value }));
  };

  // Moyenne pondérée, calculée localement pour l'affichage
  const moyenne = (() => {
    let somme = 0, coefs = 0;
    for (const m of matieres) {
      const note = notes[m.id];
      if (note === null || note === undefined) return null;
      somme += note * m.coefficient;
      coefs += m.coefficient;
    }
    return coefs === 0 ? null : Math.round((somme / coefs) * 100) / 100;
  })();

  const handleContinuer = async () => {
    setError("");
    setIsLoading(true);
    try {
      // Enregistrement de chaque note
      for (const m of matieres) {
        const valeur = notes[m.id];
        if (valeur !== null && valeur !== undefined) {
          await saisirNote({ matiereId: m.id, valeur, semestre });
        }
      }
      router.push("/lyceen/riasec");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <StepIndicator currentStep={1} />

      <div className="max-w-4xl mx-auto px-6 pb-12">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm
            rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Série du profil — affichage seul */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">
            Votre série
          </h2>
          <div className="inline-flex px-4 py-2 rounded-lg border-2 border-blue-600
            bg-blue-600 text-white text-sm font-semibold">
            {profil?.serieCode ?? "…"}
          </div>
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {profil?.serieLibelle ?? "Chargement…"}
          </p>
        </div>

        {/* Semestre */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">
            Semestre
          </h2>
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSemestre(s)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all
                  ${semestre === s
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"}`}
              >
                Semestre {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Vos matières
          </h3>
          {matieres.map((m) => (
            <NoteInput
              key={m.id}
              matiere={m.nom}
              coefficient={m.coefficient}
              value={notes[m.id] ?? null}
              onChange={(val) => handleNoteChange(m.id, val)}
            />
          ))}
        </div>

        {/* Moyenne */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Moyenne pondérée globale
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Calculée avec les coefficients officiels
              </p>
            </div>
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

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Button onClick={handleContinuer} disabled={moyenne === null || isLoading}>
            {isLoading ? "Enregistrement…" : "Continuer"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}