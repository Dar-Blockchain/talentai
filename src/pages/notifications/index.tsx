import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";
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
