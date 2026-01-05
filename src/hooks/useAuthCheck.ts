// hooks/useAuthCheck.ts
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/router";

export const useAuthCheck = () => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector(
    (state: RootState) => state.auth.user
  );
  const profile = useSelector(
    (state: RootState) => state.auth.profile
  );
  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleRedirectTo = (user: any, profile: any, returnUrl: any) => {
    const userRole = user?.role;
    const hasProfile = !!profile?._id;
    if (userRole === "Admin") {
      router.replace("/dashboard/admin");
      return;
    }
    if (returnUrl) {
      const redirectTo = hasProfile
        ? decodeURIComponent(returnUrl)
        : `/preferences?returnUrl=${encodeURIComponent(returnUrl)}`;
      router.replace(redirectTo);
      return;
    }
    if (!hasProfile) {
      router.replace("/preferences");
      return;
    }
    const redirctTo =
      userRole === "Company" ? "/dashboard/company" : "/dashboard/candidate";
    router.replace(redirctTo);
  };


  useEffect(() => {
    // Simulate auth check or wait for persisted state
    const timer = setTimeout(() => {
      setCheckingAuth(false);

      // Redirect logged-in users away from public pages
      if (isAuthenticated && router.pathname === "/signin1") {
        handleRedirectTo(user, profile, returnUrl)
      }
    }, 200); // small delay to let Redux restore persisted state

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return { checkingAuth, isAuthenticated };
};

  