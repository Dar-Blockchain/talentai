import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
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
    // 1. Paint the overlay to the DOM synchronously before anything else runs.
    //    Without flushSync, setIsLoggingOut is just a scheduled React update —
    //    it won't actually appear until the next render cycle. On slow networks
    //    (3G), aborting in-flight requests and clearing storage causes components
    //    to flash empty/loading states during that gap. flushSync ensures the
    //    overlay is pixel-visible BEFORE we touch any other state.
    flushSync(() => { setIsLoggingOut(true); });
    // 2. Fire server-side JWT revocation before blocking the Axios interceptor.
    authApi.logout().catch(() => {});
    // 3. Block new outgoing requests (overlay is already visible, so any
    //    in-flight request state changes are safely hidden underneath it).
    setAxiosLoggingOut(true);
    // 4. Remove auth_present so the middleware lets /signin through.
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
