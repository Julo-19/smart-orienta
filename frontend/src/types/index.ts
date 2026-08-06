// ── Séries du baccalauréat ──
export type Serie = "S1" | "S2" | "S3" | "L1" | "L2" | "G";

// ── Matière avec coefficient ──
export interface Matiere {
  nom: string;
  coefficient: number;
  groupe: "commune" | "specialite";
}

// ── Configuration des matières par série ──
export interface SerieConfig {
  label: string;
  description: string;
  matieres: Matiere[];
}

// ── Notes saisies par le lycéen ──
export interface NotesAcademiques {
  serie: Serie;
  notes: Record<string, number | null>;
  moyennePonderee: number | null;
}

// ── Profil RIASEC ──
export interface ProfilRIASEC {
  scoreR: number;
  scoreI: number;
  scoreA: number;
  scoreS: number;
  scoreE: number;
  scoreC: number;
  stress: number;
  social: number;
  autonomie: number;
  adaptabilite: number;
  codeHolland?: string;
}

// ── Statut recommandation ──
export type StatutRecommandation =
  | "EN_ATTENTE"
  | "VALIDEE"
  | "AJUSTEE"
  | "REJETEE";

// ── Recommandation ──
export interface Recommandation {
  id: string;
  categorie: string;
  branche: string;
  scoreConfiance: number;
  statut: StatutRecommandation;
  commentaire?: string;
  dateGeneration: string;
  dateDecision?: string;
}

// ── Utilisateur connecté ──
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "ETUDIANT" | "CONSEILLER" | "ADMINISTRATEUR";
  serie?: Serie;
  etablissement?: string;
}