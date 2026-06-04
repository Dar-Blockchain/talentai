import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CandidateWorkspaceLayout from "@/components/layout/candidate/CandidateWorkspaceLayout";
import { CandidateNotificationsPanel } from "@/modules/notifications/candidate";

function NotificationsContent() {
  return <CandidateNotificationsPanel variant="page" />;
}

export default function NotificationsPage() {
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const isCandidate = user?.role === "Candidate";

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
