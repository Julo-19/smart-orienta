"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { getMonProfilConseiller } from "@/lib/api";
import { logout } from "@/lib/auth";

export default function ConseillerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [initiales, setInitiales] = useState("");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("email") ?? "";
    const identifiant = email.split("@")[0] || "Conseiller";
    setNom(identifiant);
    setInitiales(identifiant.slice(0, 2).toUpperCase());

    getMonProfilConseiller()
      .then((p) => setSpecialite(`${p.specialite ?? ""} · ${p.etablissement ?? ""}`))
      .catch(() => setSpecialite("Profil à compléter"));
  }, []);

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
        <Image src="/logo.png" alt="SmartOrienta" width={80} height={20} priority />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOuvert((o) => !o)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <p className="text-sm font-semibold">{nom}</p>
              <p className="text-xs text-gray-400">{specialite}</p>
            </div>
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center
              justify-center font-bold text-sm">
              {initiales}
            </div>
          </button>

          {menuOuvert && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg
              border border-gray-200 py-2 z-50">
              <button
                onClick={() => { setMenuOuvert(false); router.push("/conseiller/profil"); }}
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