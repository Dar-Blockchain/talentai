import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import {
  fetchConversations,
  fetchConversation,
  fetchMessages,
  sendMessage,
  markConversationRead,
  deleteMessage as deleteMessageThunk,
  deleteConversation as deleteConversationThunk,
  addMessage,
  markMessageRead,
  removeMessage,
  removeConversation,
  selectConversations,
  selectCurrentConversation,
  selectCurrentConversationLoading,
  selectMessages,
  selectMessagesLoading,
  selectSendingMessage,
  clearCurrentConversation,
} from "@/store/slices/chatSlice";
import {
  ConversationSidebar,
  ConversationHeader,
  MessageList,
  MessageInput,
  DeleteConversationDialog,
} from "@/components/features/chat";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const CompanyMessagesPage: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showToast } = useToast();

  const { conversationId: routeConversationId, postId, jobTitle } = router.query;
  const returnPostId   = typeof postId   === "string" ? postId   : null;
  const returnJobTitle = typeof jobTitle === "string" ? jobTitle : null;

  const connectedUser = useSelector((state: RootState) => state.user?.connectedUser?.user);
  const currentUserId = connectedUser?._id;
  const isCompany     = true;

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  // On mobile: show sidebar (false) or chat panel (true)
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (routeConversationId && !activeConversationId) {
      setActiveConversationId(routeConversationId as string);
      setShowChat(true);
    }
  }, [routeConversationId]);

  const conversations       = useSelector(selectConversations);
  const conversation        = useSelector(selectCurrentConversation);
  const conversationLoading = useSelector(selectCurrentConversationLoading);
  const messages            = useSelector(selectMessages);
  const messagesLoading     = useSelector(selectMessagesLoading);
  const sending             = useSelector(selectSendingMessage);
  const loading             = conversationLoading || messagesLoading;

  const [newMessage,       setNewMessage]       = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting,       setIsDeleting]       = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // ── Socket connection ──
  useEffect(() => {
    if (!currentUserId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}/chat`,
      { auth: { userId: currentUserId, token }, transports: ["websocket", "polling"] }
    );
    socketRef.current = socket;

    socket.on("new_message", (message: any) => { dispatch(addMessage(message)); });
    socket.on("message_read", ({ messageId, conversationId: convId }: any) => {
      dispatch(markMessageRead({ messageId, conversationId: convId }));
    });
    socket.on("message_deleted", ({ messageId, conversationId: convId }: any) => {
      dispatch(removeMessage({ messageId, conversationId: convId }));
      showToast({ message: "A message was deleted", severity: "info" });
    });
    socket.on("conversation_deleted", ({ conversationId: convId }: any) => {
      dispatch(removeConversation(convId));
      showToast({ message: "This conversation was deleted", severity: "info" });
      router.push("/company/messages");
    });

    return () => { socket.disconnect(); };
  }, [currentUserId, dispatch]);

  // ── Join / leave conversation rooms ──
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;
    socket.emit("join_conversation", { conversationId: activeConversationId });
    return () => { socket.emit("leave_conversation", activeConversationId); };
  }, [activeConversationId]);

  // ── Fetch all conversations ──
  useEffect(() => {
    if (currentUserId) dispatch(fetchConversations(undefined));
  }, [currentUserId, dispatch]);

  // ── Fetch active conversation + messages ──
  useEffect(() => {
    if (!activeConversationId || !currentUserId) return;
    dispatch(fetchConversation(activeConversationId));
    dispatch(fetchMessages(activeConversationId));
    dispatch(markConversationRead(activeConversationId));
    return () => { dispatch(clearCurrentConversation()); };
  }, [activeConversationId, currentUserId, dispatch]);

  // ── Switch conversation ──
  const handleSelectConversation = useCallback((id: string) => {
    if (id === activeConversationId) return;
    setNewMessage("");
    setActiveConversationId(id);
    window.history.replaceState(null, "", `/company/messages/${id}`);
    if (isMobile) setShowChat(true);
  }, [activeConversationId, isMobile]);

  // ── Send message ──
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !currentUserId || !activeConversationId) return;

    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/;
    if (emailPattern.test(newMessage)) {
      showToast({ message: "Sharing email addresses is not allowed.", severity: "error" });
      return;
    }
    if (phonePattern.test(newMessage)) {
      showToast({ message: "Sharing phone numbers is not allowed.", severity: "error" });
      return;
    }

    const otherParticipant = conversation.participants.find((p: any) => p._id !== currentUserId);
    if (!otherParticipant) {
      showToast({ message: "Could not find recipient.", severity: "error" });
      return;
    }

    try {
      await dispatch(sendMessage({ conversationId: activeConversationId, receiverId: otherParticipant._id, text: newMessage })).unwrap();
      setNewMessage("");
    } catch (error: any) {
      showToast({ message: `Failed to send message: ${error || "Unknown error"}`, severity: "error" });
    }
  }, [newMessage, conversation, currentUserId, activeConversationId, dispatch, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await dispatch(deleteMessageThunk(messageId)).unwrap();
      showToast({ message: "Message deleted", severity: "success" });
    } catch (error: any) {
      showToast({ message: `Failed to delete message: ${error || "Unknown error"}`, severity: "error" });
    }
  }, [dispatch, showToast]);

  const confirmDeleteConversation = useCallback(async () => {
    if (!activeConversationId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteConversationThunk(activeConversationId)).unwrap();
      showToast({ message: "Conversation deleted", severity: "success" });
      setDeleteDialogOpen(false);
      router.push("/company/messages");
    } catch (error: any) {
      showToast({ message: `Failed to delete: ${error || "Unknown error"}`, severity: "error" });
    } finally {
      setIsDeleting(false);
    }
  }, [activeConversationId, dispatch, showToast, router]);

  const otherUser    = conversation?.participants?.find((p: any) => p._id !== currentUserId);
  const totalUnread  = conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);

  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>

          {/* Page header */}
          <PageHeader
            title="Messages"
            subtitle={`${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}${totalUnread > 0 ? ` · ${totalUnread} unread` : ""}`}
            breadcrumbs={[
              { label: "Dashboard", href: "/company/dashboard" },
              { label: "Messages" },
            ]}
          />

          {/* Return to post banner */}
          {returnPostId && (
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`,
              borderRadius: 2, px: 2, py: 1, mb: 2, gap: 2, flexWrap: "wrap",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkOutlined sx={{ fontSize: 16, color: TEAL }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: TEAL }}>
                  Chatting about:{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>{returnJobTitle || "Job Post"}</Box>
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<ArrowBackOutlined sx={{ fontSize: 14 }} />}
                onClick={() => router.push(`/company/posts/${returnPostId}`)}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "12px",
                  color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: 2,
                  px: 1.5, py: 0.5,
                  "&:hover": { bgcolor: "#CCFBF1" },
                }}
              >
                Return to Post
              </Button>
            </Box>
          )}

          {/* Main layout */}
          <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0 }}>

            {/* Sidebar — hidden on mobile when chat is open */}
            <Box
              sx={{
                width: { xs: "100%", md: 280 },
                flexShrink: 0,
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                bgcolor: "#fff",
                display: { xs: isMobile && showChat ? "none" : "flex", md: "flex" },
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  All Conversations ({conversations.length})
                </Typography>
              </Box>
              <ConversationSidebar
                conversations={conversations}
                currentConversationId={activeConversationId || ""}
                currentUserId={currentUserId}
                onSelectConversation={handleSelectConversation}
              />
            </Box>

            {/* Chat panel — hidden on mobile when sidebar is shown */}
            <Box
              sx={{
                flex: 1,
                display: { xs: isMobile && !showChat ? "none" : "flex", md: "flex" },
                flexDirection: "column",
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                bgcolor: "#fff",
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              {loading ? (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress sx={{ color: TEAL }} />
                </Box>
              ) : !conversation ? (
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, p: 4 }}>
                  <Box sx={{
                    width: 64, height: 64, borderRadius: "50%",
                    bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ChatOutlined sx={{ fontSize: 32, color: TEAL }} />
                  </Box>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                    {conversations.length === 0 ? "No conversations yet" : "Select a conversation"}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "center", maxWidth: 280 }}>
                    {conversations.length === 0
                      ? "Contact a candidate to start chatting"
                      : "Choose a conversation from the sidebar to open it"}
                  </Typography>
                  {isMobile && (
                    <Button
                      startIcon={<ArrowBackOutlined />}
                      onClick={() => setShowChat(false)}
                      sx={{ textTransform: "none", color: TEAL, fontWeight: 600 }}
                    >
                      Back to conversations
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  {/* On mobile, show a back button in the header */}
                  {isMobile && (
                    <Box sx={{ px: 1, pt: 1 }}>
                      <IconButton size="small" onClick={() => setShowChat(false)} sx={{ color: "#6B7280" }}>
                        <ArrowBackOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  )}
                  <ConversationHeader
                    otherUser={otherUser}
                    isCompany={isCompany}
                    onDeleteConversation={() => setDeleteDialogOpen(true)}
                  />
                  <MessageList
                    messages={messages}
                    currentUserId={currentUserId}
                    isCompany={isCompany}
                    onDeleteMessage={handleDeleteMessage}
                  />
                  <MessageInput
                    value={newMessage}
                    onChange={setNewMessage}
                    onSend={handleSendMessage}
                    onKeyDown={handleKeyDown}
                    sending={sending}
                  />
                </>
              )}
            </Box>
          </Box>
        </Box>

        <DeleteConversationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDeleteConversation}
          isDeleting={isDeleting}
        />
      </DashboardLayout>
    </RoleGuard>
  );
};

export default CompanyMessagesPage;
