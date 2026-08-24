import Image from "next/image";

const mockConseiller = {
  prenom: "Amadou",
  nom: "Ndiaye",
  specialite: "Conseiller Sciences",
};

export default function ConseillerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initiales = `${mockConseiller.prenom[0]}${mockConseiller.nom[0]}`;

  return (
   <nav className="bg-gray-900 text-white flex items-center justify-between">
  <Image
    src="/logo.png"
    alt="SmartOrienta"
    width={200}
    height={50}
    priority
    className="p-4"
  />

  <div className="flex items-center gap-3">
    <div className="text-right">
      <p className="text-sm font-semibold">
        M. {mockConseiller.prenom} {mockConseiller.nom}
      </p>
      <p className="text-xs text-gray-400">{mockConseiller.specialite}</p>
    </div>

    <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center font-bold text-sm">
      {initiales}
    </div>
  </div>
</nav>
  );
}