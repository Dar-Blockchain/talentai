import React from "react";
import CandidateChatPageContent from "@/modules/chat/candidate-chat/components/CandidateChatPageContent";
import CompanyChatLayout from "@/modules/chat/shared/components/CompanyChatLayout";
import MessagesRouteGuard from "@/modules/chat/shared/components/MessagesRouteGuard";
import { chatDashboardShellFlexCn } from "@/modules/chat/shared/styles/modulePage";

interface CandidatesMessagesShellProps {
  conversationId: string | null;
}

// Content only — currently not wired to any page (no caller in the
// codebase). If this is ever used as a page's content, the page must supply
// the dashboard chrome itself via `Page.getLayout = getDashboardLayout`
// (see src/modules/shared/layouts/dashboard/getDashboardLayout.tsx).
const CandidatesMessagesShell: React.FC<CandidatesMessagesShellProps> = ({ conversationId }) => {
  return (
    <MessagesRouteGuard surface="company-candidates">
      <div className={chatDashboardShellFlexCn}>
        <CompanyChatLayout activeChannel="candidate">
          <CandidateChatPageContent
            initialConversationId={conversationId}
            isCompany
            fillHeight
            embeddedInCompanyHub
          />
        </CompanyChatLayout>
      </div>
    </MessagesRouteGuard>
  );
};

export default CandidatesMessagesShell;
