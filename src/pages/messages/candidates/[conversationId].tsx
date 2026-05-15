import React from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CandidateChatPageContent from "@/modules/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/shared/chat/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/shared/chat/components/MessagesRouteGuard";
import { chatDashboardShellFlexSx } from "@/modules/shared/chat/styles/modulePage";

export default function CompanyCandidateMessagesConversationPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const routeId = typeof conversationId === "string" ? conversationId : null;

  return (
    <MessagesRouteGuard surface="company-candidates">
      <DashboardLayout
        tightenMainPaddingTop
        tightenMainPaddingBottom
        fillMainHeight
      >
        <Box sx={chatDashboardShellFlexSx}>
          <CompanyChatLayout activeChannel="candidate">
            {!router.isReady ? (
              <Box sx={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", minHeight: 280 }}>
                <CircularProgress sx={{ color: "#0D9488" }} />
              </Box>
            ) : (
              <CandidateChatPageContent
                initialConversationId={routeId}
                isCompany
                fillHeight
                embeddedInCompanyHub
              />
            )}
          </CompanyChatLayout>
        </Box>
      </DashboardLayout>
    </MessagesRouteGuard>
  );
}
