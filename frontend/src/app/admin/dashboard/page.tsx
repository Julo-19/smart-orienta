"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";
import {
  GraduationCap, Brain, Check, Clock,
  UserPlus, Eye, Settings, Server,
  RefreshCw, ChevronRight
} from "lucide-react";

// ── TYPES ──
type Onglet = "overview" | "lyceens" | "conseillers" | "systeme";
type Statut = "EN_ATTENTE" | "VALIDEE" | "AJUSTEE" | "REJETEE";

// ── MOCK DATA ──
const STATS = {
  lyceens: 156, lyceensWeek: 12,
  recos: 89, recosAttente: 12,
  tauxValidation: 75, f1Score: 84,
  delaiMoyen: 18,
};

const STATUTS_DATA = [
  { label: "Validées",   value: 67, color: "#10B981" },
  { label: "Ajustées",   value: 15, color: "#F59E0B" },
  { label: "Rejetées",   value: 5,  color: "#EF4444" },
  { label: "En attente", value: 12, color: "#3B82F6" },
];

const FILIERES_DATA = [
  { name: "Infor.", value: 24, color: "#3B82F6" },
  { name: "Méd.",   value: 18, color: "#10B981" },
  { name: "Génie",  value: 14, color: "#6B7280" },
  { name: "Droit",  value: 11, color: "#8B5CF6" },
  { name: "Com.",   value: 9,  color: "#F59E0B" },
  { name: "Comm.",  value: 7,  color: "#06B6D4" },
  { name: "Autres", value: 6,  color: "#9CA3AF" },
];

const ACTIVITE = [
  { dot: "#3B82F6", texte: "Nouvelle recommandation — Rokhaya Mbaye (S3)", temps: "Il y a 8 min"    },
  { dot: "#10B981", texte: "M. Ndiaye a validé le dossier de Moussa Sarr",  temps: "Il y a 42 min"  },
  { dot: "#F59E0B", texte: "Mme Sarr a ajusté → Communication pour Fatou",  temps: "Il y a 1h 14min"},
  { dot: "#EF4444", texte: "M. Ba a rejeté le dossier d'Ibrahim Faye",       temps: "Il y a 2h 05min"},
  { dot: "#3B82F6", texte: "Nouveau lycéen inscrit : Cheikh Cissé (L2)",     temps: "Il y a 3h 20min"},
];

const CONSEILLERS_CHARGE = [
  { initiale: "A", nom: "Amadou Ndiaye",  specialite: "Sciences", dossiers: 28, attente: 8,  valides: 82, color: "#3B82F6" },
  { initiale: "S", nom: "Aïssatou Sarr",  specialite: "Lettres",  dossiers: 19, attente: 3,  valides: 79, color: "#8B5CF6" },
  { initiale: "B", nom: "Ousmane Ba",     specialite: "Gestion",  dossiers: 22, attente: 1,  valides: 91, color: "#10B981" },
  { initiale: "D", nom: "Fatima Diop",    specialite: "Sciences", dossiers: 15, attente: 0,  valides: 87, color: "#F59E0B" },
  { initiale: "F", nom: "Ibrahima Fall",  specialite: "Multi",    dossiers: 5,  attente: 0,  valides: 100, color: "#EF4444"},
];

const LYCEENS = [
  { nom: "Aminata Diallo",  serie: "S2", serie_color: "bg-blue-100 text-blue-700",   etablissement: "Lycée Seydina L.",   conseiller: "M. Ndiaye", statut: "EN_ATTENTE", date: "27 Avr" },
  { nom: "Moussa Sarr",     serie: "S1", serie_color: "bg-blue-100 text-blue-700",   etablissement: "Lycée Blaise Diagne",conseiller: "M. Ndiaye", statut: "VALIDEE",    date: "25 Avr" },
  { nom: "Fatou Ndiaye",    serie: "L1", serie_color: "bg-purple-100 text-purple-700",etablissement: "Lycée J.F. Kennedy", conseiller: "Mme Sarr",  statut: "AJUSTEE",    date: "24 Avr" },
  { nom: "Ibrahim Faye",    serie: "G1", serie_color: "bg-green-100 text-green-700",  etablissement: "Lycée Tech. Limamou",conseiller: "M. Ba",     statut: "REJETEE",    date: "23 Avr" },
  { nom: "Rokhaya Mbaye",   serie: "S3", serie_color: "bg-blue-100 text-blue-700",   etablissement: "Lycée Mariama Bâ",   conseiller: "M. Ndiaye", statut: "EN_ATTENTE", date: "27 Avr" },
  { nom: "Cheikh Tall",     serie: "S2", serie_color: "bg-blue-100 text-blue-700",   etablissement: "Lycée Blaise Diagne",conseiller: "Mme Diop",  statut: "VALIDEE",    date: "22 Avr" },
  { nom: "Julo Barro",      serie: "G2", serie_color: "bg-green-100 text-green-700",  etablissement: "Lycée Seydina L.",   conseiller: "M. Ba",     statut: "VALIDEE",    date: "21 Avr" },
];

