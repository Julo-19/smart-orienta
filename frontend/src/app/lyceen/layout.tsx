import Image from "next/image";

// Mock utilisateur — sera remplacé par les données JWT
const mockUser = { prenom: "Aminata", nom: "Diallo", serie: "S2" };

export default function LyceenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initiales = `${mockUser.prenom[0]}${mockUser.nom[0]}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR  partagée sur toutes les pages lycéen */}
      <nav className="bg-gray-900 text-white px-6 flex items-center justify-between">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="SmartOrienta"
          width={80}
          height= {20}
          
          priority
        />

        {/* Profil utilisateur */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">
              {mockUser.prenom} {mockUser.nom}
            </p>
            <p className="text-xs text-gray-400">
              Terminale {mockUser.serie}
            </p>
          </div>
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm">
            {initiales}
          </div>
        </div>

      </nav>

      {/* Pages lycéen s'affichent ici */}
      {children}

    </div>
  );
}