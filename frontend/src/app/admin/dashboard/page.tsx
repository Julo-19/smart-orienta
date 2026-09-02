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
  getTousUtilisateurs, reassignerConseiller, getEtatServices,
  StatistiquesResponse, ConseillerAdmin, LyceenAdmin, UserInfo, ServiceStatut,
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
  S1: "bg-blue-100 text-blue-700",     S2: "bg-blue-100 text-blue-700",
  S3: "bg-blue-100 text-blue-700",     L1: "bg-purple-100 text-purple-700",
  L2: "bg-purple-100 text-purple-700", G:  "bg-green-100 text-green-700",
};

const PARAMS_SYSTEME = [
  { label: "Règle d'assignation",       value: "Établissement → Spécialité → Charge" },
  { label: "Jeton d'accès",             value: "15 minutes" },
  { label: "Jeton de rafraîchissement", value: "7 jours" },
  { label: "Hachage des mots de passe", value: "bcrypt, coût 12" },
  { label: "Notes",                     value: "0 à 20, pondérées par coefficient" },
  { label: "Questionnaire",             value: "34 questions, échelle de 1 à 5" },
  { label: "Modèle de prédiction",      value: "Random Forest, deux niveaux" },
  { label: "Courtier de messages",      value: "Kafka — sujet decisions-conseiller" },
];

const ONGLETS = [
  { id: "overview",    label: "Vue d'ensemble", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "lyceens",     label: "Lycéens",        icon: <GraduationCap className="w-4 h-4" /> },
  { id: "conseillers", label: "Conseillers",    icon: <UserPlus className="w-4 h-4" /> },
  { id: "systeme",     label: "Système",        icon: <Settings className="w-4 h-4" /> },
];

/** « AUTH-SERVICE » devient « Auth Service ». */
const enClair = (nom: string) =>
  nom.split("-").map((m) => m.charAt(0) + m.slice(1).toLowerCase()).join(" ");