const MICROSERVICES = [
  { nom: "API Gateway",          port: ":8080", latence: "12ms",  latenceColor: "text-gray-600"  },
  { nom: "Auth Service",         port: ":8081", latence: "8ms",   latenceColor: "text-gray-600"  },
  { nom: "Student Service",      port: ":8082", latence: "15ms",  latenceColor: "text-gray-600"  },
  { nom: "Orientation Service",  port: ":8083", latence: "22ms",  latenceColor: "text-gray-600"  },
  { nom: "ML Service (FastAPI)", port: ":8084", latence: "780ms", latenceColor: "text-amber-500" },
  { nom: "Notification Service", port: ":8085", latence: "45ms",  latenceColor: "text-gray-600"  },
  { nom: "Eureka Server",        port: ":8761", latence: "6ms",   latenceColor: "text-gray-600"  },
  { nom: "Config Server",        port: ":8888", latence: "9ms",   latenceColor: "text-gray-600"  },
];

const MODELES_ML = [
  { nom: "Random Forest",       accuracy: 84, f1: 82, badge: "PROD",     badgeColor: "bg-green-100 text-green-700"  },
  { nom: "XGBoost",             accuracy: 87, f1: 85, badge: "TEST",     badgeColor: "bg-blue-100 text-blue-700"   },
  { nom: "Régression Logistique", accuracy: 71, f1: 69, badge: "BASELINE", badgeColor: "bg-gray-100 text-gray-600"  },
  { nom: "KNN (k=5)",           accuracy: 76, f1: 73, badge: "COMPARE",  badgeColor: "bg-gray-100 text-gray-500"  },
];

const PARAMS_SYSTEME = [
  { label: "Délai max conseiller",    value: "48 heures",                     highlight: false },
  { label: "Règle d'assignation",     value: "Établissement → Série → Charge",highlight: false },
  { label: "Charge max par conseiller",value: "30 dossiers",                  highlight: false },
  { label: "JWT Access Token",        value: "15 minutes",                    highlight: false },
  { label: "JWT Refresh Token",       value: "7 jours",                       highlight: false },
  { label: "Dataset seed ML",         value: "random_state=42",               highlight: true  },
];

// ── HELPERS ──
const STATUT_CONFIG: Record<Statut, { label: string; color: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", color: "text-amber-600",  dot: "bg-amber-500"  },
  VALIDEE:    { label: "Validée",    color: "text-green-600",  dot: "bg-green-500"  },
  AJUSTEE:    { label: "Ajustée",    color: "text-orange-500", dot: "bg-orange-500" },
  REJETEE:    { label: "Rejetée",    color: "text-red-600",    dot: "bg-red-500"    },
};

const ONGLETS = [
  { id: "overview",     label: "Vue d'ensemble", icon: <BarChart className="w-4 h-4" /> },
  { id: "lyceens",      label: "Lycéens",        icon: <GraduationCap className="w-4 h-4" /> },
  { id: "conseillers",  label: "Conseillers",    icon: <UserPlus className="w-4 h-4" /> },
  { id: "systeme",      label: "Système",        icon: <Settings className="w-4 h-4" /> },
];

