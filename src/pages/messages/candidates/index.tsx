import React from "react";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CandidateChatPageContent from "@/modules/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/shared/chat/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/shared/chat/components/MessagesRouteGuard";

export default function CompanyCandidateMessagesIndexPage() {
  return (
    <MessagesRouteGuard surface="company-candidates">
      <DashboardLayout>
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <CompanyChatLayout activeChannel="candidate">
            <CandidateChatPageContent initialConversationId={null} isCompany fillHeight />
          </CompanyChatLayout>
        </Box>
      </DashboardLayout>
    </MessagesRouteGuard>
  );
}
