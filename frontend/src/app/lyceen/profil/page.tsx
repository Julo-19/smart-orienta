"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { getSeries, getMonProfil, creerProfil, modifierProfil, Serie } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function ProfilPage() {
  const router = useRouter();

  const [series, setSeries] = useState<Serie[]>([]);
  const [existe, setExiste] = useState(false);
  const [form, setForm] = useState({
    etablissement: "",
    matricule: "",
    niveau: "Terminale",
    region: "",
    dateNaissance: "",
    sexe: "M",
    serieId: 0,
  });
  const [chargement, setChargement] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    const charger = async () => {
      try {
        setSeries(await getSeries());
      } catch {
        setError("Impossible de charger les séries");
      }

      try {
        const p = await getMonProfil();
        setExiste(true);
        setForm({
          etablissement: p.etablissement ?? "",
          matricule: p.matricule ?? "",
          niveau: p.niveau ?? "Terminale",
          region: p.region ?? "",
          dateNaissance: p.dateNaissance ?? "",
          sexe: p.sexe ?? "M",
          serieId: p.serieId ?? 0,
        });
      } catch {
        // Aucun profil : le formulaire reste en création
      } finally {
        setChargement(false);
      }
    };

    charger();
  }, [router]);

  const handleChange = (champ: string, valeur: string | number) => {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
    setSucces("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSucces("");

    if (!form.etablissement || !form.dateNaissance || !form.serieId) {
      setError("L'établissement, la date de naissance et la série sont obligatoires.");
      return;
    }

    setIsLoading(true);
    try {
      if (existe) {
        await modifierProfil(form);
        setSucces("Vos informations ont été enregistrées.");
      } else {
        await creerProfil(form);
        router.push("/lyceen/academique");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setIsLoading(false);
    }
  };

  const champClasse =
    "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm " +
    "focus:outline-none focus:border-green-500 transition-all";

  // Bornes plausibles pour un lycéen
  const anneesEnMs = (n: number) => n * 365.25 * 24 * 3600 * 1000;
  const dateMax = new Date(Date.now() - anneesEnMs(14)).toISOString().split("T")[0];
  const dateMin = new Date(Date.now() - anneesEnMs(30)).toISOString().split("T")[0];

  if (chargement) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center text-gray-400">
        Chargement de votre profil…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      <h1 className="text-2xl font-black text-gray-900 mb-1">
        {existe ? "Mon profil scolaire" : "Votre profil scolaire"}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {existe
          ? "Vous pouvez corriger vos informations à tout moment."
          : "Ces informations permettent d'adapter les matières à votre série."}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm
          rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {succes && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm
          rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {succes}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Établissement <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.etablissement}
            onChange={(e) => handleChange("etablissement", e.target.value)}
            placeholder="Lycée Seydina Limamou Laye"
            className={champClasse}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Matricule
            </label>
            <input
              type="text"
              value={form.matricule}
              onChange={(e) => handleChange("matricule", e.target.value)}
              placeholder="SN2026-0142"
              className={champClasse}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Niveau
            </label>
            <select
              value={form.niveau}
              onChange={(e) => handleChange("niveau", e.target.value)}
              className={champClasse}
            >
              <option value="Seconde">Seconde</option>
              <option value="Première">Première</option>
              <option value="Terminale">Terminale</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Série <span className="text-red-500">*</span>
          </label>
          <select
            value={form.serieId}
            onChange={(e) => handleChange("serieId", Number(e.target.value))}
            className={champClasse}
          >
            <option value={0}>— Choisissez votre série —</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.libelle}
              </option>
            ))}
          </select>
          {existe && (
            <p className="text-xs text-amber-600 mt-1.5">
              Changer de série supprimera les notes déjà saisies.
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Région
            </label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => handleChange("region", e.target.value)}
              placeholder="Dakar"
              className={champClasse}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Naissance <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dateNaissance}
              onChange={(e) => handleChange("dateNaissance", e.target.value)}
              max={dateMax}
              min={dateMin}
              className={champClasse}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Sexe
            </label>
            <select
              value={form.sexe}
              onChange={(e) => handleChange("sexe", e.target.value)}
              className={champClasse}
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {existe && (
            <button
              type="button"
              onClick={() => router.push("/lyceen/academique")}
              className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider
                border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Retour
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider
              transition-all duration-150
              ${isLoading
                ? "bg-green-400 cursor-wait text-white"
                : "bg-green-600 hover:bg-green-700 text-white shadow-sm"}`}
          >
            {isLoading
              ? "Enregistrement…"
              : existe ? "Enregistrer les modifications" : "Continuer →"}
          </button>
        </div>

      </form>
    </div>
  );
}