// ── PAGE PRINCIPALE ──
export default function AdminDashboard() {
  const [onglet, setOnglet] = useState<Onglet>("overview");

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* Navigation onglets */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id as Onglet)}
            className={`
              flex items-center gap-2 px-5 py-3 text-sm font-semibold
              border-b-2 transition-all duration-150
              ${onglet === o.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>

      {/* ── ONGLET 1 — VUE D'ENSEMBLE ── */}
      {onglet === "overview" && (
        <div className="space-y-6">

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "LYCÉENS INSCRITS",   value: "156",  sub: "+12 cette semaine",  icon: <GraduationCap className="w-6 h-6 text-gray-400" />, color: "text-blue-600"   },
              { label: "RECO. GÉNÉRÉES",     value: "89",   sub: "12 en attente",       icon: <Brain className="w-6 h-6 text-gray-400" />,        color: "text-purple-600" },
              { label: "TAUX DE VALIDATION", value: "75%",  sub: "F1-score ML: 84%",    icon: <Check className="w-6 h-6 text-gray-400" />,        color: "text-green-600"  },
              { label: "DÉLAI MOYEN",        value: "18h",  sub: "Max autorisé : 48h",  icon: <Clock className="w-6 h-6 text-gray-400" />,        color: "text-amber-500"  },
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

          {/* Grille stats */}
          <div className="grid grid-cols-3 gap-4">

            {/* Statuts recommandations */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Statuts des recommandations
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <PieChart width={120} height={120}>
                    <Pie
                      data={STATUTS_DATA}
                      cx={55} cy={55}
                      innerRadius={35}
                      outerRadius={55}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {STATUTS_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm font-black text-gray-700">99</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {STATUTS_DATA.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                      <span className="text-xs text-gray-600">{s.label}</span>
                      <span className="text-xs font-bold text-gray-800 ml-auto pl-2">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filières recommandées */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Filières recommandées
              </h3>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={FILIERES_DATA} barSize={18}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {FILIERES_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activité récente */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Activité récente
              </h3>
              <div className="space-y-3">
                {ACTIVITE.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.dot }} />
                    <div>
                      <p className="text-xs text-gray-700 leading-snug">{a.texte}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.temps}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charge conseillers */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">
              Charge des conseillers
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {CONSEILLERS_CHARGE.map((c) => (
                <div key={c.nom} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center
                      font-bold text-white text-lg mx-auto mb-2"
                    style={{ background: c.color }}
                  >
                    {c.initiale}
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{c.nom}</p>
                  <p className="text-xs text-gray-400 mb-2">{c.specialite}</p>
                  <div className="flex justify-center gap-3 mb-2">
                    <div>
                      <p className="text-lg font-black text-blue-600">{c.dossiers}</p>
                      <p className="text-xs text-gray-400">dossiers</p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-amber-500">{c.attente}</p>
                      <p className="text-xs text-gray-400">attente</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${c.valides}%`, background: c.color }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{c.valides}% validés</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── ONGLET 2 — LYCÉENS ── */}
      {onglet === "lyceens" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Gestion des lycéens</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                156 lycéens inscrits · 12 recommandations en attente
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white
              rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
              <UserPlus className="w-4 h-4" />
              + Ajouter un lycéen
            </button>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["LYCÉEN", "SÉRIE", "ÉTABLISSEMENT", "CONSEILLER ASSIGNÉ", "STATUT", "DATE", "ACTION"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LYCEENS.map((l, i) => {
                  const s = STATUT_CONFIG[l.statut as Statut];
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{l.nom}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${l.serie_color}`}>
                          {l.serie}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{l.etablissement}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{l.conseiller}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                          <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{l.date}</td>
                      <td className="px-5 py-4">
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200
                          rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                          <Eye className="w-3 h-3" />
                          Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ONGLET 3 — CONSEILLERS ── */}
      {onglet === "conseillers" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Gestion des conseillers</h2>
              <p className="text-sm text-gray-400 mt-0.5">12 conseillers actifs sur la plateforme</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white
              rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
              <UserPlus className="w-4 h-4" />
              + Ajouter
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {CONSEILLERS_CHARGE.map((c) => {
              const chargePercent = Math.round((c.dossiers / 30) * 100);
              const chargeColor = chargePercent >= 90 ? "#EF4444" : chargePercent >= 60 ? "#F59E0B" : "#3B82F6";
              return (
                <div key={c.nom} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                      style={{ background: c.color }}
                    >
                      {c.initiale}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{c.nom}</p>
                      <p className="text-xs text-gray-400">Spécialité : {c.specialite}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                      <p className="text-xl font-black text-blue-600">{c.dossiers}</p>
                      <p className="text-xs text-gray-400">Dossiers</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-amber-500">{c.attente}</p>
                      <p className="text-xs text-gray-400">En attente</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-green-600">{c.valides}%</p>
                      <p className="text-xs text-gray-400">Validés</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Charge de travail</span>
                      <span className="text-xs font-bold" style={{ color: chargeColor }}>
                        {chargePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${chargePercent}%`, background: chargeColor }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 border-2 border-blue-300 text-blue-600 rounded-lg
                      text-xs font-semibold hover:bg-blue-50 transition-all">
                      Réassigner
                    </button>
                    <button className="py-2 border border-gray-200 text-gray-600 rounded-lg
                      text-xs font-semibold hover:bg-gray-50 transition-all">
                      Voir dossiers
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ONGLET 4 — SYSTÈME ── */}
      {onglet === "systeme" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Santé du système</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Architecture microservices — Statut en temps réel
            </p>
          </div>

          {/* Microservices */}
          <div className="grid grid-cols-4 gap-3">
            {MICROSERVICES.map((s) => (
              <div key={s.nom} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400 font-mono">{s.port}</span>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">{s.nom}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-green-600">UP</span>
                  <span className={`text-xs font-semibold ${s.latenceColor}`}>{s.latence}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Métriques ML + Paramètres */}
          <div className="grid grid-cols-2 gap-4">

            {/* Métriques ML */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Métriques ML — Comparaison des 4 modèles
              </h3>
              <div className="space-y-4">
                {MODELES_ML.map((m) => (
                  <div key={m.nom} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.nom}</p>
                      <p className="text-xs text-gray-400">
                        Accuracy: <span className="font-bold text-gray-600">{m.accuracy}%</span>
                        {" · "}
                        F1-macro: <span className="font-bold text-gray-600">{m.f1}%</span>
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.badgeColor}`}>
                      {m.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Paramètres système */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Paramètres système
              </h3>
              <div className="space-y-3">
                {PARAMS_SYSTEME.map((p) => (
                  <div key={p.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{p.label}</span>
                    <span className={`text-sm font-bold ${p.highlight ? "text-blue-600 font-mono" : "text-gray-800"}`}>
                      {p.value}
                    </span>
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