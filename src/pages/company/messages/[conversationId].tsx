import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import { useChatSession } from "@/hooks/useChatSession";
import ChatShell from "@/components/features/chat/ChatShell";

const CompanyMessagesPage: React.FC = () => {
  const router = useRouter();
  const { conversationId: routeId, postId, jobTitle } = router.query;

  const returnPostId   = typeof postId   === "string" ? postId   : null;
  const returnJobTitle = typeof jobTitle === "string" ? jobTitle : null;

  const session = useChatSession({
    initialConversationId: typeof routeId === "string" ? routeId : null,
    deleteRedirectRoute:   "/company/messages",
    onConversationChange:  (id) => window.history.replaceState(null, "", `/company/messages/${id}`),
  });

  // Sync URL param on first load
  useEffect(() => {
    if (routeId && !session.activeConversationId)
      session.setActiveConversationId(routeId as string);
  }, [routeId]);

  const subtitle = `${session.conversations.length} conversation${session.conversations.length !== 1 ? "s" : ""}${session.totalUnread > 0 ? ` · ${session.totalUnread} unread` : ""}`;

  return (
    <DashboardLayout>
      <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>

        <PageHeader
          title="Messages"
          subtitle={subtitle}
          breadcrumbs={[
            { label: "Dashboard", href: "/company/dashboard" },
            { label: "Messages" },
          ]}
          icon={ChatOutlined}
        />

        <ChatShell
          conversations={session.conversations}
          conversation={session.conversation}
          messages={session.messages}
          activeConversationId={session.activeConversationId}
          currentUserId={session.currentUserId}
          otherUser={session.otherUser}
          loading={session.loading}
          sending={session.sending}
          isCompany
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
          returnTo={returnPostId ? {
            postId:   returnPostId,
            jobTitle: returnJobTitle ?? "Job Post",
            onReturn: () => router.push(`/company/posts/${returnPostId}`),
          } : undefined}
        />

      </Box>
    </DashboardLayout>
  );
};

export default CompanyMessagesPage;
