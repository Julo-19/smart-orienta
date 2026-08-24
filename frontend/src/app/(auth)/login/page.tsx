"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { login, saveSession, homePathFor } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !motDePasse) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);

    try {
      const auth = await login(email, motDePasse);
      saveSession(auth);
      router.push(homePathFor(auth.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">

      {/* ── COLONNE GAUCHE — Formulaire ── */}
      <div className="flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">

          {/* En-tête */}
          <p className="text-sm text-gray-500 mb-1">
            Bienvenue sur{" "}
            <span className="font-bold text-gray-800">Smart Orienta.</span>
          </p>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Connectez-vous à votre compte
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Accédez à votre orientation en ligne.
          </p>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm
              rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
                    text-sm focus:outline-none focus:border-green-500 transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl
                    text-sm focus:outline-none focus:border-green-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-green-600 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider
                transition-all duration-150
                ${isLoading
                  ? "bg-green-400 cursor-wait text-white"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                }
              `}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>

          </form>

          {/* Lien inscription */}
          <p className="text-sm text-gray-500 text-center mt-6">
            Vous n'avez pas encore de compte ?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-green-600 font-semibold hover:underline"
            >
              Créer un compte
            </button>
          </p>

        </div>
      </div>

      {/* ── COLONNE DROITE — Visuel vert ── */}
      <div className="bg-green-600 flex flex-col items-center justify-between p-10">
        {/* Logo */}
        <div className="self-start">
          <Image
            src="/logo.png"
            alt="SmartOrienta"
            width={200}
            height={40}
          />
        </div>

        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <Image
            src="/img2.png"
            alt="Lycéen SmartOrienta"
            width={570}
            height={400}
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

    </div>
  );
}