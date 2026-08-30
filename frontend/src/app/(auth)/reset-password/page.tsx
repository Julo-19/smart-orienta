"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";

const API_URL = "http://localhost:8080";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Lien invalide : aucun jeton n'a été fourni.");
      return;
    }
    if (motDePasse.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (motDePasse !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: motDePasse }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Lien invalide ou expiré");
      }

      setSucces(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opération impossible");
    } finally {
      setIsLoading(false);
    }
  };

  const champClasse =
    "w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl text-sm " +
    "focus:outline-none focus:border-green-500 transition-all";

  return (
    <div className="min-h-screen grid grid-cols-2">

      <div className="flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">

          <p className="text-sm text-gray-500 mb-1">
            Bienvenue sur{" "}
            <span className="font-bold text-gray-800">Smart Orienta.</span>
          </p>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Définissez votre mot de passe
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Choisissez un mot de passe pour accéder à votre espace.
          </p>

          {succes ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-green-700 mb-1">
                Mot de passe enregistré
              </p>
              <p className="text-xs text-green-600">
                Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm
                  rounded-lg px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nouveau mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      placeholder="••••••••"
                      className={champClasse}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Huit caractères au minimum.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirmation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      placeholder="••••••••"
                      className={champClasse}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider
                    transition-all duration-150
                    ${isLoading
                      ? "bg-green-400 cursor-wait text-white"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-sm"}`}
                >
                  {isLoading ? "Enregistrement…" : "Enregistrer"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="bg-green-600 flex flex-col items-center justify-between p-10">
        <div className="self-start">
          <Image src="/logo.png" alt="SmartOrienta" width={140} height={40} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Image
            src="/img2.png"
            alt="SmartOrienta"
            width={350}
            height={450}
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">Chargement…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}