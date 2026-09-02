"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { logout } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [initiales, setInitiales] = useState("A");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("email") ?? "";
    const identifiant = email.split("@")[0] || "Administrateur";
    setNom(identifiant);
    setInitiales(identifiant.slice(0, 2).toUpperCase());
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

        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="SmartOrienta" width={80} height={20} priority />
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-purple-500/20 border border-purple-400/30">
            <Shield className="w-3 h-3 text-purple-300" />
            <span className="text-xs font-semibold text-purple-200">Administration</span>
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOuvert((o) => !o)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <p className="text-sm font-semibold">{nom}</p>
              <p className="text-xs text-gray-400">Administrateur</p>
            </div>
            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center
              justify-center font-bold text-sm">
              {initiales}
            </div>
          </button>

          {menuOuvert && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg
              border border-gray-200 py-2 z-50">
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