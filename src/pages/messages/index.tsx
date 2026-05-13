import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CandidateWorkspaceLayout from "@/components/layout/candidate/CandidateWorkspaceLayout";
import TeamChatPageContent from "@/modules/team-chat/components/TeamChatPageContent";
import CandidateChatPageContent from "@/modules/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/shared/chat/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/shared/chat/components/MessagesRouteGuard";
import { RootState } from "@/store/store";

export default function MessagesIndexPage() {
  const { t } = useTranslation("dashboard");
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);

  return (
    <MessagesRouteGuard surface="team">
      {role === "Candidate" ? (
        <CandidateWorkspaceLayout breadcrumb={t("candidate.nav.messages")} fillHeight>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
            <CandidateChatPageContent initialConversationId={null} isCompany={false} fillHeight />
          </Box>
        </CandidateWorkspaceLayout>
      ) : role === "Employee" ? (
        <DashboardLayout>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <TeamChatPageContent initialConversationId={null} fillHeight />
          </Box>
        </DashboardLayout>
      ) : (
        <DashboardLayout>
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <CompanyChatLayout activeChannel="team">
              <TeamChatPageContent initialConversationId={null} fillHeight embeddedInCompanyHub />
            </CompanyChatLayout>
          </Box>
        </DashboardLayout>
      )}
    </MessagesRouteGuard>
  );
}
