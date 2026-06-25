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
import { persistor, type AppDispatch } from "@/store/store";

interface AuthState {
  isAuthenticated: boolean;
  isLoggingOut: boolean;
}

interface AuthActions {
  login: () => void;
  logout: () => Promise<void>;
  finishLoggingOut: () => void;
}

const AuthStateContext   = createContext<AuthState   | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

// Clears the cookie and localStorage only — no React or Redux state changes.
// Keeping Redux/auth state intact while the overlay is visible prevents the
// dashboard from re-rendering with null data before navigation completes.
function clearStorageAndToken() {
  clearTokens();
  const userType = localStorage.getItem("userType");
  localStorage.clear();
  if (userType) localStorage.setItem("userType", userType);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch    = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [isLoggingOut,    setIsLoggingOut]    = useState(false);

  const login = useCallback(() => setIsAuthenticated(true), []);

  // Runs after the route change to /signin completes (or after the 8 s safety
  // timeout). At this point the user is on the signin page, so clearing
  // Redux + React Query + auth state cannot flash a broken dashboard.
  const finishLoggingOut = useCallback(() => {
    dispatch(clearConnectedUser());
    persistor.purge();
    queryClient.clear();
    setIsAuthenticated(false);
    setAxiosLoggingOut(false);
    setIsLoggingOut(false);
  }, [dispatch, queryClient]);

  const logout = useCallback(async () => {
    // 1. Fire server-side JWT revocation BEFORE blocking the Axios interceptor.
    //    The interceptor aborts any request made while _isLoggingOut is true, so
    //    authApi.logout() must be in-flight before that flag is set.
    authApi.logout().catch(() => {});
    // 2. Block all other outgoing requests immediately.
    setAxiosLoggingOut(true);
    // 3. Show the overlay. isAuthenticated and Redux state are left intact so
    //    dashboard components keep rendering their current data underneath it —
    //    nothing breaks or goes empty while the overlay is visible.
    setIsLoggingOut(true);
    // 4. Remove the cookie now so the middleware lets the /signin route through
    //    without redirecting back to the dashboard.
    clearStorageAndToken();
    // 5. Safety valve: if routeChangeComplete never fires, clean up after 8 s.
    setTimeout(finishLoggingOut, 8000);
  }, [finishLoggingOut]);

  const stateValue = useMemo<AuthState>(
    () => ({ isAuthenticated, isLoggingOut }),
    [isAuthenticated, isLoggingOut],
  );

  const actionsValue = useMemo<AuthActions>(
    () => ({ login, logout, finishLoggingOut }),
    [login, logout, finishLoggingOut],
  );

  return (
    <AuthActionsContext.Provider value={actionsValue}>
      <AuthStateContext.Provider value={stateValue}>
        {children}
      </AuthStateContext.Provider>
    </AuthActionsContext.Provider>
  );
}

export function useAuthState(): AuthState {
  const ctx = useContext(AuthStateContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
}

export function useAuthActions(): AuthActions {
  const ctx = useContext(AuthActionsContext);
  if (!ctx) throw new Error("useAuthActions must be used within AuthProvider");
  return ctx;
}

export function useAuthContext(): AuthState & AuthActions {
  return { ...useAuthState(), ...useAuthActions() };
}
