import React, { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useSelector, useDispatch } from "react-redux";
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

// ── Helpers (inlined to keep component self-contained) ────────────────────────
interface Participant {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profile?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    type?: "Candidate" | "Company";
    companyDetails?: { name?: string };
  };
}

const getDisplayName = (p: Participant | undefined): string => {
  if (!p) return "Unknown";
  if (p.profile?.type === "Company" && p.profile?.companyDetails?.name)
    return p.profile.companyDetails.name;
  if (p.profile?.firstName || p.profile?.lastName)
    return `${p.profile.firstName ?? ""} ${p.profile.lastName ?? ""}`.trim();
  if (p.firstName || p.lastName)
    return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
  return "Unknown";
};

const getInitial = (p: Participant | undefined) =>
  getDisplayName(p).charAt(0).toUpperCase() || "?";

const fmtTime = (ts: string) =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const fmtListTime = (ts: string) => {
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 3_600_000;
  if (diff < 24) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (diff < 48) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_LIGHT  = "#99F6E4";

// ─── Sidebar ───────────────────────────────────────────────────────────────────
interface ConvItem {
  _id: string;
  participants: Participant[];
  lastMessage?: { text: string; timestamp: string };
  unreadCount: number;
  updatedAt: string;
}

const Sidebar: React.FC<{
  conversations: ConvItem[];
  activeId: string | null;
  currentUserId: string | undefined;
  onSelect: (id: string) => void;
}> = ({ conversations, activeId, currentUserId, onSelect }) => {
  const other = (c: ConvItem) => c.participants.find((p) => p._id !== currentUserId);

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 300 },
        flexShrink: 0,
        bgcolor: "#fff",
        borderRadius: 3,
        border: "1px solid #f3f4f6",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5, py: 2,
          borderBottom: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
          Conversations
        </Typography>
        <Box
          sx={{
            minWidth: 22, height: 22, px: 0.75, borderRadius: 10,
            bgcolor: `${TEAL}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: TEAL }}>
            {conversations.length}
          </Typography>
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {conversations.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", px: 2 }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: "50%", bgcolor: TEAL_BG,
                display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5,
              }}
            >
              <ChatOutlinedIcon sx={{ fontSize: 28, color: TEAL }} />
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              No conversations yet
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9ca3af", mt: 0.5 }}>
              Start chatting with candidates
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {conversations.map((conv, idx) => {
              const o = other(conv);
              const isActive = conv._id === activeId;
              return (
                <React.Fragment key={conv._id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => onSelect(conv._id)}
                      sx={{
                        py: 1.75, px: 2.5,
                        bgcolor: isActive ? TEAL_BG : "transparent",
                        borderLeft: `3px solid ${isActive ? TEAL : "transparent"}`,
                        transition: "all 0.15s",
                        "&:hover": { bgcolor: isActive ? TEAL_BG : "#f9fafb" },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conv.unreadCount}
                          invisible={conv.unreadCount === 0 || isActive}
                          sx={{ "& .MuiBadge-badge": { bgcolor: "#f59e0b", color: "#fff", fontSize: "10px", minWidth: 17, height: 17, fontWeight: 700 } }}
                        >
                          <Avatar
                            sx={{
                              width: 40, height: 40,
                              bgcolor: isActive ? TEAL : `${TEAL}18`,
                              color: isActive ? "#fff" : TEAL,
                              fontSize: "14px", fontWeight: 700,
                            }}
                          >
                            {getInitial(o)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: "13px", fontWeight: conv.unreadCount > 0 ? 700 : 500, color: isActive ? TEAL : "#111827" }}>
                            {getDisplayName(o)}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ fontSize: "11px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                            {conv.lastMessage?.text || "No messages yet"}
                          </Typography>
                        }
                      />
                      <Typography sx={{ fontSize: "10px", color: "#9ca3af", flexShrink: 0 }}>
                        {conv.lastMessage?.timestamp
                          ? fmtListTime(conv.lastMessage.timestamp)
                          : fmtListTime(conv.updatedAt)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                  {idx < conversations.length - 1 && (
                    <Divider sx={{ mx: 2.5, borderColor: "#f3f4f6" }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

// ─── Message bubble ────────────────────────────────────────────────────────────
const Bubble: React.FC<{
  msg: any;
  isOwn: boolean;
  isCompany: boolean;
  onDelete: (id: string) => void;
}> = ({ msg, isOwn, isCompany, onDelete }) => (
  <Box
    sx={{
      mb: 1.5, display: "flex",
      justifyContent: isOwn ? "flex-end" : "flex-start",
      gap: 1, alignItems: "flex-end",
      "&:hover .del-btn": { opacity: 1 },
    }}
  >
    {isCompany && isOwn && (
      <IconButton
        className="del-btn"
        size="small"
        onClick={() => onDelete(msg._id)}
        sx={{ opacity: 0, transition: "opacity 0.15s", color: "#ef4444", p: "3px", "&:hover": { bgcolor: "#fef2f2" } }}
      >
        <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
      </IconButton>
    )}
    <Box
      sx={{
        maxWidth: "70%",
        px: 2, py: 1.25,
        bgcolor: isOwn ? TEAL : "#fff",
        color: isOwn ? "#fff" : "#111827",
        borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        boxShadow: isOwn
          ? `0 2px 8px ${TEAL}40`
          : "0 1px 4px rgba(0,0,0,0.06)",
        border: isOwn ? "none" : "1px solid #f3f4f6",
      }}
    >
      <Typography sx={{ fontSize: "13px", lineHeight: 1.5, wordBreak: "break-word" }}>
        {msg.text}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
        <AccessTimeOutlinedIcon sx={{ fontSize: 10, opacity: isOwn ? 0.7 : 0.4 }} />
        <Typography sx={{ fontSize: "10px", opacity: isOwn ? 0.75 : 0.4 }}>
          {fmtTime(msg.createdAt)}
        </Typography>
      </Box>
    </Box>
  </Box>
);

// ─── Main component ─────────────────────────────────────────────────────────────
const WorkplaceChat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const connectedUser = useSelector((s: RootState) => s.user?.connectedUser?.user);
  const profile      = useSelector((s: RootState) => s.user?.connectedUser?.profile);
  const currentUserId = connectedUser?._id;
  const isCompany     = profile?.type === "Company";

  const conversations     = useSelector(selectConversations);
  const conversation      = useSelector(selectCurrentConversation);
  const convLoading       = useSelector(selectCurrentConversationLoading);
  const messages          = useSelector(selectMessages);
  const msgsLoading       = useSelector(selectMessagesLoading);
  const sending           = useSelector(selectSendingMessage);

  const [activeId, setActiveId]   = useState<string | null>(null);
  const [text, setText]           = useState("");
  const [delDialogId, setDelDialogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting]   = useState(false);

  const isLoading = convLoading || msgsLoading;

  // ── Socket.IO ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}/chat`,
      { auth: { userId: currentUserId, token }, transports: ["websocket", "polling"] }
    );
    socketRef.current = socket;

    socket.on("new_message",          (msg: any)               => dispatch(addMessage(msg)));
    socket.on("message_read",         ({ messageId, conversationId: cid }: any) => dispatch(markMessageRead({ messageId, conversationId: cid })));
    socket.on("message_deleted",      ({ messageId, conversationId: cid }: any) => { dispatch(removeMessage({ messageId, conversationId: cid })); showToast({ message: "A message was deleted", severity: "info" }); });
    socket.on("conversation_deleted", ({ conversationId: cid }: any)           => { dispatch(removeConversation(cid)); showToast({ message: "Conversation deleted", severity: "info" }); if (activeId === cid) setActiveId(null); });

    return () => { socket.disconnect(); };
  }, [currentUserId]);                // eslint-disable-line

  // ── Join room ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeId) return;
    socket.emit("join_conversation", { conversationId: activeId });
    return () => { socket.emit("leave_conversation", activeId); };
  }, [activeId]);

  // ── Fetch conversations ────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUserId) dispatch(fetchConversations(undefined));
  }, [currentUserId, dispatch]);

  // ── Fetch messages when active conv changes ────────────────────────────────
  useEffect(() => {
    if (!activeId || !currentUserId) return;
    dispatch(fetchConversation(activeId));
    dispatch(fetchMessages(activeId));
    dispatch(markConversationRead(activeId));
    return () => { dispatch(clearCurrentConversation()); };
  }, [activeId, currentUserId, dispatch]);

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Select conversation ────────────────────────────────────────────────────
  const handleSelect = useCallback((id: string) => {
    if (id === activeId) return;
    setText("");
    setActiveId(id);
  }, [activeId]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!text.trim() || !conversation || !currentUserId || !activeId) return;

    const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRe = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/;

    if (emailRe.test(text)) {
      showToast({ message: "Sharing email addresses is not allowed. Keep all communication within the platform.", severity: "error" });
      return;
    }
    if (phoneRe.test(text)) {
      showToast({ message: "Sharing phone numbers is not allowed. Keep all communication within the platform.", severity: "error" });
      return;
    }

    const receiver = conversation.participants.find((p: any) => p._id !== currentUserId);
    if (!receiver) { showToast({ message: "Could not find recipient. Refresh and try again.", severity: "error" }); return; }

    try {
      await dispatch(sendMessage({ conversationId: activeId, receiverId: receiver._id, text })).unwrap();
      setText("");
    } catch (err: any) {
      showToast({ message: `Failed to send: ${err || "Unknown error"}`, severity: "error" });
    }
  }, [text, conversation, currentUserId, activeId, dispatch, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Delete message ─────────────────────────────────────────────────────────
  const handleDeleteMsg = useCallback(async (id: string) => {
    try {
      await dispatch(deleteMessageThunk(id)).unwrap();
      showToast({ message: "Message deleted", severity: "success" });
    } catch (err: any) {
      showToast({ message: `Failed to delete: ${err || "Unknown error"}`, severity: "error" });
    }
  }, [dispatch, showToast]);

  // ── Delete conversation ────────────────────────────────────────────────────
  const handleDeleteConv = useCallback(async () => {
    if (!activeId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteConversationThunk(activeId)).unwrap();
      showToast({ message: "Conversation deleted", severity: "success" });
      setActiveId(null);
      setDelDialogId(null);
    } catch (err: any) {
      showToast({ message: `Failed to delete: ${err || "Unknown error"}`, severity: "error" });
    } finally {
      setIsDeleting(false);
    }
  }, [activeId, dispatch, showToast]);

  const otherUser = conversation?.participants?.find((p: any) => p._id !== currentUserId);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Page banner ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TEAL} 0%, #0891B2 100%)`,
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          mb: 3,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChatOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff" }}>Messages</Typography>
            <Typography sx={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.75)" }}>
              Chat with your candidates directly from the dashboard
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[
            { label: "Conversations", value: conversations.length },
            { label: "Unread", value: conversations.reduce((a, c) => a + (c.unreadCount || 0), 0) },
          ].map((s) => (
            <Box key={s.label} sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Two-column layout ────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 2.5, height: "calc(100vh - 280px)", minHeight: 500 }}>

        {/* ── LEFT: Sidebar ─────────────────────────────────────────────────── */}
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          currentUserId={currentUserId}
          onSelect={handleSelect}
        />

        {/* ── RIGHT: Chat panel ─────────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* No conversation selected */}
          {!activeId ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, p: 4 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChatOutlinedIcon sx={{ fontSize: 36, color: TEAL }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#374151" }}>Select a conversation</Typography>
              <Typography sx={{ fontSize: "0.875rem", color: "#9ca3af", textAlign: "center", maxWidth: 280 }}>
                Choose a conversation from the left to start messaging.
              </Typography>
            </Box>
          ) : isLoading ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress sx={{ color: TEAL }} size={36} />
            </Box>
          ) : !conversation ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
              <ChatOutlinedIcon sx={{ fontSize: 40, color: "#d1d5db" }} />
              <Typography sx={{ color: "#9ca3af" }}>Conversation not found</Typography>
            </Box>
          ) : (
            <>
              {/* ── Header ─────────────────────────────────────────────────── */}
              <Box
                sx={{
                  px: 3, py: 2,
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex", alignItems: "center", gap: 2,
                }}
              >
                <Avatar sx={{ width: 44, height: 44, bgcolor: TEAL, fontSize: "15px", fontWeight: 700 }}>
                  {getInitial(otherUser)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827", lineHeight: 1.2 }}>
                    {getDisplayName(otherUser)}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#9ca3af", filter: "blur(3px)", userSelect: "none" }}>
                    {otherUser?.email}
                  </Typography>
                </Box>
                {/* Active badge */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.5, borderRadius: 10, bgcolor: "#f0fdf4" }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#10b981" }} />
                  <Typography sx={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>Active</Typography>
                </Box>
                {/* Delete conversation — company only */}
                {isCompany && (
                  <IconButton
                    size="small"
                    onClick={() => setDelDialogId(activeId)}
                    sx={{ color: "#9ca3af", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}
                    title="Delete conversation"
                  >
                    <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </Box>

              {/* ── Messages ───────────────────────────────────────────────── */}
              <Box
                sx={{
                  flex: 1, overflow: "auto", p: 3,
                  bgcolor: TEAL_BG,
                  "&::-webkit-scrollbar": { width: "5px" },
                  "&::-webkit-scrollbar-thumb": { bgcolor: `${TEAL}30`, borderRadius: 3 },
                }}
              >
                {messages.length === 0 ? (
                  <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                      <ChatOutlinedIcon sx={{ fontSize: 28, color: TEAL }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: "#374151" }}>No messages yet</Typography>
                    <Typography sx={{ fontSize: "13px", color: "#9ca3af" }}>Send the first message below</Typography>
                  </Box>
                ) : (
                  messages.map((msg) => (
                    <Bubble
                      key={msg._id}
                      msg={msg}
                      isOwn={msg.sender._id === currentUserId}
                      isCompany={isCompany}
                      onDelete={handleDeleteMsg}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* ── Input ──────────────────────────────────────────────────── */}
              <Box
                sx={{
                  px: 3, py: 2,
                  borderTop: "1px solid #f3f4f6",
                  bgcolor: "#fff",
                  display: "flex", gap: 1.5, alignItems: "flex-end",
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  size="small"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message… (Enter to send)"
                  disabled={sending}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                      bgcolor: "#f9fafb",
                      fontSize: "13px",
                      "& fieldset": { borderColor: "#e5e7eb" },
                      "&:hover fieldset": { borderColor: TEAL_LIGHT },
                      "&.Mui-focused fieldset": { borderColor: TEAL },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  endIcon={
                    sending
                      ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                      : <SendIcon sx={{ fontSize: 17 }} />
                  }
                  sx={{
                    bgcolor: TEAL,
                    borderRadius: 2.5,
                    px: 2.5,
                    py: 1,
                    minWidth: 96,
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#0f766e" },
                    "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
                  }}
                >
                  {sending ? "Sending" : "Send"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* ── Delete conversation confirmation dialog ───────────────────────────── */}
      {delDialogId && (
        <Box
          sx={{
            position: "fixed", inset: 0, zIndex: 1300,
            bgcolor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => !isDeleting && setDelDialogId(null)}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: "#fff", borderRadius: 3, p: 4, maxWidth: 420, width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
              <DeleteOutlinedIcon sx={{ fontSize: 26, color: "#ef4444" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "17px", color: "#111827", mb: 0.75 }}>
              Delete conversation?
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#6b7280", mb: 3, lineHeight: 1.6 }}>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => setDelDialogId(null)}
                disabled={isDeleting}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#e5e7eb", color: "#374151" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleDeleteConv}
                disabled={isDeleting}
                startIcon={isDeleting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WorkplaceChat;
