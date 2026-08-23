import { getToken, saveSession } from "./auth";

const API_URL = "http://localhost:8080";

async function rafraichirToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;

    saveSession(await res.json());
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Jeton expiré : on le renouvelle puis on rejoue une seule fois
  if ((res.status === 401 || res.status === 403) && retry) {
    if (await rafraichirToken()) {
      return request<T>(path, options, false);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}


export interface Serie {
  id: number;
  code: string;
  libelle: string;
}

export interface Matiere {
  matiereId: number;
  nom: string;
  coefficient: number;
}

export const getSeries = () => request<Serie[]>("/api/series");

export const getMatieres = (serieId: number) =>
  request<Matiere[]>(`/api/series/${serieId}/matieres`);

// ─────────── Profil ───────────

export interface ProfileRequest {
  etablissement: string;
  matricule: string;
  niveau: string;
  region: string;
 // format AAAA-MM-JJ
  dateNaissance: string; 
  sexe: string;
  serieId: number;
}

export interface ProfileResponse extends ProfileRequest {
  id: number;
  userId: number;
  serieCode: string;
  serieLibelle: string;
  conseillerId: number | null;
}

export const creerProfil = (data: ProfileRequest) =>
  request<ProfileResponse>("/api/students/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getMonProfil = () =>
  request<ProfileResponse>("/api/students/profile");

// ─────────── Notes ───────────

export interface NoteRequest {
  matiereId: number;
  valeur: number;
  semestre: number;
}

export interface NoteResponse {
  id: number;
  matiere: string;
  coefficient: number;
  valeur: number;
}

export interface BulletinResponse {
  semestre: number;
  serie: string;
  notes: NoteResponse[];
  moyenneGenerale: number;
  totalCoefficients: number;
  matieresRenseignees: number;
  matieresAttendues: number;
}

export const saisirNote = (data: NoteRequest) =>
  request<unknown>("/api/students/notes", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getBulletin = (semestre: number) =>
  request<BulletinResponse>(`/api/students/notes/${semestre}`);

// ─────────── RIASEC ───────────

export interface QuestionRiasec {
  id: number;
  texte: string;
  dimension: string;
}

export interface ReponseQuestion {
  questionId: number;
  valeur: number;
}

export const getQuestionsRiasec = () =>
  request<QuestionRiasec[]>("/api/riasec/questions");

export const soumettreRiasec = (reponses: ReponseQuestion[]) =>
  request<unknown>("/api/students/riasec/reponses", {
    method: "POST",
    body: JSON.stringify({ reponses }),
  });

  // ─────────── Contexte ───────────

export interface ContexteData {
  contraintes: string;
  passions: string;
  filieresRefusees: string;
  messageConseiller: string;
}

export const enregistrerContexte = (data: ContexteData) =>
  request<unknown>("/api/students/contexte", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getMonContexte = () =>
  request<ContexteData>("/api/students/contexte");


// ─────────── Orientation ───────────

export interface Recommandation {
  id: number;
  etudiantUserId: number;
  conseillerUserId: number | null;
  categorie: string;
  branche: string;
  scoreConfiance: number;
  explication: string;
  statut: "EN_ATTENTE" | "VALIDEE" | "MODIFIEE" | "REJETEE";
  brancheFinale: string | null;
  commentaireConseiller: string | null;
  dateGeneration: string;
  dateDecision: string | null;
}

export const demanderRecommandation = () =>
  request<Recommandation>("/api/orientations/recommandations", { method: "POST" });

export const getMesRecommandations = () =>
  request<Recommandation[]>("/api/orientations/recommandations");

// ─────────── RIASEC (consultation) ───────────

export interface ProfilRiasecData {
  scoreR: number; scoreI: number; scoreA: number;
  scoreS: number; scoreE: number; scoreC: number;
  codeHolland: string;
  stress: number; social: number; autonomie: number; adaptabilite: number;
}

export const getMonRiasec = () =>
  request<ProfilRiasecData>("/api/students/riasec");