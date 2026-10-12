import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, clearToken, getToken, isTokenExpired, setToken, type AuthUser, type UserRole } from "./authClient";

type User = AuthUser | null;

const Ctx = createContext<{
  user: User;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, githubUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOAuth: (code: string) => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  checkAuth: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);

  const loadMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    if (isTokenExpired(token)) {
      clearToken();
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const { user: me } = await authApi.me();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const clearLmsStorage = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith("fa_") || 
        key.startsWith("fraylon_") || 
        key.startsWith("lms:")
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  };

  useEffect(() => {
    const onLogout = () => {
      clearLmsStorage();
      setUser(null);
    };
    window.addEventListener("fa:logout", onLogout);
    return () => window.removeEventListener("fa:logout", onLogout);
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token, user: me } = await authApi.login(email, password);
    setToken(access_token);
    setUser(me);
  };

  const register = async (email: string, password: string, name: string, githubUrl?: string) => {
    const { access_token, user: me } = await authApi.register(email, password, name, githubUrl);
    setToken(access_token);
    setUser(me);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearToken();
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    window.location.href = "/#/";
  };

  const completeOAuth = async (code: string) => {
    const { access_token, user: me } = await authApi.exchangeOAuthCode(code);
    setToken(access_token);
    setUser(me);
  };

  const hasRole = (...roles: UserRole[]) => Boolean(user && roles.includes(user.role));

  return (
    <Ctx.Provider value={{ user, ready, login, register, logout, completeOAuth, hasRole, checkAuth: loadMe }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
