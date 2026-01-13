import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import LoadingScreen from "../ui/LoadingScreen";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const router = useRouter();
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);
  const isLoggingOut = useSelector(isLoggingOutCheck);
  
  useEffect(() => {
    if (!user || isLoggingOut) return;
    const role = user?.role;
    if(!role && !profile) {
      router.replace(`/preferences`);
      return;
    }
    if (!allowedRoles.includes(role)) {
      router.replace(`/dashboard/${role?.toLowerCase()}`);
    }
  }, [user, allowedRoles, router, isLoggingOut]);

  if (!user || !profile) return <LoadingScreen />;

  return <>{children}</>;
};

export default RoleGuard;
