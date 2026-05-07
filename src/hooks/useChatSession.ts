import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
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

export interface UseChatSessionOptions {
  /** Initial conversation ID from URL */
  initialConversationId: string | null;
  /** Route to push when this conversation is deleted */
  deleteRedirectRoute: string;
  /** Called on conversation switch so the page can sync the URL */
  onConversationChange?: (id: string) => void;
}

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

export const useChatSession = ({
  initialConversationId,
  deleteRedirectRoute,
  onConversationChange,
}: UseChatSessionOptions) => {
  const dispatch    = useDispatch<AppDispatch>();
  const router      = useRouter();
  const { showToast } = useToast();

  const currentUserId = useSelector((state: RootState) => state.user?.connectedUser?.user?._id);

  const conversations       = useSelector(selectConversations);
  const conversation        = useSelector(selectCurrentConversation);
  const conversationLoading = useSelector(selectCurrentConversationLoading);
  const messages            = useSelector(selectMessages);
  const messagesLoading     = useSelector(selectMessagesLoading);
  const sending             = useSelector(selectSendingMessage);
  const loading             = conversationLoading || messagesLoading;

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);

  // Sync when the URL param arrives (Next.js router.query is empty on first render)
  useEffect(() => {
    if (initialConversationId && !activeConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);
  const [newMessage,           setNewMessage]           = useState("");
  const [deleteDialogOpen,     setDeleteDialogOpen]     = useState(false);
  const [isDeleting,           setIsDeleting]           = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const activeConversationIdRef = useRef<string | null>(initialConversationId);

  // ── Socket — one connection per session ─────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}/chat`,
      { auth: { userId: currentUserId, token }, transports: ["websocket", "polling"] }
    );
    socketRef.current = socket;

    // Join whichever conversation is active when the socket connects
    socket.on("connect", () => {
      if (activeConversationIdRef.current) {
        socket.emit("join_conversation", { conversationId: activeConversationIdRef.current });
      }
    });

    socket.on("new_message", (msg: any) => {
      dispatch(addMessage(msg));
      const senderId = msg.sender?._id || msg.sender;
      if (senderId !== currentUserId) playNotificationSound();
    });
    socket.on("message_read",  ({ messageId, conversationId: cid }: any) =>
      dispatch(markMessageRead({ messageId, conversationId: cid })));
    socket.on("message_deleted", ({ messageId, conversationId: cid }: any) => {
      dispatch(removeMessage({ messageId, conversationId: cid }));
      showToast({ message: "A message was deleted", severity: "info" });
    });
    socket.on("conversation_deleted", ({ conversationId: cid }: any) => {
      dispatch(removeConversation(cid));
      showToast({ message: "This conversation was deleted", severity: "info" });
      router.push(deleteRedirectRoute);
    });

    return () => { socket.disconnect(); };
  }, [currentUserId]);

  // ── Join / leave room when active conversation changes ───
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    const s = socketRef.current;
    if (!s || !activeConversationId) return;
    s.emit("join_conversation", { conversationId: activeConversationId });
    return () => { s.emit("leave_conversation", activeConversationId); };
  }, [activeConversationId]);

  // ── Fetch conversation list ──────────────────────────────
  useEffect(() => {
    if (currentUserId) dispatch(fetchConversations(undefined));
  }, [currentUserId]);

  // ── Fetch active conversation + messages ─────────────────
  useEffect(() => {
    if (!activeConversationId || !currentUserId) return;
    dispatch(fetchConversation(activeConversationId));
    dispatch(fetchMessages(activeConversationId));
    dispatch(markConversationRead(activeConversationId));
    return () => { dispatch(clearCurrentConversation()); };
  }, [activeConversationId, currentUserId]);

  // ── Handlers ─────────────────────────────────────────────

  const handleSelectConversation = useCallback((id: string) => {
    if (id === activeConversationId) return;
    setNewMessage("");
    setActiveConversationId(id);
    onConversationChange?.(id);
  }, [activeConversationId, onConversationChange]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !currentUserId || !activeConversationId) return;

    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(newMessage)) {
      showToast({ message: "Sharing email addresses is not allowed.", severity: "error" });
      return;
    }
    if (/(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/.test(newMessage)) {
      showToast({ message: "Sharing phone numbers is not allowed.", severity: "error" });
      return;
    }

    const other = conversation.participants.find((p: any) => p._id !== currentUserId);
    if (!other) {
      showToast({ message: "Could not find recipient.", severity: "error" });
      return;
    }

    try {
      const result = await dispatch(sendMessage({
        conversationId: activeConversationId,
        receiverId: other._id,
        text: newMessage,
      })).unwrap();
      // Explicitly add to messages state — don't rely solely on WebSocket echo
      if (result?._id) dispatch(addMessage(result));
      setNewMessage("");
    } catch (err: any) {
      showToast({ message: `Failed to send: ${err || "Unknown error"}`, severity: "error" });
    }
  }, [newMessage, conversation, currentUserId, activeConversationId, dispatch, showToast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }, [handleSendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await dispatch(deleteMessageThunk(messageId)).unwrap();
      showToast({ message: "Message deleted", severity: "success" });
    } catch (err: any) {
      showToast({ message: `Failed to delete: ${err || "Unknown error"}`, severity: "error" });
    }
  }, [dispatch, showToast]);

  const handleConfirmDeleteConversation = useCallback(async () => {
    if (!activeConversationId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteConversationThunk(activeConversationId)).unwrap();
      showToast({ message: "Conversation deleted", severity: "success" });
      setDeleteDialogOpen(false);
      router.push(deleteRedirectRoute);
    } catch (err: any) {
      showToast({ message: `Failed to delete: ${err || "Unknown error"}`, severity: "error" });
    } finally {
      setIsDeleting(false);
    }
  }, [activeConversationId, dispatch, showToast, router, deleteRedirectRoute]);

  const totalUnread = conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
  const otherUser   = conversation?.participants?.find((p: any) => p._id !== currentUserId);

  return {
    // data
    currentUserId,
    conversations,
    conversation,
    messages,
    loading,
    sending,
    otherUser,
    totalUnread,
    // active conversation
    activeConversationId,
    setActiveConversationId,
    // message input
    newMessage,
    setNewMessage,
    // delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    // handlers
    handleSelectConversation,
    handleSendMessage,
    handleKeyDown,
    handleDeleteMessage,
    handleConfirmDeleteConversation,
  };
};
