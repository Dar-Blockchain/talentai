import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";

/**
 * Role-aware layout for `/messages` and `/messages/[conversationId]`.
 * Candidates get the workspace shell; Employees/Companies get the dashboard
 * shell with the tightened/full-height chat variant. Role is stable for the
 * session, so this still mounts its chosen layout once and stays persistent
 * across navigation between the two message routes — same contract as
 * `getDashboardLayout`. This is the ONLY place allowed to instantiate
 * `DashboardLayout` / `CandidateWorkspaceLayout` for messages; `MessagesShell`
 * (and any other chat shell) renders content only.
 */
function MessagesLayout({ children }: { children: ReactElement }) {
  const { t } = useTranslation("dashboard");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);

  if (role === "Candidate") {
    return (
      <CandidateWorkspaceLayout breadcrumb={t("candidate.nav.messages")} fillHeight>
        {children}
      </CandidateWorkspaceLayout>
    );
  }

  return (
    <DashboardLayout tightenMainPaddingTop tightenMainPaddingBottom fillMainHeight>
      {children}
    </DashboardLayout>
  );
}

export function getMessagesLayout(page: ReactElement) {
  return <MessagesLayout>{page}</MessagesLayout>;
}
