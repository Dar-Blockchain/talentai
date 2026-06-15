import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api";
import { useAuthContext } from "../context/AuthContext";

/**
 * Fetches the current session from GET /auth/me.
 * Only runs when the user is authenticated; returns stale data for 5 minutes.
 */
export function useMe() {
  const { isAuthenticated } = useAuthContext();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn:  () => authApi.me(),
    enabled:  isAuthenticated,
    retry:    false,
    staleTime: 5 * 60 * 1000,
  });
}
