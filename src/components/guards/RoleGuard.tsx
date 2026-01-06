import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import LoadingScreen from "../ui/LoadingScreen";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector(selectProfile); 
  const {user} = useSelector((state: RootState) => state.auth);
  const isLoggingOut = useSelector(isLoggingOutCheck);

  useEffect(() => {
    if (!profile && !isLoggingOut) {
      dispatch(getMyProfile());
    }
  }, [profile, isLoggingOut, dispatch]);

  useEffect(() => {
    if (!user || !profile || isLoggingOut) return;

    if (!allowedRoles.includes(user.role)) {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, profile, allowedRoles, router, isLoggingOut]);

  if(isLoggingOut) return <LoadingScreen title='Logging out, please wait...'/>

  if (!user || !profile) return <LoadingScreen />;

  return <>{children}</>;
};

export default RoleGuard;
