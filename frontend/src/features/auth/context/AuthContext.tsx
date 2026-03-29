import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSession, AuthUser } from "../types";
import { loginRequest, logoutRequest, signupRequest, type LoginCredentials, type SignupPayload } from "../services/authService";

const STORAGE_KEY = "odoo_hack_auth_session";

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.user?.id || !parsed?.tokens?.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null): void {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (creds: LoginCredentials) => Promise<AuthSession>;
  signup: (payload: SignupPayload) => Promise<AuthSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());

  const login = useCallback(async (creds: LoginCredentials) => {
    const next = await loginRequest(creds);
    writeSession(next);
    setSession(next);
    return next;
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const next = await signupRequest(payload);
    writeSession(next);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    const token = session?.tokens.accessToken;
    writeSession(null);
    setSession(null);
    if (token) {
      void logoutRequest(token).catch(() => {
        /* ignore network errors on logout */
      });
    }
  }, [session?.tokens.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.tokens.accessToken ?? null,
      refreshToken: session?.tokens.refreshToken ?? null,
      isAuthenticated: Boolean(session?.user),
      login,
      signup,
      logout,
    }),
    [session, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
