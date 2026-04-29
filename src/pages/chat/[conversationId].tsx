import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Box, Container, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "@/components/layout/Header";
import { RootState } from "@/store/store";
import { useChatSession } from "@/hooks/useChatSession";
import ChatShell from "@/components/features/chat/ChatShell";

const PURPLE = "#8310FF";

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

  // Sync URL param on first load
  useEffect(() => {
    if (routeId && !session.activeConversationId)
      session.setActiveConversationId(routeId as string);
  }, [routeId]);

  const dashboardRoute = isCompany ? "/company/dashboard" : "/dashboard/candidate";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "rgba(251,254,255,1)" }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Page header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton
            onClick={() => router.push(dashboardRoute)}
            sx={{ color: PURPLE, bgcolor: "rgba(131,16,255,0.08)", "&:hover": { bgcolor: "rgba(131,16,255,0.15)" } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{
            fontWeight: 600, color: "#000", fontSize: "20px",
            position: "relative", display: "inline-block",
            "&::after": {
              content: '""', position: "absolute", bottom: "-4px", left: 0,
              width: "38px", height: "5px", background: PURPLE, borderRadius: "2px",
            },
          }}>
            Messages
          </Typography>
        </Box>

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
      </Container>
    </Box>
  );
};

export default ConversationPage;
