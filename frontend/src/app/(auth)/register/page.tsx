"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    prenom: "", nom: "", email: "",
    motDePasse: "", confirmMotDePasse: "",
  });
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [accepteCGU, setAccepteCGU]           = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [errors, setErrors]                   = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.prenom)           e.prenom = "Le prénom est requis";
    if (!form.nom)              e.nom    = "Le nom est requis";
    if (!form.email)            e.email  = "L'email est requis";
    if (!form.motDePasse)       e.motDePasse = "Le mot de passe est requis";
    if (form.motDePasse.length < 8) e.motDePasse = "Minimum 8 caractères";
    if (form.motDePasse !== form.confirmMotDePasse)
      e.confirmMotDePasse = "Les mots de passe ne correspondent pas";
    if (!accepteCGU) e.cgu = "Vous devez accepter les conditions";
    return e;
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      await register(form.email, form.motDePasse, form.nom, form.prenom);
      router.push("/login?inscription=ok");
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Inscription impossible",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: "prenom",           label: "Prénom",                   type: "text",     icon: <User className="w-4 h-4 text-gray-400" />,  placeholder: "Aminata"              },
    { id: "nom",              label: "Nom",                      type: "text",     icon: <User className="w-4 h-4 text-gray-400" />,  placeholder: "Diallo"               },
    { id: "email",            label: "Adresse Email",            type: "email",    icon: <Mail className="w-4 h-4 text-gray-400" />,  placeholder: "votre@email.com"      },
    { id: "motDePasse",       label: "Mot de passe",             type: "password", icon: <Lock className="w-4 h-4 text-gray-400" />,  placeholder: "••••••••"             },
    { id: "confirmMotDePasse",label: "Confirmer le mot de passe",type: "password", icon: <Lock className="w-4 h-4 text-gray-400" />,  placeholder: "••••••••"             },
  ];

  return (
    <div className="min-h-screen grid grid-cols-2">

      {/* ── COLONNE GAUCHE — Formulaire ── */}
      <div className="flex items-center justify-center p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          <p className="text-sm text-gray-500 mb-1">
            Bienvenue sur{" "}
            <span className="font-bold text-gray-800">Smart Orienta.</span>
          </p>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Créer un compte
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Obtenez votre orientation sans déplacement.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => {
              const isPassword = field.type === "password";
              const showToggle = field.id === "motDePasse" ? showPassword : showConfirm;
              const setToggle  = field.id === "motDePasse"
                ? () => setShowPassword(!showPassword)
                : () => setShowConfirm(!showConfirm);

              return (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      {field.icon}
                    </span>
                    <input
                      type={isPassword ? (showToggle ? "text" : "password") : field.type}
                      value={form[field.id as keyof typeof form]}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`
                        w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm
                        focus:outline-none transition-all
                        ${errors[field.id]
                          ? "border-red-400 focus:border-red-400"
                          : "border-gray-200 focus:border-green-500"
                        }
                      `}
                    />
                    {isPassword && (
                      <button
                        type="button"
                        onClick={setToggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showToggle
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                    )}
                  </div>
                  {errors[field.id] && (
                    <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
                  )}
                </div>
              );
            })}

            {/* CGU */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <div
                  onClick={() => setAccepteCGU(!accepteCGU)}
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    flex-shrink-0 mt-0.5 transition-all
                    ${accepteCGU ? "bg-green-600 border-green-600" : "border-gray-300"}
                  `}
                >
                  {accepteCGU && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  J'accepte les{" "}
                  <span className="text-green-600 font-semibold cursor-pointer hover:underline">
                    conditions générales
                  </span>
                  {" "}et la{" "}
                  <span className="text-green-600 font-semibold cursor-pointer hover:underline">
                    politique de confidentialité
                  </span>
                </span>
              </label>
              {errors.cgu && (
                <p className="text-xs text-red-500 mt-1">{errors.cgu}</p>
              )}
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider
                transition-all duration-150 mt-2
                ${isLoading
                  ? "bg-green-400 cursor-wait text-white"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                }
              `}
            >
              {isLoading ? "Création en cours..." : "Créer un compte"}
            </button>

          </form>

          <p className="text-sm text-gray-500 text-center mt-5">
            Vous avez déjà un compte ?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-green-600 font-semibold hover:underline"
            >
              Se connecter
            </button>
          </p>

        </div>
      </div>

      {/* ── COLONNE DROITE — Visuel vert ── */}
      <div className="bg-green-600 flex flex-col items-center justify-between p-10">
        <div className="self-start">
          <Image src="/logo.png" alt="SmartOrienta" width={140} height={40} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Image
                src="/img3.png"
                alt="Lycéenne SmartOrienta"
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