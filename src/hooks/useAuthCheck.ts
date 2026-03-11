import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/router";
import { isInvitationUrl } from "@/utils/memberInvitation";

const PUBLIC_ROUTES = ["/signin", "/register", "/home/candidate", "/home/company", "/posts"];
// Routes accessible to authenticated users who haven't completed their profile yet
const SETUP_ROUTES = ["/register", "/employee-setup"];

export const useAuthCheck = () => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { user, companyMembership, profile } = useSelector(
    (state: RootState) => state.user.connectedUser,
  );

  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleRedirectTo = (user: any, profile: any, returnUrl?: string) => {
    const userRole = user?.role;
    const hasProfile = !!profile?._id;
    const hasMembership =
      !!companyMembership?._id || isInvitationUrl(returnUrl);

    if (userRole === "Admin") {
      router.replace("/dashboard/admin");
      return;
    }

    if (returnUrl) {
      const redirectTo = hasProfile
        ? decodeURIComponent(returnUrl)
        : hasMembership
          ? `/employee-setup?returnUrl=${encodeURIComponent(returnUrl)}`
          : `/register?returnUrl=${encodeURIComponent(returnUrl)}`;
      router.replace(redirectTo);
      return;
    }

    if (hasMembership) {
      router.replace("/workspaces");
      return;
    }

    router.replace(
      userRole === "Company" ? "/company/dashboard" : "/dashboard/candidate",
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

      // ✅ Authenticated employee on setup page — let them stay
      if (isAuthenticated && SETUP_ROUTES.includes(router.pathname)) {
        return;
      }

      // ❌ Unauthenticated user accessing protected route
      if (!isAuthenticated && !PUBLIC_ROUTES.includes(router.pathname)) {
        router.replace("/signin");
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router.pathname]);

  return { checkingAuth, isAuthenticated };
};
