import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { clearConnectedUser } from "@/store/slices/userSlice";
import { setAxiosLoggingOut } from "@/utils/axiosInstance";
import { clearTokens, getToken } from "../utils/token";
import { authApi } from "../api";
import type { AppDispatch } from "@/store/store";

// ─── Volatile state ────────────────────────────────────────────────────────────
// Changes on every auth transition (login / logout / session-expiry).
// Only subscribe here when your component needs to RE-RENDER on those events.
interface AuthState {
  isAuthenticated: boolean;
  isLoggingOut: boolean;
}

// ─── Stable actions ────────────────────────────────────────────────────────────
// These are useCallback refs — their object reference NEVER changes after mount.
// Subscribe here when you only call auth actions (e.g. a "Logout" button, the
// OTP success handler). Your component will not re-render on auth transitions.
interface AuthActions {
  login: () => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

const AuthStateContext   = createContext<AuthState   | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch    = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [isLoggingOut,    setIsLoggingOut]    = useState(false);

  const login     = useCallback(() => setIsAuthenticated(true),  []);
  const clearAuth = useCallback(() => setIsAuthenticated(false), []);

  const logout = useCallback(async () => {
    // Tell the backend to clear the jwt_token cookie BEFORE setting the
    // isLoggingOut flag — otherwise the request interceptor aborts it and
    // the server-side session is never closed.
    await authApi.logout();

    setAxiosLoggingOut(true);
    setIsLoggingOut(true);
    setIsAuthenticated(false);

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

  // State context: new object only when isAuthenticated or isLoggingOut changes.
  const stateValue = useMemo<AuthState>(
    () => ({ isAuthenticated, isLoggingOut }),
    [isAuthenticated, isLoggingOut],
  );

  // Actions context: login/clearAuth have no deps, logout deps are stable singletons.
  // This object reference effectively never changes after the first render.
  const actionsValue = useMemo<AuthActions>(
    () => ({ login, clearAuth, logout }),
    [login, clearAuth, logout],
  );

  return (
    <AuthActionsContext.Provider value={actionsValue}>
      <AuthStateContext.Provider value={stateValue}>
        {children}
      </AuthStateContext.Provider>
    </AuthActionsContext.Provider>
  );
}

// ─── Granular hooks ───────────────────────────────────────────────────────────

/** Subscribe only to volatile auth state. Re-renders on login / logout. */
export function useAuthState(): AuthState {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
}

/** Subscribe only to stable auth actions. NEVER re-renders on auth transitions. */
export function useAuthActions(): AuthActions {
  const ctx = useContext(AuthActionsContext);
  if (!ctx) throw new Error("useAuthActions must be used within AuthProvider");
  return ctx;
}

/**
 * Backward-compatible composite hook. Existing callsites continue to work,
 * but re-render on any auth state change. Prefer useAuthState / useAuthActions
 * when the component only needs one half.
 */
export function useAuthContext(): AuthState & AuthActions {
  return { ...useAuthState(), ...useAuthActions() };
}
