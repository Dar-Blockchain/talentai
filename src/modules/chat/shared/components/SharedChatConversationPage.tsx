import React from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { useChatSession } from "@/hooks/useChatSession";
import ChatShell from "./ChatShell";

interface Props {
  basePath: string;
  isCompany: boolean;
  layout: React.FC<{ children: React.ReactNode }>;
}

const SharedChatConversationPage: React.FC<Props> = ({ basePath, isCompany, layout: Layout }) => {
  const router = useRouter();
  const { conversationId: routeId } = router.query;

  const session = useChatSession({
    initialConversationId: typeof routeId === "string" ? routeId : null,
    deleteRedirectRoute:   basePath,
    onConversationChange: (id) => {
      void router.replace(`${basePath}/${id}`, undefined, { scroll: false });
    },
  });
  return (
    <Layout>
      <Box sx={{ flex: 1, display: "flex", minHeight: 0, p: { xs: 1, sm: 2 } }}>
        <ChatShell
          conversations={session.conversations}
          conversation={session.conversation}
          messages={session.messages}
          activeConversationId={session.activeConversationId}
          currentUserId={session.currentUserId}
          otherUser={session.otherUser}
          loading={session.loading}
          sending={session.sending}
          isCompany={isCompany}
          onSend={session.handleSendMessage}
          onDeleteMessage={session.handleDeleteMessage}
          onDeleteConversation={session.executeDeleteConversation}
          onSelectConversation={session.handleSelectConversation}
        />
      </Box>
    </Layout>
  );
};

export default SharedChatConversationPage;
