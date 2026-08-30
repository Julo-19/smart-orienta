"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { getMonProfilConseiller, enregistrerProfilConseiller } from "@/lib/api";
import { getToken } from "@/lib/auth";

const SPECIALITES = ["Sciences", "Lettres", "Gestion"];

export default function ProfilConseillerPage() {
  const router = useRouter();

  const [form, setForm] = useState({ etablissement: "", specialite: "Sciences" });
  const [existe, setExiste] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    getMonProfilConseiller()
      .then((p) => {
        setExiste(true);
        setForm({
          etablissement: p.etablissement ?? "",
          specialite: p.specialite ?? "Sciences",
        });
      })
      .catch(() => {
        // Aucun profil : le formulaire reste en création
      })
      .finally(() => setChargement(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSucces("");

    if (!form.etablissement.trim()) {
      setError("L'établissement est obligatoire.");
      return;
    }

    setIsLoading(true);
    try {
      await enregistrerProfilConseiller(form);
      if (existe) {
        setSucces("Vos informations ont été enregistrées.");
      } else {
        setSucces("Votre profil a été créé. Les lycéens vous sont désormais assignés.");
        setExiste(true);
        setTimeout(() => router.push("/conseiller/dashboard"), 2000);
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
        {existe ? "Mon profil" : "Complétez votre profil"}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        Ces informations déterminent les lycéens qui vous seront confiés :
        priorité est donnée à votre établissement, puis à votre spécialité.
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
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
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
            onChange={(e) => setForm({ ...form, etablissement: e.target.value })}
            placeholder="Lycée Seydina Limamou Laye"
            className={champClasse}
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Saisissez le nom exactement tel qu'il figure dans les dossiers des élèves.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Spécialité
          </label>
          <select
            value={form.specialite}
            onChange={(e) => setForm({ ...form, specialite: e.target.value })}
            className={champClasse}
          >
            {SPECIALITES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1.5">
            Sciences pour les séries S, Lettres pour les séries L, Gestion pour la série G.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          {existe && (
            <button
              type="button"
              onClick={() => router.push("/conseiller/dashboard")}
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
              : existe ? "Enregistrer" : "Créer mon profil"}
          </button>
        </div>

      </form>
    </div>
  );
}