import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface MemberGuardProps {
  children: React.ReactNode;
}

const MemberGuard = ({ children }: MemberGuardProps) => {
  const router = useRouter();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { user, companyMembership } = useSelector(
    (state: RootState) => state.user.connectedUser
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!!companyMembership?._id) return;

    if (user?.role === "Company") {
      router.replace("/company/dashboard");
    } else if (user?.role === "Candidate") {
      router.replace("/dashboard/candidate");
    } else if (user?.role === "Admin") {
      router.replace("/dashboard/admin");
    }
  }, [isAuthenticated, companyMembership?._id, user, router]);

  if (!companyMembership?._id) return null;

  return <>{children}</>;
};

export default MemberGuard;
