import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
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
  clearAuth: () => void;
  logout: () => Promise<void>;
  finishLoggingOut: () => void;
}

const AuthStateContext   = createContext<AuthState   | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

function endSession(dispatch: AppDispatch, queryClient: QueryClient) {
  dispatch(clearConnectedUser());
  clearTokens();

  const userType = localStorage.getItem("userType");
  localStorage.clear();
  if (userType) localStorage.setItem("userType", userType);

  persistor.purge();

  queryClient.clear();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch    = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [isLoggingOut,    setIsLoggingOut]    = useState(false);

  const login     = useCallback(() => setIsAuthenticated(true),  []);
  const clearAuth = useCallback(() => setIsAuthenticated(false), []);

  const finishLoggingOut = useCallback(() => {
    setAxiosLoggingOut(false);
    setIsLoggingOut(false);
  }, []);

  const logout = useCallback(async () => {
    setAxiosLoggingOut(true);
    setIsLoggingOut(true);
    clearAuth();

    endSession(dispatch, queryClient);

    authApi.logout().catch(() => {});

    setTimeout(finishLoggingOut, 8000);
  }, [dispatch, queryClient, clearAuth, finishLoggingOut]);

  const stateValue = useMemo<AuthState>(
    () => ({ isAuthenticated, isLoggingOut }),
    [isAuthenticated, isLoggingOut],
  );

  const actionsValue = useMemo<AuthActions>(
    () => ({ login, clearAuth, logout, finishLoggingOut }),
    [login, clearAuth, logout, finishLoggingOut],
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
