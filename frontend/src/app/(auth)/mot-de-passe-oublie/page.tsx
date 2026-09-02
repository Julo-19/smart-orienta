"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:8080";

export default function MotDePasseOubliePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [envoye, setEnvoye] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Veuillez saisir votre adresse électronique.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Demande impossible");
      }

      setEnvoye(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demande impossible");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">

      <div className="flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">

          <p className="text-sm text-gray-500 mb-1">
            Bienvenue sur{" "}
            <span className="font-bold text-gray-800">Smart Orienta.</span>
          </p>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Mot de passe oublié
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Saisissez votre adresse : un lien de réinitialisation vous sera envoyé.
          </p>

          {envoye ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-6">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-green-700 text-center mb-1">
                Demande enregistrée
              </p>
              <p className="text-xs text-green-600 text-center leading-relaxed">
                Si un compte existe pour cette adresse, un lien de réinitialisation
                vient d'y être envoyé. Il est valable vingt-quatre heures.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-5 w-full py-3 rounded-xl text-sm font-bold uppercase
                  tracking-wider bg-green-600 hover:bg-green-700 text-white transition-all"
              >
                Retour à la connexion
              </button>
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
                    Adresse électronique <span className="text-red-500">*</span>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider
                    transition-all duration-150
                    ${isLoading
                      ? "bg-green-400 cursor-wait text-white"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-sm"}`}
                >
                  {isLoading ? "Envoi en cours…" : "Envoyer le lien"}
                </button>
              </form>

              <button
                onClick={() => router.push("/login")}
                className="mt-6 w-full flex items-center justify-center gap-2 text-sm
                  text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </button>
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
            width={585}
            height={400}
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

    </div>
  );
}