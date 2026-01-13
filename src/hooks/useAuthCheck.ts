// hooks/useAuthCheck.ts
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/router";

const PUBLIC_ROUTES = ["/signin", "/home/candidate", "/home/company", "/posts"];

export const useAuthCheck = () => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;

  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const { user, companyMembership, profile } = useSelector((state: RootState) => state.user.connectedUser);

  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleRedirectTo = (user: any, profile: any, returnUrl?: string) => {
    const userRole = user?.role;
    const hasProfile = !!profile?._id;
    const hasMembership = !!companyMembership?._id;

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
    
    if(hasMembership){
      router.replace("/workspaces");
      return;
    }

    router.replace(
      userRole === "Company"
        ? "/dashboard/company"
        : "/dashboard/candidate"
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckingAuth(false);

      // ✅ Authenticated user trying to access signin
      if (isAuthenticated && router.pathname === "/signin") {
        handleRedirectTo(user, profile, returnUrl);
        return;
      }

      // ❌ Unauthenticated user accessing protected route
      if (
        !isAuthenticated &&
        !PUBLIC_ROUTES.includes(router.pathname)
      ) {
        router.replace("/signin"); 
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router.pathname]);

  return { checkingAuth, isAuthenticated };
};
