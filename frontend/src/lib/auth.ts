const API_URL = "http://localhost:8080";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: "LYCEEN" | "CONSEILLER" | "ADMIN";
}

/** Connexion — renvoie les jetons et le rôle. */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Email ou mot de passe incorrect");
  }
  return res.json();
}

/** Inscription d'un lycéen. */
export async function register(
  email: string, password: string, nom: string, prenom: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, nom, prenom }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Inscription impossible");
  }
}

/** Enregistre la session dans le navigateur. */
export function saveSession(auth: AuthResponse) {
  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  localStorage.setItem("email", auth.email);
  localStorage.setItem("role", auth.role);
}

export function getToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function getRole(): string | null {
  return localStorage.getItem("role");
}

export function logout() {
  localStorage.clear();
}

/** Page d'accueil selon le rôle. */
export function homePathFor(role: string): string {
  switch (role) {
    case "CONSEILLER": return "/conseiller/dashboard";
    case "ADMIN":      return "/admin/dashboard";
    default:           return "/lyceen/academique";
  }
}