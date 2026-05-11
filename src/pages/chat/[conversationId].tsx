import React from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import ChatLayout from "@/components/layout/dashboard/ChatLayout";
import { useChatSession } from "@/hooks/useChatSession";
import ChatShell from "@/components/features/chat/ChatShell";
import { RootState } from "@/store/store";

export default function ChatConversationPage() {
  const router = useRouter();
  const { conversationId: routeId } = router.query;
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  // Company and Employee are on the recruiter side — they can delete conversations/messages
  const isCompany = role === "Company" || role === "Employee";
  const Layout = isCompany ? DashboardLayout : ChatLayout;

  const session = useChatSession({
    initialConversationId: typeof routeId === "string" ? routeId : null,
    deleteRedirectRoute:   "/chat",
    onConversationChange:  (id) => window.history.replaceState(null, "", `/chat/${id}`),
  });

  return (
    <Layout>
      <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
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
}
