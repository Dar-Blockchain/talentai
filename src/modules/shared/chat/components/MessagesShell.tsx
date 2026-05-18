import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CandidateWorkspaceLayout from "@/components/layout/candidate/CandidateWorkspaceLayout";
import TeamChatPageContent from "@/modules/team-chat/components/TeamChatPageContent";
import CandidateChatPageContent from "@/modules/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/shared/chat/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/shared/chat/components/MessagesRouteGuard";
import { chatDashboardShellFlexSx } from "@/modules/shared/chat/styles/modulePage";
import { RootState } from "@/store/store";

interface MessagesShellProps {
  conversationId: string | null;
}

const MessagesShell: React.FC<MessagesShellProps> = ({ conversationId }) => {
  const { t } = useTranslation("dashboard");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);

  return (
    <MessagesRouteGuard surface="team">
      {role === "Candidate" ? (
        <CandidateWorkspaceLayout breadcrumb={t("candidate.nav.messages")} fillHeight>
          <Box sx={{ ...chatDashboardShellFlexSx, height: "100%" }}>
            <CandidateChatPageContent initialConversationId={conversationId} isCompany={false} fillHeight />
          </Box>
        </CandidateWorkspaceLayout>
      ) : role === "Employee" ? (
        <DashboardLayout tightenMainPaddingTop tightenMainPaddingBottom fillMainHeight>
          <Box sx={chatDashboardShellFlexSx}>
            <TeamChatPageContent initialConversationId={conversationId} fillHeight />
          </Box>
        </DashboardLayout>
      ) : (
        <DashboardLayout tightenMainPaddingTop tightenMainPaddingBottom fillMainHeight>
          <Box sx={chatDashboardShellFlexSx}>
            <CompanyChatLayout activeChannel="team">
              <TeamChatPageContent initialConversationId={conversationId} fillHeight embeddedInCompanyHub />
            </CompanyChatLayout>
          </Box>
        </DashboardLayout>
      )}
    </MessagesRouteGuard>
  );
};

export default MessagesShell;
