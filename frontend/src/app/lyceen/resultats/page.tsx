"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock, CheckCircle, XCircle, ArrowLeft, Lightbulb,
  History, Download, Plus, Inbox,
} from "lucide-react";
import StepIndicator from "@/components/lyceen/StepIndicator";
import RiasecRadar from "@/components/lyceen/RiasecRadar";
import Button from "@/components/ui/button";
import { Dimension } from "@/lib/riasecQuestions";
import {
  demanderRecommandation, getMesRecommandations, getMonRiasec,
  getBulletin, getMonProfil, Recommandation, ProfilRiasecData, FacteurInfluent,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

// Libellés et styles par état — utilisés par le bandeau ET par l'historique
const LIBELLE: Record<string, string> = {
  EN_ATTENTE: "En attente", VALIDEE: "Validée",
  MODIFIEE: "Modifiée", REJETEE: "Rejetée",
};

const PASTILLE: Record<string, string> = {
  EN_ATTENTE: "bg-amber-50 text-amber-700 border-amber-200",
  VALIDEE:    "bg-green-50 text-green-700 border-green-200",
  MODIFIEE:   "bg-blue-50 text-blue-700 border-blue-200",
  REJETEE:    "bg-red-50 text-red-700 border-red-200",
};

export default function ResultatsPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);

  // L'historique est la source de vérité ; la recommandation affichée
  // n'est qu'une sélection dans cette liste (par défaut : la plus récente).
  const [historique, setHistorique] = useState<Recommandation[]>([]);
  const [selectionId, setSelectionId] = useState<number | null>(null);

  const [riasec, setRiasec] = useState<ProfilRiasecData | null>(null);
  const [serie, setSerie] = useState("—");
  const [moyenne, setMoyenne] = useState<number | null>(null);
  const [matieresRenseignees, setMatieresRenseignees] = useState<number | null>(null);
  const [chargement, setChargement] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
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
          // Aucun bulletin pour ce semestre — non bloquant
        }

        // Lecture seule : afficher la page ne crée JAMAIS de recommandation.
        // La demande est un acte explicite de l'élève (bouton ci-dessous).
        const existantes = await getMesRecommandations();
        setHistorique(existantes);
        setSelectionId(existantes.length > 0 ? existantes[0].id : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Chargement impossible");
      } finally {
        setChargement(false);
      }
    };

    charger();
  }, [router]);

  /** Demande explicite d'une nouvelle recommandation au service d'orientation. */
  const handleDemander = async () => {
    setEnvoiEnCours(true);
    setError("");
    try {
      const nouvelle = await demanderRecommandation();
      // On l'insère en tête : le backend trie déjà par date décroissante,
      // on reproduit cet ordre localement pour éviter un second appel réseau.
      setHistorique((prev) => [nouvelle, ...prev]);
      setSelectionId(nouvelle.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demande impossible");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const reco = historique.find((r) => r.id === selectionId) ?? null;

  // Un élève ne peut pas empiler les demandes tant qu'un conseiller
  // n'a pas tranché. Garde-fou visuel — le backend doit le refuser aussi.
  const aUneEnAttente = historique.some((r) => r.statut === "EN_ATTENTE");

  const scoresRIASEC = {
    R: riasec?.scoreR ?? 0, I: riasec?.scoreI ?? 0, A: riasec?.scoreA ?? 0,
    S: riasec?.scoreS ?? 0, E: riasec?.scoreE ?? 0, C: riasec?.scoreC ?? 0,
  } as Record<Dimension, number>;

  const codeHolland = riasec?.codeHolland ?? "—";
  const statut = reco?.statut ?? "EN_ATTENTE";
  const scorePourcent = reco ? Math.round(reco.scoreConfiance * 100) : 0;

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
      const html2canvas = (await import("html2canvas-pro")).default;
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

  const formaterDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });

  // ── ÉTATS DE CHARGEMENT ET D'ERREUR ──

  if (chargement) {
    return (
      <div>
        <StepIndicator currentStep={5} />
        <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-400">
          Chargement de votre dossier…
        </div>
      </div>
    );
  }

  // ── ÉTAT VIDE : aucune recommandation demandée à ce jour ──

  if (!reco) {
    return (
      <div>
        <StepIndicator currentStep={5} />
        <div className="max-w-5xl mx-auto px-6 py-12">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
            <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-800 mb-1">
              Aucune recommandation pour le moment
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Votre dossier est complet. Lancez l&apos;analyse pour obtenir
              une proposition d&apos;orientation.
            </p>
            <Button onClick={handleDemander} disabled={envoiEnCours}>
              <Plus className="w-4 h-4" />
              {envoiEnCours ? "Analyse en cours…" : "Demander une recommandation"}
            </Button>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── AFFICHAGE NORMAL ──

  return (
    <div>
      <StepIndicator currentStep={5} />

      <div ref={pageRef} className="max-w-5xl mx-auto px-6 pb-12">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

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
            {moyenne !== null && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                Série {serie} · Moyenne générale {moyenne.toFixed(2)}/20
                {matieresRenseignees !== null && ` · ${matieresRenseignees} matières`}
              </p>
            )}
          </div>

          {/* Recommandation */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Filière recommandée
              </h3>
              <span className="text-xs text-gray-400">
                {formaterDate(reco.dateGeneration)}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
              <div className="w-8 h-8 rounded-full flex items-center justify-center
                font-bold text-sm flex-shrink-0 bg-blue-600 text-white">
                1
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{reco.branche}</p>
                <p className="text-xs text-gray-400">{reco.categorie}</p>
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

            {statut === "MODIFIEE" && reco.brancheFinale && (
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
              à la validation d&apos;un conseiller d&apos;orientation.
            </p>
          </div>

        </div>

        {/* ── EXPLICABILITÉ ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
            Explicabilité
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Éléments ayant le plus pesé sur cette recommandation
          </p>

          {(() => {
            // Les facteurs SHAP arrivent sérialisés en JSON depuis le service ML.
            let facteurs: FacteurInfluent[] = [];
            try {
              facteurs = reco.facteurs ? JSON.parse(reco.facteurs) : [];
            } catch {
              facteurs = [];
            }

            const COULEURS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

            return facteurs.length > 0 ? (
              <div className="space-y-3 mb-4">
                {facteurs.map((f, i) => (
                  <div key={f.variable}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{f.libelle}</span>
                      <span className="text-xs font-bold" style={{ color: COULEURS[i % 5] }}>
                        {f.poids.toFixed(1)} %
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(f.poids * 4, 100)}%`, background: COULEURS[i % 5] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs text-blue-800 leading-relaxed">
              <Lightbulb className="w-3 h-3 inline mr-1 text-blue-600" />
              <span className="font-bold">Explication : </span>
              {reco.explication || "Aucune explication disponible."}
            </p>
          </div>
        </div>

        {/* ── HISTORIQUE ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <History className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Historique des recommandations
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                {historique.length} demande{historique.length > 1 ? "s" : ""} ·
                {" "}cliquez pour consulter le détail
              </p>
            </div>

            <div className="text-right">
              <Button
                variant="ghost"
                onClick={handleDemander}
                disabled={aUneEnAttente || envoiEnCours}
              >
                <Plus className="w-4 h-4" />
                {envoiEnCours ? "Analyse…" : "Nouvelle demande"}
              </Button>
              {aUneEnAttente && (
                <p className="text-xs text-gray-400 mt-1">
                  Une demande est déjà en cours d&apos;examen
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {historique.map((r) => {
              const actif = r.id === selectionId;
              const conf = Math.round(r.scoreConfiance * 100);

              return (
                <button
                  key={r.id}
                  onClick={() => setSelectionId(r.id)}
                  className={`w-full text-left flex items-center gap-4 p-3 rounded-lg border transition-colors
                    ${actif
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-100 bg-gray-50 hover:bg-gray-100"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {r.brancheFinale ?? r.branche}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.categorie} · {formaterDate(r.dateGeneration)}
                      {r.dateDecision && ` · décision le ${formaterDate(r.dateDecision)}`}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-gray-500 flex-shrink-0">{conf}%</span>

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0
                    ${PASTILLE[r.statut]}`}>
                    {LIBELLE[r.statut]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Button variant="ghost" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
            Exporter en PDF
          </Button>
        </div>

      </div>
    </div>
  );
}