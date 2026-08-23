import { getToken } from "./auth";

const API_URL = "http://localhost:8080";


async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

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
  id: number;
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