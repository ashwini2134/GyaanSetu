export type UserRole = "student" | "instructor" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  bio?: string;
  avatarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  profileVisibility?: string;
  profileTheme?: string;
  portfolioTemplate?: string;
  createdAt?: string;
};

const TOKEN_KEY = "fa_token";
function ensureAbsoluteUrl(url: string | undefined, defaultUrl: string) {
  if (!url) return defaultUrl;
  if (url.startsWith("/")) return url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

const API_BASE = ensureAbsoluteUrl(
  import.meta.env.VITE_API_URL, 
  "http://localhost:3001/api"
);
const BACKEND_BASE = ensureAbsoluteUrl(
  import.meta.env.VITE_BACKEND_URL, 
  "http://localhost:3001"
);

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

// Decodes a JWT's exp claim client-side (no signature verification — this is
// only used to skip a doomed network call, never to trust the token). A
// stale token left in localStorage from an earlier session is the common
// case on public pages like /login and /register; without this check every
// visit fires /auth/me and /auth/refresh, both of which 401 and log a
// browser-level "Failed to load resource" console entry that can't be
// suppressed from JS once the request is actually sent.
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof decoded.exp !== "number") return false;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export class AuthApiError extends Error {
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

export async function authFetchBlob(path: string): Promise<Blob> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { headers, credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new AuthApiError(data.error ?? res.statusText, res.status);
  }
  return res.blob();
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
  register: (email: string, password: string, name: string, githubUrl?: string) =>
    authFetch<{ access_token: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, githubUrl: githubUrl || undefined }),
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

  getNotificationPrefs: () =>
    authFetch<{ prefs: Record<string, boolean> }>("/notifications"),

  updateNotificationPrefs: (prefs: Record<string, boolean>) =>
    authFetch<{ prefs: Record<string, boolean> }>("/notifications", {
      method: "PUT",
      body: JSON.stringify({ prefs }),
    }),

  getInAppNotifications: (limit?: number) =>
    authFetch<{ notifications: any[]; unread: number }>(
      `/notifications/in-app${limit ? `?limit=${limit}` : ''}`
    ),

  markNotificationRead: (id: string) =>
    authFetch<{ ok: boolean }>(`/notifications/in-app/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    authFetch<{ ok: boolean }>('/notifications/in-app/read-all', { method: 'POST' }),

  updateProfile: (data: { 
    name?: string; 
    bio?: string; 
    avatarUrl?: string; 
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    notificationPrefs?: Record<string, boolean>;
    profileVisibility?: string;
    profileTheme?: string;
    portfolioTemplate?: string;
  }) =>
    authFetch<{ user: AuthUser }>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    authFetch<{ user: AuthUser }>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, password: newPassword }),
    }),
};

export function hasRole(user: AuthUser | null, ...roles: UserRole[]): boolean {
  return Boolean(user && roles.includes(user.role));
}
