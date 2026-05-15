import { useEffect } from "react";
import { useRouter } from "next/router";

export function useLegacyRouteRedirect(target: string) {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace(target);
  }, [router, router.isReady, target]);
}
