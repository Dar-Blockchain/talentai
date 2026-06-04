import CandidateWorkspaceLayout from "@/components/layout/candidate/CandidateWorkspaceLayout";
import { CandidateNotificationsPanel } from "@/modules/notifications/candidate";

export default function CandidateNotificationsPage() {
  return (
    <CandidateWorkspaceLayout>
      <CandidateNotificationsPanel variant="page" />
    </CandidateWorkspaceLayout>
  );
}
