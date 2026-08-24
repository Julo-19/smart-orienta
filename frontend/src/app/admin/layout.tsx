import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <Image 
          src="/logo.png" alt="SmartOrienta" 
          width={200} 
          height={50}
          priority
          className="p-4"
         />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">Admin Système</p>
            <p className="text-xs text-gray-400">Administrateur</p>
          </div>
          <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
            A
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}