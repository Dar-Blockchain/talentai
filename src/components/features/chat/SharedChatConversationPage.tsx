import React from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { useChatSession } from "@/hooks/useChatSession";
import ChatShell from "@/components/features/chat/ChatShell";

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
    onConversationChange:  (id) => window.history.replaceState(null, "", `${basePath}/${id}`),
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
          newMessage={session.newMessage}
          setNewMessage={session.setNewMessage}
          onSend={session.handleSendMessage}
          onKeyDown={session.handleKeyDown}
          deleteDialogOpen={session.deleteDialogOpen}
          setDeleteDialogOpen={session.setDeleteDialogOpen}
          isDeleting={session.isDeleting}
          onDeleteMessage={session.handleDeleteMessage}
          onConfirmDelete={session.handleConfirmDeleteConversation}
          onSelectConversation={session.handleSelectConversation}
        />
      </Box>
    </Layout>
  );
};

export default SharedChatConversationPage;