export default function AdminDashboard() {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>("overview");

  const [stats, setStats] = useState<StatistiquesResponse | null>(null);
  const [conseillers, setConseillers] = useState<ConseillerAdmin[]>([]);
  const [lyceens, setLyceens] = useState<LyceenAdmin[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UserInfo[]>([]);
  const [services, setServices] = useState<ServiceStatut[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");

  // Création d'un conseiller
  const [formOuvert, setFormOuvert] = useState(false);
  const [form, setForm] = useState({ email: "", nom: "", prenom: "" });
  const [enCours, setEnCours] = useState(false);
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");

  // Réassignation
  const [reassignationEnCours, setReassignationEnCours] = useState<number | null>(null);

  const charger = async () => {
    try {
      const [s, c, l, u, srv] = await Promise.all([
        getStatistiques(), getTousConseillers(), getTousLyceens(),
        getTousUtilisateurs(), getEtatServices(),
      ]);
      setStats(s); setConseillers(c); setLyceens(l);
      setUtilisateurs(u); setServices(srv);
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

  const handleReassigner = async (profileId: number, valeur: string) => {
    setReassignationEnCours(profileId);
    setErreur("");
    try {
      await reassignerConseiller(profileId, valeur === "" ? null : Number(valeur));
      await charger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Réassignation impossible");
    } finally {
      setReassignationEnCours(null);
    }
  };

  /** Nom complet d'un utilisateur, à partir de son identifiant. */
  const nomDe = (userId: number | null) => {
    if (userId === null) return null;
    const u = utilisateurs.find((x) => x.id === userId);
    return u ? `${u.prenom} ${u.nom}` : `Utilisateur #${userId}`;
  };

  const initialesDe = (userId: number) => {
    const u = utilisateurs.find((x) => x.id === userId);
    if (!u) return "?";
    return `${u.prenom?.[0] ?? ""}${u.nom?.[0] ?? ""}`.toUpperCase();
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

  const conseillersEnAttente = utilisateurs.filter(
    (u) => u.role === "CONSEILLER" && !conseillers.some((c) => c.userId === u.id)
  );

  const servicesEnPanne = services.filter((s) => s.statut !== "UP");

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
            {o.id === "systeme" && servicesEnPanne.length > 0 && (
              <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
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
                            {nomDe(a.etudiantUserId) ?? "Élève"} — {a.branche}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            <span className={s?.color}>{s?.label}</span> · {a.date}
                          </p>
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
                        {initialesDe(c.userId)}
                      </div>
                      <p className="text-xs font-semibold text-gray-700">
                        {nomDe(c.userId) ?? `Conseiller #${c.userId}`}
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
              {lyceens.length} dossier{lyceens.length > 1 ? "s" : ""} ·{" "}
              {lyceens.filter((l) => l.conseillerId !== null).length} avec conseiller assigné
              {" · "}L'attribution peut être modifiée directement dans le tableau.
            </p>
          </div>

          {erreur && (
            <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
              {erreur}
            </div>
          )}

          {lyceens.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["LYCÉEN", "MATRICULE", "SÉRIE", "ÉTABLISSEMENT", "NIVEAU", "CONSEILLER ASSIGNÉ"].map((h) => (
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
                        {nomDe(l.userId) ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {l.matricule || "—"}
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
                        <select
                          value={l.conseillerId ?? ""}
                          onChange={(e) => handleReassigner(l.id, e.target.value)}
                          disabled={reassignationEnCours === l.id || conseillers.length === 0}
                          className={`text-sm border rounded-lg px-2 py-1.5 bg-white
                            focus:outline-none focus:border-blue-500 transition-all
                            disabled:opacity-50
                            ${l.conseillerId === null
                              ? "border-amber-300 text-amber-700"
                              : "border-gray-200 text-gray-600"}`}
                        >
                          <option value="">Non assigné</option>
                          {conseillers.map((c) => (
                            <option key={c.userId} value={c.userId}>
                              {nomDe(c.userId)} · {c.specialite}
                            </option>
                          ))}
                        </select>
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

          {conseillersEnAttente.length > 0 && (
            <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <p className="text-xs font-bold text-amber-700 mb-2">
                Comptes en attente d'activation
              </p>
              <div className="space-y-1">
                {conseillersEnAttente.map((u) => (
                  <p key={u.id} className="text-xs text-amber-600">
                    {u.prenom} {u.nom} — {u.email} · profil non renseigné
                  </p>
                ))}
              </div>
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
                        {initialesDe(c.userId)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {nomDe(c.userId) ?? `Conseiller #${c.userId}`}
                        </p>
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
            </div>
          )}
        </div>
      )}

      {/* ── SYSTÈME ── */}
      {onglet === "systeme" && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">État du système</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {services.filter((s) => s.statut === "UP").length} service
                {services.filter((s) => s.statut === "UP").length > 1 ? "s" : ""} sur{" "}
                {services.length} en fonctionnement
              </p>
            </div>
            <button
              onClick={charger}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm
                font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Actualiser
            </button>
          </div>

          {servicesEnPanne.length > 0 && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50">
              <p className="text-xs font-bold text-red-700 mb-1">
                {servicesEnPanne.length} service{servicesEnPanne.length > 1 ? "s" : ""} indisponible
                {servicesEnPanne.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-600">
                {servicesEnPanne.map((s) => enClair(s.nom)).join(", ")} — les fonctionnalités
                qui en dépendent peuvent être interrompues.
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            {services.map((s) => {
              const actif = s.statut === "UP";
              return (
                <div key={s.nom}
                  className={`rounded-xl border p-4 shadow-sm
                    ${actif ? "bg-white border-gray-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full
                      ${actif ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
                    <span className="text-xs text-gray-400 font-mono">{s.adresse}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">{enClair(s.nom)}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${actif ? "text-green-600" : "text-red-600"}`}>
                      {s.statut}
                    </span>
                    <span className="text-xs text-gray-400">
                      {s.instances} instance{s.instances > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Comptes enregistrés
              </h3>
              <div className="space-y-3">
                {["ADMIN", "CONSEILLER", "LYCEEN"].map((role) => {
                  const nb = utilisateurs.filter((u) => u.role === role).length;
                  return (
                    <div key={role}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600 capitalize">
                        {role.toLowerCase()}s
                      </span>
                      <span className="text-sm font-bold text-gray-800">{nb}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                Les métriques des modèles d'apprentissage ne sont pas encore
                exposées par le module de prédiction.
              </p>
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
                    <span className="text-sm font-bold text-gray-800 text-right">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}