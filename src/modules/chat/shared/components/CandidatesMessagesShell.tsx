import React from "react";
import { Box } from "@mui/material";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import CandidateChatPageContent from "@/modules/chat/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/chat/shared/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/chat/shared/components/MessagesRouteGuard";
import { chatDashboardShellFlexSx } from "@/modules/chat/shared/styles/modulePage";

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
