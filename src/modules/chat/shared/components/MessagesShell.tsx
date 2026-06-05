import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import CandidateWorkspaceLayout from "@/modules/shared/layouts/candidate/CandidateWorkspaceLayout";
import TeamChatPageContent from "@/modules/chat/team-chat/components/TeamChatPageContent";
import CandidateChatPageContent from "@/modules/chat/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/chat/shared/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/chat/shared/components/MessagesRouteGuard";
import { chatDashboardShellFlexSx } from "@/modules/chat/shared/styles/modulePage";
import { selectCandidateConversations } from "@/modules/chat/candidate-chat/store/candidateChatSlice";
import { RootState } from "@/store/store";
import type { CompanyChatChannel } from "@/modules/chat/shared/constants/companyChannels";

interface MessagesShellProps {
  conversationId: string | null;
}

const MessagesShell: React.FC<MessagesShellProps> = ({ conversationId }) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const candidateConversations = useSelector(selectCandidateConversations);

  const companyActiveChannel = useMemo((): CompanyChatChannel => {
    if (conversationId) {
      return candidateConversations.some((c) => c._id === conversationId)
        ? "candidate"
        : "team";
    }
    return router.query.ch === "candidate" ? "candidate" : "team";
  }, [conversationId, candidateConversations, router.query.ch]);

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
            <CompanyChatLayout activeChannel={companyActiveChannel}>
              {companyActiveChannel === "candidate" ? (
                <CandidateChatPageContent initialConversationId={conversationId} isCompany fillHeight embeddedInCompanyHub />
              ) : (
                <TeamChatPageContent initialConversationId={conversationId} fillHeight embeddedInCompanyHub />
              )}
            </CompanyChatLayout>
          </Box>
        </DashboardLayout>
      )}
    </MessagesRouteGuard>
  );
};

export default MessagesShell;
