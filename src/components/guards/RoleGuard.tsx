import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import LoadingScreen from "../ui/LoadingScreen";
import { getMyProfile } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>()
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);
  const isLoggingOut = useSelector(isLoggingOutCheck);
  
  useEffect(() => {
    if (!user || isLoggingOut) return;

    const role = user?.role;

    // Only fetch profile if we don't have it yet
    if (!profile) {
      dispatch(getMyProfile());
      return; // Wait for profile to load before doing redirects
    }

    if(!role && !profile) {
      router.replace(`/preferences`);
      return;
    }
    if (!allowedRoles.includes(role)) {
      router.replace(`/dashboard/${role?.toLowerCase()}`);
    }
  }, [user, allowedRoles, router, isLoggingOut, profile, dispatch]);

  if (!user || !profile) return <LoadingScreen />;

  return <>{children}</>;
};

export default RoleGuard;
