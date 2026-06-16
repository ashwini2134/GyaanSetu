export type UserRole = "student" | "instructor" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
};

const TOKEN_KEY = "fa_token";
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

export type OAuthProvider = "github" | "linkedin" | "google";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new AuthApiError(data.error ?? res.statusText, res.status);
  }
  return data;
}

export async function authFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry && token && !path.includes("/refresh")) {
    try {
      const refreshed = await parseResponse<{ access_token: string }>(
        await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
      );
      setToken(refreshed.access_token);
      return authFetch<T>(path, init, false);
    } catch {
      clearToken();
      window.dispatchEvent(new Event("fa:logout"));
    }
  }

  return parseResponse<T>(res);
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    authFetch<{ access_token: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    authFetch<{ access_token: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    authFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }).catch(() => ({ ok: true })),

  me: () => authFetch<{ user: AuthUser }>("/auth/me"),

  forgotPassword: (email: string) =>
    authFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    authFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  exchangeOAuthCode: (code: string) =>
    authFetch<{ access_token: string; user: AuthUser }>("/auth/oauth/exchange", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  oauthUrl: (provider: OAuthProvider) => `${BACKEND_BASE}/api/auth/oauth/${provider}`,
};

export function hasRole(user: AuthUser | null, ...roles: UserRole[]): boolean {
  return Boolean(user && roles.includes(user.role));
}
