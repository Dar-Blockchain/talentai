import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { CandidateNotificationsPanel } from "@/modules/notifications/candidate";
import { CandidateWorkspaceLayout, DashboardLayout } from "@/modules/shared/layouts";

function NotificationsContent() {
  return <CandidateNotificationsPanel variant="page" />;
}

export default function NotificationsPage() {
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const isLoggingOut = useSelector(isLoggingOutCheck);

  // During logout the user is cleared from the store. Without this guard the
  // role check below would fall back to the company DashboardLayout, flashing
  // the company UI to candidates/employees before the redirect to /signin.
  if (isLoggingOut || !user) {
    return <LoadingScreen />;
  }

  const isCandidate = user.role === "Candidate";

  if (isCandidate) {
    return (
      <CandidateWorkspaceLayout>
        <NotificationsContent />
      </CandidateWorkspaceLayout>
    );
  }

  return (
    <DashboardLayout>
      <NotificationsContent />
    </DashboardLayout>
  );
}
