import { useCallback } from "react";
import { useRouter } from "next/router";
import { useAuthContext } from "../context/AuthContext";

/**
 * Returns a stable callback that runs the full logout sequence and then
 * redirects the user. Pass a custom path to override the default /signin.
 */
export function useLogout(redirectTo = "/signin") {
  const { logout } = useAuthContext();
  const router     = useRouter();

  return useCallback(async () => {
    await logout();
    router.replace(redirectTo);
  }, [logout, router, redirectTo]);
}
