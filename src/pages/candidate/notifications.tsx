import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";
import { CandidateNotificationsPanel } from "@/modules/notifications/candidate";

export default function CandidateNotificationsPage() {
  return (
    <CandidateWorkspaceLayout>
      <CandidateNotificationsPanel variant="page" />
    </CandidateWorkspaceLayout>
  );
}
