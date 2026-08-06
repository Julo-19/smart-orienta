import { SerieConfig } from "@/types";

export type Serie = "S1" | "S2" | "S3" | "L1" | "L2" | "G";

export const SERIES_CONFIG: Record<Serie, SerieConfig> = {
  S1: {
    label: "S1",
    description: "Sciences & Mathématiques",
    matieres: [
      { nom: "Français",            coefficient: 3, groupe: "commune"    },
      { nom: "Anglais",             coefficient: 2, groupe: "commune"    },
      { nom: "Philosophie",         coefficient: 2, groupe: "commune"    },
      { nom: "Histoire-Géographie", coefficient: 2, groupe: "commune"    },
      { nom: "Mathématiques",       coefficient: 8, groupe: "specialite" },
      { nom: "Physique-Chimie",     coefficient: 8, groupe: "specialite" },
    ],
  },
  S2: {
    label: "S2",
    description: "Sciences & Mathématiques",
    matieres: [
      { nom: "Français",            coefficient: 3, groupe: "commune"    },
      { nom: "Anglais",             coefficient: 2, groupe: "commune"    },
      { nom: "Philosophie",         coefficient: 2, groupe: "commune"    },
      { nom: "Histoire-Géographie", coefficient: 2, groupe: "commune"    },
      { nom: "Mathématiques",       coefficient: 5, groupe: "specialite" },
      { nom: "Physique-Chimie",     coefficient: 6, groupe: "specialite" },
      { nom: "SVT",                 coefficient: 6, groupe: "specialite" },
    ],
  },
  S3: {
    label: "S3",
    description: "Sciences Techniques & Industrielles",
    matieres: [
      { nom: "Français",               coefficient: 3, groupe: "commune"    },
      { nom: "Anglais",                coefficient: 2, groupe: "commune"    },
      { nom: "Philosophie",            coefficient: 2, groupe: "commune"    },
      // Pas d'Histoire-Géographie en S3 (confirmé grille officielle)
      { nom: "Mathématiques",          coefficient: 8, groupe: "specialite" },
      { nom: "Physique-Chimie",        coefficient: 8, groupe: "specialite" },
      { nom: "Construction Mécanique", coefficient: 8, groupe: "specialite" },
    ],
  },
  L1: {
    label: "L1",
    description: "Langues & Civilisations Modernes",
    matieres: [
      { nom: "Français",            coefficient: 6, groupe: "commune"    },
      { nom: "Anglais",             coefficient: 4, groupe: "commune"    },
      { nom: "Philosophie",         coefficient: 4, groupe: "commune"    },
      { nom: "Histoire-Géographie", coefficient: 2, groupe: "commune"    },
      { nom: "Mathématiques",       coefficient: 2, groupe: "commune"    },
      { nom: "LV2",                 coefficient: 4, groupe: "specialite" },
    ],
  },
  L2: {
    label: "L2",
    description: "Sciences Sociales & Humaines",
    matieres: [
      { nom: "Français",              coefficient: 5, groupe: "commune"    },
      { nom: "Anglais",               coefficient: 4, groupe: "commune"    },
      { nom: "Philosophie",           coefficient: 6, groupe: "commune"    },
      { nom: "Histoire-Géographie",   coefficient: 6, groupe: "commune"    },
      { nom: "Mathématiques",         coefficient: 2, groupe: "commune"    },
      { nom: "LV2",                   coefficient: 2, groupe: "specialite" },
      { nom: "Sciences de la Nature", coefficient: 2, groupe: "specialite" },
    ],
  },
  G: {
    label: "G",
    description: "Techniques Quantitatives d'Économie & Gestion",
    matieres: [
      { nom: "Français",      coefficient: 3, groupe: "commune"    },
      { nom: "Anglais",       coefficient: 3, groupe: "commune"    },
      { nom: "Philosophie",   coefficient: 2, groupe: "commune"    },
      { nom: "Mathématiques", coefficient: 5, groupe: "commune"    },
      // Pas d'Histoire-Géographie en G (confirmé grille officielle)
      { nom: "Étude de cas",  coefficient: 6, groupe: "specialite" },
      { nom: "Économie",      coefficient: 6, groupe: "specialite" },
    ],
  },
};

// ── Calcul de la moyenne pondérée ──
export function calculerMoyenne(
  notes: Record<string, number | null>,
  serie: Serie
): number | null {
  const config = SERIES_CONFIG[serie];
  let totalPoints = 0;
  let totalCoefs  = 0;

  for (const matiere of config.matieres) {
    const note = notes[matiere.nom];
    if (note === null || note === undefined) return null;
    totalPoints += note * matiere.coefficient;
    totalCoefs  += matiere.coefficient;
  }

  if (totalCoefs === 0) return null;
  return Math.round((totalPoints / totalCoefs) * 100) / 100;
}