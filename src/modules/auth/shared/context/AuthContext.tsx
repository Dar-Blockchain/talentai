import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { clearConnectedUser } from "@/store/slices/userSlice";
import { setAxiosLoggingOut } from "@/utils/axiosInstance";
import { getToken } from "@/utils/tokenUtils";
import type { AppDispatch } from "@/store/store";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  /** Call after successful OTP verification. */
  login: () => void;
  /** Call on session expiry or cross-tab sign-out (no cleanup needed). */
  clearAuth: () => void;
  /** Full sign-out: clears storage, cookies, query cache, then hides spinner. */
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

    dispatch(clearConnectedUser());

    const userType = localStorage.getItem("userType");
    localStorage.clear();
    if (userType) localStorage.setItem("userType", userType);

    Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name, { path: "/" }));

    queryClient.clear();

    // Keep isLoggingOut=true for 500 ms so in-flight 401 responses are suppressed
    // before axios interceptors are re-enabled.
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
