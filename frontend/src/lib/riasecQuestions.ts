export type Dimension = "R" | "I" | "A" | "S" | "E" | "C";

export interface Question {
  id: number;
  dimension: Dimension;
  texte: string;
}

export const DIMENSION_LABELS: Record<Dimension, string> = {
  R: "Réaliste",
  I: "Investigateur",
  A: "Artistique",
  S: "Social",
  E: "Entrepreneur",
  C: "Conventionnel",
};

export const DIMENSION_COLORS: Record<Dimension, string> = {
  R: "#6B7280", // gris
  I: "#3B82F6", // bleu
  A: "#8B5CF6", // violet
  S: "#10B981", // vert
  E: "#F59E0B", // orange
  C: "#EF4444", // rouge
};

export const LIKERT_LABELS: Record<number, string> = {
  1: "Pas du tout d'accord",
  2: "Plutôt pas d'accord",
  3: "Neutre",
  4: "Plutôt d'accord ",
  5: "Tout à fait d'accord",
};

// 30 questions RIASEC (5 par dimension) + 4 comportementales = 34
export const QUESTIONS: Question[] = [
  // R — Réaliste
  { id: 1,  dimension: "R", texte: "J'apprécie travailler sur des tâches concrètes nécessitant des manipulations ou l'utilisation d'outils." },
  { id: 2,  dimension: "R", texte: "Je me sens à l'aise dans des activités techniques ou pratiques (réparer, construire, expérimenter)." },
  { id: 3,  dimension: "R", texte: "Je préfère apprendre en faisant plutôt qu'en lisant ou en écoutant uniquement." },
  { id: 4,  dimension: "R", texte: "J'aime travailler avec des machines, des équipements ou des objets physiques." },
  { id: 5,  dimension: "R", texte: "Je préfère les solutions concrètes et pratiques aux théories abstraites." },

  // I — Investigateur
  { id: 6,  dimension: "I", texte: "J'aime analyser des problèmes complexes et chercher des solutions logiques." },
  { id: 7,  dimension: "I", texte: "Je suis attiré(e) par les matières scientifiques et la compréhension des phénomènes." },
  { id: 8,  dimension: "I", texte: "J'apprécie les activités qui demandent de la réflexion approfondie et de la recherche." },
  { id: 9,  dimension: "I", texte: "Je lis volontiers des livres ou articles scientifiques pour approfondir mes connaissances." },
  { id: 10, dimension: "I", texte: "J'aime formuler des hypothèses et les tester pour comprendre comment les choses fonctionnent." },

  // A — Artistique
  { id: 11, dimension: "A", texte: "J'aime exprimer ma créativité à travers le dessin, l'écriture, la musique ou d'autres formes artistiques." },
  { id: 12, dimension: "A", texte: "Je préfère les activités qui me permettent d'innover plutôt que de suivre des règles strictes." },
  { id: 13, dimension: "A", texte: "Je suis sensible à l'esthétique, au design et à l'originalité." },
  { id: 14, dimension: "A", texte: "J'aime imaginer de nouvelles idées ou concevoir des projets originaux." },
  { id: 15, dimension: "A", texte: "Les environnements créatifs et non conventionnels me motivent davantage que les cadres rigides." },

  // S — Social
  { id: 16, dimension: "S", texte: "J'aime aider les autres et contribuer à leur bien-être." },
  { id: 17, dimension: "S", texte: "Je me sens à l'aise dans les activités impliquant l'écoute et la communication." },
  { id: 18, dimension: "S", texte: "Je préfère travailler en équipe plutôt que seul(e)." },
  { id: 19, dimension: "S", texte: "J'aime enseigner, expliquer ou transmettre des connaissances aux autres." },
  { id: 20, dimension: "S", texte: "Je me soucie du bien-être des personnes autour de moi et cherche à les soutenir." },

  // E — Entrepreneur
  { id: 21, dimension: "E", texte: "J'aime prendre des initiatives et diriger des projets." },
  { id: 22, dimension: "E", texte: "Je suis motivé(e) par les défis, la prise de décision et la gestion de responsabilités." },
  { id: 23, dimension: "E", texte: "Je suis à l'aise pour convaincre ou influencer les autres." },
  { id: 24, dimension: "E", texte: "J'aime négocier, vendre ou défendre mes idées devant un groupe." },
  { id: 25, dimension: "E", texte: "Je me projette facilement dans un rôle de leadership ou de gestion d'équipe." },

  // C — Conventionnel
  { id: 26, dimension: "C", texte: "J'aime organiser, planifier et structurer des informations ou des tâches." },
  { id: 27, dimension: "C", texte: "Je suis à l'aise avec les activités nécessitant rigueur, précision et respect des consignes." },
  { id: 28, dimension: "C", texte: "Je préfère travailler dans un cadre bien défini avec des règles claires." },
  { id: 29, dimension: "C", texte: "J'apprécie les tâches qui demandent de la méthode, de l'ordre et de l'exactitude." },
  { id: 30, dimension: "C", texte: "Je me sens plus efficace quand les objectifs et les procédures sont clairement établis." },

  // Variables comportementales (id 31-34)
  { id: 31, dimension: "S", texte: "Je reste calme et efficace même sous pression." },
  { id: 32, dimension: "S", texte: "Je me sens à l'aise pour interagir avec de nouvelles personnes." },
  { id: 33, dimension: "R", texte: "Je préfère travailler de manière autonome sans dépendre des autres." },
  { id: 34, dimension: "A", texte: "Je m'adapte facilement à de nouvelles situations ou environnements." },
];