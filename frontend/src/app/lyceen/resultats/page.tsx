"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Clock, CheckCircle, XCircle, ArrowLeft, Lightbulb } from "lucide-react";
import StepIndicator from "@/components/lyceen/StepIndicator";
import RiasecRadar from "@/components/lyceen/RiasecRadar";
import Button from "@/components/ui/button";
import { Dimension } from "@/lib/riasecQuestions";
import {
  demanderRecommandation, getMesRecommandations, getMonRiasec,
  getBulletin, getMonProfil, Recommandation, ProfilRiasecData,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function ResultatsPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);

  const [reco, setReco] = useState<Recommandation | null>(null);
  const [riasec, setRiasec] = useState<ProfilRiasecData | null>(null);
  const [serie, setSerie] = useState("—");
  const [moyenne, setMoyenne] = useState<number | null>(null);
  const [matieresRenseignees, setMatieresRenseignees] = useState<number | null>(null);
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    const charger = async () => {
      try {
        const [profilRiasec, profil] = await Promise.all([getMonRiasec(), getMonProfil()]);
        setRiasec(profilRiasec);
        setSerie(profil.serieCode);

        try {
          const bulletin = await getBulletin(1);
          setMoyenne(bulletin.moyenneGenerale);
          setMatieresRenseignees(bulletin.matieresRenseignees);
        } catch {
          // Aucun bulletin pour ce semestre
        }

        // Une recommandation existante est réutilisée ; sinon on en demande une
        const existantes = await getMesRecommandations();
        setReco(existantes.length > 0 ? existantes[0] : await demanderRecommandation());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chargement impossible");
      } finally {
        setChargement(false);
      }
    };

    charger();
  }, [router]);

  const scoresRIASEC = {
    R: riasec?.scoreR ?? 0, I: riasec?.scoreI ?? 0, A: riasec?.scoreA ?? 0,
    S: riasec?.scoreS ?? 0, E: riasec?.scoreE ?? 0, C: riasec?.scoreC ?? 0,
  } as Record<Dimension, number>;

  const codeHolland = riasec?.codeHolland ?? "—";
  const statut = reco?.statut ?? "EN_ATTENTE";
  const scorePourcent = reco ? Math.round(reco.scoreConfiance * 100) : 0;

  // Apparence du bandeau selon l'état de la décision
  const bandeau = {
    EN_ATTENTE: {
      fond: "bg-amber-50 border-amber-200", texte: "text-amber-700", sousTexte: "text-amber-600",
      icone: <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />,
      titre: "Recommandation en attente de validation",
      detail: "Votre conseiller a reçu votre dossier. Délai maximum : 48 h.",
      pastille: "bg-amber-500", libelle: "En attente",
    },
    VALIDEE: {
      fond: "bg-green-50 border-green-200", texte: "text-green-700", sousTexte: "text-green-600",
      icone: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />,
      titre: "Recommandation validée par votre conseiller",
      detail: reco?.commentaireConseiller || "Votre conseiller a confirmé cette orientation.",
      pastille: "bg-green-500", libelle: "Validée",
    },
    MODIFIEE: {
      fond: "bg-blue-50 border-blue-200", texte: "text-blue-700", sousTexte: "text-blue-600",
      icone: <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />,
      titre: `Orientation ajustée : ${reco?.brancheFinale ?? ""}`,
      detail: reco?.commentaireConseiller || "Votre conseiller a retenu une autre filière.",
      pastille: "bg-blue-500", libelle: "Modifiée",
    },
    REJETEE: {
      fond: "bg-red-50 border-red-200", texte: "text-red-700", sousTexte: "text-red-600",
      icone: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
      titre: "Recommandation écartée par votre conseiller",
      detail: reco?.commentaireConseiller || "",
      pastille: "bg-red-500", libelle: "Rejetée",
    },
  }[statut];

  const handleExportPDF = async () => {
    if (!pageRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(pageRef.current, {
        scale: 2, useCORS: true, backgroundColor: "#f9fafb",
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SmartOrienta_Resultats_${serie}.pdf`);
    } catch (error) {
      console.error("Erreur export PDF:", error);
    }
  };

  if (chargement) {
    return (
      <div>
        <StepIndicator currentStep={5} />
        <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-400">
          Analyse de votre dossier en cours…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <StepIndicator currentStep={5} />
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
          <Button variant="ghost" onClick={() => router.back()} >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator currentStep={5} />

      <div ref={pageRef} className="max-w-5xl mx-auto px-6 pb-12">

        {/* ── BANDEAU STATUT ── */}
        <div className={`${bandeau.fond} border rounded-xl p-4 mb-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {bandeau.icone}
            <div>
              <p className={`text-sm font-bold ${bandeau.texte}`}>{bandeau.titre}</p>
              <p className={`text-xs ${bandeau.sousTexte} mt-0.5`}>{bandeau.detail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${bandeau.pastille} ${statut === "EN_ATTENTE" ? "animate-pulse" : ""}`} />
            <span className={`text-xs font-semibold ${bandeau.sousTexte}`}>{bandeau.libelle}</span>
          </div>
        </div>

        {/* ── GRILLE PRINCIPALE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Profil RIASEC */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Profil RIASEC
              </h3>
              <div className="text-right">
                <p className="text-xs text-gray-400">Code Holland dominant</p>
                <p className="text-3xl font-black text-blue-600 tracking-wider">
                  {codeHolland}
                </p>
              </div>
            </div>
            <RiasecRadar scores={scoresRIASEC} />
          </div>

          {/* Recommandation */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Filière recommandée
              </h3>
              <span className="text-xs text-gray-400">
                Catégorie : {reco?.categorie ?? "—"}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center
                font-bold text-sm flex-shrink-0 bg-blue-600 text-white">
                1
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">
                  {reco?.branche ?? "—"}
                </p>
                <p className="text-xs text-gray-400">{reco?.categorie ?? ""}</p>
              </div>

              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="absolute inset-0" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none" stroke="#10B981" strokeWidth="4"
                    strokeDasharray={`${(scorePourcent / 100) * 150.8} 150.8`}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                  />
                </svg>
                <span className="text-sm font-black text-green-600">
                  {scorePourcent}%
                </span>
              </div>
            </div>

            {/* Filière retenue si le conseiller a modifié */}
            {statut === "MODIFIEE" && reco?.brancheFinale && (
              <div className="mt-3 flex items-center gap-4 p-4 rounded-xl border border-green-200 bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Filière retenue par le conseiller</p>
                  <p className="text-sm font-bold text-gray-900">{reco.brancheFinale}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              Indice de confiance du modèle. Cette proposition est soumise
              à la validation d'un conseiller d'orientation.
            </p>
          </div>

        </div>

        {/* ── DEUXIÈME GRILLE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Explicabilité */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
              Explicabilité
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Éléments ayant orienté la proposition du modèle
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-xs text-blue-800 leading-relaxed">
                <Lightbulb className="w-3 h-3 inline mr-1 text-blue-600" />
                <span className="font-bold">Explication : </span>
                {reco?.explication ?? "Aucune explication disponible."}
              </p>
            </div>

            <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
              L'analyse détaillée des variables les plus influentes sera fournie
              par le module d'explicabilité une fois celui-ci intégré.
            </p>
          </div>

          {/* Synthèse académique */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
                Synthèse académique
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Série", value: serie, color: "text-blue-600", big: true },
                  {
                    label: "Moy. pondérée",
                    value: moyenne !== null ? moyenne.toFixed(2) : "—",
                    color: "text-green-600", big: true,
                  },
                  {
                    label: "Matières saisies",
                    value: matieresRenseignees !== null ? `${matieresRenseignees}` : "—",
                    color: "text-blue-500", big: false,
                  },
                  {
                    label: "Confiance",
                    value: `${scorePourcent}%`,
                    color: "text-amber-500", big: false,
                  },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className={`font-black ${item.color} ${item.big ? "text-3xl" : "text-2xl"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3
                border-2 border-blue-300 text-blue-600 rounded-xl text-sm font-semibold
                hover:bg-blue-50 transition-all duration-150"
            >
              <FileText className="w-4 h-4" />
              Exporter en PDF
            </button>
          </div>

        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </div>

      </div>
    </div>
  );
}