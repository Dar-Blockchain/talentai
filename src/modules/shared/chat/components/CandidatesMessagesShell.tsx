import React from "react";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CandidateChatPageContent from "@/modules/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/shared/chat/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/shared/chat/components/MessagesRouteGuard";
import { chatDashboardShellFlexSx } from "@/modules/shared/chat/styles/modulePage";

interface CandidatesMessagesShellProps {
  conversationId: string | null;
}

const CandidatesMessagesShell: React.FC<CandidatesMessagesShellProps> = ({ conversationId }) => {
  return (
    <MessagesRouteGuard surface="company-candidates">
      <DashboardLayout tightenMainPaddingTop tightenMainPaddingBottom fillMainHeight>
        <Box sx={chatDashboardShellFlexSx}>
          <CompanyChatLayout activeChannel="candidate">
            <CandidateChatPageContent
              initialConversationId={conversationId}
              isCompany
              fillHeight
              embeddedInCompanyHub
            />
          </CompanyChatLayout>
        </Box>
      </DashboardLayout>
    </MessagesRouteGuard>
  );
};

export default CandidatesMessagesShell;
