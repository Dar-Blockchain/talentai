import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { clearConnectedUser } from "@/store/slices/userSlice";
import { setAxiosLoggingOut } from "@/utils/axiosInstance";
import { clearTokens, getToken } from "../utils/token";
import { authApi } from "../api";
import type { AppDispatch } from "@/store/store";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  /** Call after successful OTP verification. */
  login: () => void;
  /** Call on session expiry or cross-tab sign-out (no network call needed). */
  clearAuth: () => void;
  /** Full sign-out: tells the backend to clear the cookie, then cleans up client state. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch    = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [isLoggingOut,    setIsLoggingOut]    = useState(false);

  const login     = useCallback(() => setIsAuthenticated(true),  []);
  const clearAuth = useCallback(() => setIsAuthenticated(false), []);

  const logout = useCallback(async () => {
    setAxiosLoggingOut(true);
    setIsLoggingOut(true);
    setIsAuthenticated(false);

    // Tell the backend to clear the jwt_token cookie server-side.
    // authApi.logout() never throws — we continue cleanup regardless.
    await authApi.logout();

    dispatch(clearConnectedUser());

    clearTokens();

    const userType = localStorage.getItem("userType");
    localStorage.clear();
    if (userType) localStorage.setItem("userType", userType);

    queryClient.clear();

    // Keep isLoggingOut=true briefly so in-flight 401 responses are suppressed.
    setTimeout(() => {
      setAxiosLoggingOut(false);
      setIsLoggingOut(false);
    }, 500);
  }, [dispatch, queryClient]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoggingOut, login, clearAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
