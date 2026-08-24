"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { getMonProfil } from "@/lib/api";
import { logout } from "@/lib/auth";

export default function LyceenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [nomComplet, setNomComplet] = useState("");
  const [sousTitre, setSousTitre] = useState("");
  const [initiales, setInitiales] = useState("");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // L'identité vient de la session ; la série, du profil scolaire
    const email = localStorage.getItem("email") ?? "";
    const nom = email.split("@")[0] || "Lycéen";
    setNomComplet(nom.charAt(0).toUpperCase() + nom.slice(1));
    setInitiales(nom.slice(0, 2).toUpperCase());

    getMonProfil()
      .then((p) => setSousTitre(`${p.niveau ?? ""} ${p.serieCode ?? ""}`.trim()))
      .catch(() => setSousTitre("Profil à compléter"));
  }, []);

  // Fermeture du menu au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOuvert(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">

        <Image 
          src="/logo.png"
          alt="SmartOrienta"
          width={200}
          height={50}
          priority
          className="p-4"
        />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOuvert((o) => !o)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <p className="text-sm font-semibold">{nomComplet}</p>
              <p className="text-xs text-gray-400">{sousTitre}</p>
            </div>
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center
              justify-center font-bold text-sm">
              {initiales}
            </div>
          </button>

          {menuOuvert && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg
              border border-gray-200 py-2 z-50">
              <button
                onClick={() => { setMenuOuvert(false); router.push("/lyceen/profil"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Mon profil
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </nav>

      {children}
    </div>
  );
}