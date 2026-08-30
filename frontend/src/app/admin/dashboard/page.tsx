"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import {
  GraduationCap, Brain, Check, Clock, UserPlus, Settings,
  X as XIcon, CheckCircle, AlertCircle, BarChart3
} from "lucide-react";
import {
  creerConseiller, getStatistiques, getTousConseillers, getTousLyceens,
  StatistiquesResponse, ConseillerAdmin, LyceenAdmin,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

type Onglet = "overview" | "lyceens" | "conseillers" | "systeme";

const COULEURS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#06B6D4", "#EF4444", "#6B7280"];

const STATUT_STYLE: Record<string, { label: string; color: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", color: "text-amber-600",  dot: "bg-amber-500"  },
  VALIDEE:    { label: "Validée",    color: "text-green-600",  dot: "bg-green-500"  },
  MODIFIEE:   { label: "Modifiée",   color: "text-orange-500", dot: "bg-orange-500" },
  REJETEE:    { label: "Rejetée",    color: "text-red-600",    dot: "bg-red-500"    },
};

const SERIE_COULEUR: Record<string, string> = {
  S1: "bg-blue-100 text-blue-700",   S2: "bg-blue-100 text-blue-700",
  S3: "bg-blue-100 text-blue-700",   L1: "bg-purple-100 text-purple-700",
  L2: "bg-purple-100 text-purple-700", G: "bg-green-100 text-green-700",
};

// L'onglet Système reste illustratif : la supervision des services
// et les métriques des modèles ne sont pas encore exposées par l'API.
const MICROSERVICES = [
  { nom: "API Gateway", port: ":8080" }, { nom: "Auth Service", port: ":8081" },
  { nom: "Student Service", port: ":8082" }, { nom: "Orientation Service", port: ":8083" },
  { nom: "ML Service", port: ":8084" }, { nom: "Notification Service", port: ":8085" },
  { nom: "Eureka Server", port: ":8761" }, { nom: "Config Server", port: ":8888" },
];

const PARAMS_SYSTEME = [
  { label: "Règle d'assignation",       value: "Établissement → Spécialité → Charge" },
  { label: "Jeton d'accès",             value: "15 minutes" },
  { label: "Jeton de rafraîchissement", value: "7 jours" },
  { label: "Hachage des mots de passe", value: "bcrypt, coût 12" },
  { label: "Notes",                     value: "0 à 20, pondérées par coefficient" },
  { label: "Questionnaire",             value: "34 questions, échelle de 1 à 5" },
];

const ONGLETS = [
  { id: "overview",    label: "Vue d'ensemble", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "lyceens",     label: "Lycéens",        icon: <GraduationCap className="w-4 h-4" /> },
  { id: "conseillers", label: "Conseillers",    icon: <UserPlus className="w-4 h-4" /> },
  { id: "systeme",     label: "Système",        icon: <Settings className="w-4 h-4" /> },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>("overview");

  const [stats, setStats] = useState<StatistiquesResponse | null>(null);
  const [conseillers, setConseillers] = useState<ConseillerAdmin[]>([]);
  const [lyceens, setLyceens] = useState<LyceenAdmin[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");

  // Création d'un conseiller
  const [formOuvert, setFormOuvert] = useState(false);
  const [form, setForm] = useState({ email: "", nom: "", prenom: "" });
  const [enCours, setEnCours] = useState(false);
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");

  const charger = async () => {
    try {
      const [s, c, l] = await Promise.all([
        getStatistiques(), getTousConseillers(), getTousLyceens(),
      ]);
      setStats(s); setConseillers(c); setLyceens(l);
    } catch (err) {
      setErreurChargement(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    charger();
  }, [router]);

  const handleCreerConseiller = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(""); setSucces("");

    if (!form.email || !form.nom || !form.prenom) {
      setErreur("Tous les champs sont obligatoires.");
      return;
    }

    setEnCours(true);
    try {
      await creerConseiller(form);
      setSucces(`Le compte de ${form.prenom} ${form.nom} a été créé. `
              + `Un courriel lui a été envoyé pour définir son mot de passe.`);
      setForm({ email: "", nom: "", prenom: "" });
      setFormOuvert(false);
      charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setEnCours(false);
    }
  };

  // Données dérivées
  const statutsData = stats ? [
    { label: "Validées",   value: stats.validees,  color: "#10B981" },
    { label: "Modifiées",  value: stats.modifiees, color: "#F59E0B" },
    { label: "Rejetées",   value: stats.rejetees,  color: "#EF4444" },
    { label: "En attente", value: stats.enAttente, color: "#3B82F6" },
  ].filter((s) => s.value > 0) : [];

  const filieresData = stats
    ? Object.entries(stats.filieres).map(([name, value], i) => ({
        name: name.length > 12 ? name.slice(0, 11) + "…" : name,
        value, color: COULEURS[i % COULEURS.length],
      }))
    : [];

  const nomConseiller = (userId: number | null) => {
    if (userId === null) return "Non assigné";
    const c = conseillers.find((x) => x.userId === userId);
    return c ? `${c.specialite} · ${c.etablissement}` : `Conseiller #${userId}`;
  };

  if (chargement) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-400">
        Chargement des données…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {erreurChargement && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
          {erreurChargement}
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id as Onglet)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold
              border-b-2 transition-all duration-150
              ${onglet === o.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>

      {/* ── VUE D'ENSEMBLE ── */}
      {onglet === "overview" && (
        <div className="space-y-6">

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "LYCÉENS INSCRITS", value: lyceens.length,
                sub: `${lyceens.filter((l) => l.conseillerId !== null).length} suivis`,
                icon: <GraduationCap className="w-6 h-6 text-gray-400" />, color: "text-blue-600" },
              { label: "RECOMMANDATIONS", value: stats?.total ?? 0,
                sub: `${stats?.enAttente ?? 0} en attente`,
                icon: <Brain className="w-6 h-6 text-gray-400" />, color: "text-purple-600" },
              { label: "TAUX DE VALIDATION", value: `${stats?.tauxValidation ?? 0}%`,
                sub: `${(stats?.validees ?? 0) + (stats?.modifiees ?? 0)} approuvées`,
                icon: <Check className="w-6 h-6 text-gray-400" />, color: "text-green-600" },
              { label: "CONSEILLERS", value: conseillers.length,
                sub: `${conseillers.reduce((a, c) => a + c.nombreEtudiants, 0)} dossiers suivis`,
                icon: <Clock className="w-6 h-6 text-gray-400" />, color: "text-amber-500" },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {kpi.label}
                  </p>
                  {kpi.icon}
                </div>
                <p className={`text-4xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">

            {/* Statuts */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Statuts des recommandations
              </h3>
              {statutsData.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <PieChart width={120} height={120}>
                      <Pie data={statutsData} cx={55} cy={55} innerRadius={35}
                        outerRadius={55} dataKey="value" paddingAngle={2}>
                        {statutsData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm font-black text-gray-700">{stats?.total ?? 0}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {statutsData.map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                        <span className="text-xs text-gray-600">{s.label}</span>
                        <span className="text-xs font-bold text-gray-800 ml-auto pl-2">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">
                  Aucune recommandation générée.
                </p>
              )}
            </div>

            {/* Filières */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Filières recommandées
              </h3>
              {filieresData.length > 0 ? (
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={filieresData} barSize={18}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9CA3AF" }}
                      axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {filieresData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">Aucune donnée.</p>
              )}
            </div>

            {/* Activité */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Activité récente
              </h3>
              {stats && stats.activite.length > 0 ? (
                <div className="space-y-3">
                  {stats.activite.map((a) => {
                    const s = STATUT_STYLE[a.statut];
                    return (
                      <div key={a.recommandationId} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s?.dot}`} />
                        <div>
                          <p className="text-xs text-gray-700 leading-snug">
                            {a.branche} — <span className={s?.color}>{s?.label}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">Aucune activité.</p>
              )}
            </div>
          </div>

          {/* Charge des conseillers */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
              Charge des conseillers
            </h3>
            {conseillers.length > 0 ? (
              <div className="grid grid-cols-5 gap-4">
                {conseillers.map((c, i) => {
                  const charge = Math.min(Math.round((c.nombreEtudiants / 30) * 100), 100);
                  const couleur = COULEURS[i % COULEURS.length];
                  return (
                    <div key={c.id} className="text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center
                        font-bold text-white text-lg mx-auto mb-2"
                        style={{ background: couleur }}>
                        {c.specialite?.[0] ?? "C"}
                      </div>
                      <p className="text-xs font-semibold text-gray-700">
                        Conseiller #{c.userId}
                      </p>
                      <p className="text-xs text-gray-400 mb-2">{c.specialite}</p>
                      <p className="text-lg font-black text-blue-600">{c.nombreEtudiants}</p>
                      <p className="text-xs text-gray-400 mb-2">lycéens suivis</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${charge}%`, background: couleur }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{charge}% de charge</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Aucun conseiller n'a encore renseigné son profil.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── LYCÉENS ── */}
      {onglet === "lyceens" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Lycéens inscrits</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {lyceens.length} dossier{lyceens.length > 1 ? "s" : ""} · {" "}
              {lyceens.filter((l) => l.conseillerId !== null).length} avec conseiller assigné
            </p>
          </div>

          {lyceens.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["MATRICULE", "SÉRIE", "ÉTABLISSEMENT", "NIVEAU", "CONSEILLER ASSIGNÉ"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold
                        text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lyceens.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                        {l.matricule || `Dossier #${l.id}`}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold
                          ${SERIE_COULEUR[l.serieCode] ?? "bg-gray-100 text-gray-600"}`}>
                          {l.serieCode ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{l.etablissement}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{l.niveau ?? "—"}</td>
                      <td className="px-5 py-4 text-sm">
                        {l.conseillerId !== null ? (
                          <span className="text-gray-600">{nomConseiller(l.conseillerId)}</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Non assigné</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucun lycéen inscrit pour le moment.</p>
            </div>
          )}
        </div>
      )}

      {/* ── CONSEILLERS ── */}
      {onglet === "conseillers" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Conseillers</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Création et suivi des comptes conseillers
              </p>
            </div>
            <button
              onClick={() => { setFormOuvert(!formOuvert); setSucces(""); setErreur(""); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white
                rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              {formOuvert ? "Annuler" : "Ajouter un conseiller"}
            </button>
          </div>

          {succes && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{succes}</p>
            </div>
          )}

          {erreur && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
              <XIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{erreur}</p>
            </div>
          )}

          {formOuvert && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Nouveau conseiller
              </h3>
              <p className="text-xs text-gray-400 mb-5">
                Le conseiller recevra un courriel l'invitant à définir son mot de passe.
              </p>

              <form onSubmit={handleCreerConseiller}>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                    <input type="text" value={form.prenom}
                      onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                      placeholder="Awa"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm
                        focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                    <input type="text" value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: e.target.value })}
                      placeholder="Diallo"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm
                        focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Adresse électronique
                    </label>
                    <input type="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="conseiller@smartorienta.sn"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm
                        focus:outline-none focus:border-blue-500 transition-all" />
                  </div>
                </div>

                <button type="submit" disabled={enCours}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                    ${enCours ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"}`}>
                  {enCours ? "Création en cours…" : "Créer le compte"}
                </button>
              </form>
            </div>
          )}

          {conseillers.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {conseillers.map((c, i) => {
                const charge = Math.min(Math.round((c.nombreEtudiants / 30) * 100), 100);
                const couleur = charge >= 90 ? "#EF4444" : charge >= 60 ? "#F59E0B" : "#3B82F6";
                return (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center
                        font-bold text-white text-lg flex-shrink-0"
                        style={{ background: COULEURS[i % COULEURS.length] }}>
                        {c.specialite?.[0] ?? "C"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Conseiller #{c.userId}</p>
                        <p className="text-xs text-gray-400">{c.specialite}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-4">{c.etablissement}</p>

                    <div className="text-center mb-4">
                      <p className="text-3xl font-black text-blue-600">{c.nombreEtudiants}</p>
                      <p className="text-xs text-gray-400">lycéens suivis</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Charge de travail</span>
                        <span className="text-xs font-bold" style={{ color: couleur }}>
                          {charge}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all"
                          style={{ width: `${charge}%`, background: couleur }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Aucun conseiller n'a encore renseigné son profil.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Les comptes créés apparaissent ici une fois le profil complété.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── SYSTÈME ── */}
      {onglet === "systeme" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Configuration du système</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Architecture microservices et paramètres applicatifs
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-700">
              La supervision en temps réel des services et les métriques des modèles
              d'apprentissage ne sont pas encore exposées par l'API. Les indicateurs
              ci-dessous sont fournis à titre indicatif.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {MICROSERVICES.map((s) => (
              <div key={s.nom} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span className="text-xs text-gray-400 font-mono">{s.port}</span>
                </div>
                <p className="text-sm font-bold text-gray-800">{s.nom}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Paramètres applicatifs
            </h3>
            <div className="space-y-3">
              {PARAMS_SYSTEME.map((p) => (
                <div key={p.label}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{p.label}</span>
                  <span className="text-sm font-bold text-gray-800">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}