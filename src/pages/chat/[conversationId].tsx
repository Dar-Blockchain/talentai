import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import { RootState } from "@/store/store";
import { useChatSession } from "@/hooks/useChatSession";
import ChatShell from "@/components/features/chat/ChatShell";

const ConversationPage: React.FC = () => {
  const router  = useRouter();
  const { conversationId: routeId } = router.query;

  const profile   = useSelector((state: RootState) => state.user?.connectedUser?.profile);
  const isCompany = profile?.type === "Company";

  const session = useChatSession({
    initialConversationId: typeof routeId === "string" ? routeId : null,
    deleteRedirectRoute:   "/chat",
    onConversationChange:  (id) => window.history.replaceState(null, "", `/chat/${id}`),
  });

  useEffect(() => {
    if (routeId && !session.activeConversationId)
      session.setActiveConversationId(routeId as string);
  }, [routeId]);

  const totalConvs = session.conversations.length;
  const unread     = session.totalUnread;
  const subtitle   = `${totalConvs} conversation${totalConvs !== 1 ? "s" : ""}${unread > 0 ? ` · ${unread} unread` : ""}`;

  return (
    <DashboardLayout>
      <PageHeader
        title="Messages"
        subtitle={subtitle}
        breadcrumbs={[
          { label: "Dashboard", href: isCompany ? "/company/dashboard" : "/dashboard/candidate" },
          { label: "Messages" },
        ]}
        icon={ChatOutlined}
      />
      <Box sx={{ height: "calc(100vh - 180px)", display: "flex" }}>
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
    </DashboardLayout>
  );
};

export default ConversationPage;
