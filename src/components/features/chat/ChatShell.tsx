import React, { createContext, useContext, useState } from "react";
import {
  Box, Typography, CircularProgress, Button, IconButton,
  useMediaQuery, useTheme,
} from "@mui/material";
import ChatOutlined      from "@mui/icons-material/ChatOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import WorkOutlined      from "@mui/icons-material/WorkOutlined";
import { useTranslation } from "react-i18next";
import type { Participant } from "./helpers";
import ConversationSidebar      from "./ConversationSidebar";
import ConversationHeader       from "./ConversationHeader";
import MessageList              from "./MessageList";
import MessageInput             from "./MessageInput";
import DeleteConversationDialog from "./DeleteConversationDialog";

// ── Constants ─────────────────────────────────────────────
const T  = "#0D9488";
const TL = "#F0FDFA";
const TB = "#99F6E4";

// ── Types ─────────────────────────────────────────────────
export interface ReturnToPost {
  postId:   string;
  jobTitle: string;
  onReturn: () => void;
}

export interface ChatShellProps {
  // session data (from useChatSession)
  conversations:        any[];
  conversation:         any;
  messages:             any[];
  activeConversationId: string | null;
  currentUserId:        string | undefined;
  otherUser:            Participant | undefined;
  loading:              boolean;
  sending:              boolean;
  isCompany:            boolean;
  showConversationSidebar?: boolean;
  enableDeletes?:       boolean;
  newMessage:           string;
  setNewMessage:        (v: string) => void;
  deleteDialogOpen:     boolean;
  setDeleteDialogOpen:  (v: boolean) => void;
  isDeleting:           boolean;
  // handlers
  onSend:               () => void;
  onKeyDown:            (e: React.KeyboardEvent) => void;
  onDeleteMessage:      (id: string) => void;
  onConfirmDelete:      () => void;
  onSelectConversation: (id: string) => void;
  // optional
  returnTo?: ReturnToPost;
}

// ── Internal context (avoids deep prop-drilling) ──────────
interface Ctx {
  isMobile:  boolean;
  showChat:  boolean;
  setShowChat: (v: boolean) => void;
}
const ShellCtx = createContext<Ctx>({ isMobile: false, showChat: true, setShowChat: () => {} });
const useShell = () => useContext(ShellCtx);

// ── Root ──────────────────────────────────────────────────
const ChatShell: React.FC<ChatShellProps> = (p) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showChat, setShowChat] = useState(!!p.activeConversationId);
  const enableDeletes = p.enableDeletes ?? true;
  const showConversationSidebar = p.showConversationSidebar ?? p.isCompany;

  const handleSelect = (id: string) => {
    p.onSelectConversation(id);
    if (isMobile) setShowChat(true);
  };

  return (
    <ShellCtx.Provider value={{ isMobile, showChat, setShowChat }}>
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

        {p.returnTo && <ReturnBanner {...p.returnTo} />}

        <Box sx={{ display: "flex", gap: 2, flex: 1, minHeight: 0 }}>
          {showConversationSidebar && (
            <Sidebar
              conversations={p.conversations}
              activeConversationId={p.activeConversationId}
              currentUserId={p.currentUserId}
              onSelect={handleSelect}
            />
          )}
          <Panel
            conversations={p.conversations}
            conversation={p.conversation}
            messages={p.messages}
            currentUserId={p.currentUserId}
            otherUser={p.otherUser}
            loading={p.loading}
            sending={p.sending}
            isCompany={p.isCompany}
            newMessage={p.newMessage}
            setNewMessage={p.setNewMessage}
            onSend={p.onSend}
            onKeyDown={p.onKeyDown}
            onDeleteMessage={p.onDeleteMessage}
            onDeleteConversation={() => p.setDeleteDialogOpen(true)}
            enableDeletes={enableDeletes}
          />
        </Box>

        {enableDeletes && (
          <DeleteConversationDialog
            open={p.deleteDialogOpen}
            onClose={() => p.setDeleteDialogOpen(false)}
            onConfirm={p.onConfirmDelete}
            isDeleting={p.isDeleting}
          />
        )}
      </Box>
    </ShellCtx.Provider>
  );
};

// ── Return-to-post banner ─────────────────────────────────
const ReturnBanner: React.FC<ReturnToPost> = ({ jobTitle, onReturn }) => {
  const { t } = useTranslation("shared/chat");
  return (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      bgcolor: TL, border: `1px solid ${TB}`, borderRadius: 2,
      px: 2, py: 1, mb: 2, gap: 2, flexWrap: "wrap",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WorkOutlined sx={{ fontSize: 16, color: T }} />
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: T }}>
          {t("banner.chatting_about")}{" "}
          <Box component="span" sx={{ fontWeight: 700 }}>{jobTitle || t("banner.job_post")}</Box>
        </Typography>
      </Box>
      <Button size="small" startIcon={<ArrowBackOutlined sx={{ fontSize: 14 }} />} onClick={onReturn}
        sx={{
          textTransform: "none", fontWeight: 600, fontSize: "12px",
          color: T, border: `1px solid ${TB}`, borderRadius: 2,
          px: 1.5, py: 0.5, "&:hover": { bgcolor: "#CCFBF1" },
        }}>
        {t("banner.return_to_post")}
      </Button>
    </Box>
  );
};

// ── Sidebar ───────────────────────────────────────────────
const Sidebar: React.FC<{
  conversations: any[];
  activeConversationId: string | null;
  currentUserId: string | undefined;
  onSelect: (id: string) => void;
}> = ({ conversations, activeConversationId, currentUserId, onSelect }) => {
  const { isMobile, showChat } = useShell();
  const { t } = useTranslation("shared/chat");
  return (
    <Box sx={{
      width: { xs: "100%", md: 280 }, flexShrink: 0,
      borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#fff",
      display: { xs: isMobile && showChat ? "none" : "flex", md: "flex" },
      flexDirection: "column", overflow: "hidden",
    }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
          {t("sidebar.all_conversations", { count: conversations.length })}
        </Typography>
      </Box>
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={activeConversationId ?? ""}
        currentUserId={currentUserId}
        onSelectConversation={onSelect}
      />
    </Box>
  );
};

// ── Chat panel ────────────────────────────────────────────
interface PanelProps {
  conversations:  any[];
  conversation:   any;
  messages:       any[];
  currentUserId:  string | undefined;
  otherUser:      Participant | undefined;
  loading:        boolean;
  sending:        boolean;
  isCompany:      boolean;
  newMessage:     string;
  setNewMessage:  (v: string) => void;
  onSend:         () => void;
  onKeyDown:      (e: React.KeyboardEvent) => void;
  onDeleteMessage:(id: string) => void;
  onDeleteConversation: () => void;
  enableDeletes: boolean;
}

const Panel: React.FC<PanelProps> = (p) => {
  const { isMobile, showChat, setShowChat } = useShell();
  return (
    <Box sx={{
      flex: 1,
      display: { xs: isMobile && !showChat ? "none" : "flex", md: "flex" },
      flexDirection: "column",
      borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#fff",
      overflow: "hidden", minHeight: 0,
    }}>
      {p.loading ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress sx={{ color: T }} />
        </Box>
      ) : !p.conversation ? (
        <EmptyPanel hasConversations={p.conversations.length > 0} isCompany={p.isCompany} />
      ) : (
        <>
          {isMobile && (
            <IconButton size="small" onClick={() => setShowChat(false)}
              sx={{ alignSelf: "flex-start", m: 0.5, color: "#6B7280" }}>
              <ArrowBackOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          <ConversationHeader
            otherUser={p.otherUser}
            isCompany={p.isCompany}
            onDeleteConversation={p.onDeleteConversation}
            enableDeletes={p.enableDeletes}
          />
          <MessageList
            messages={p.messages}
            currentUserId={p.currentUserId}
            isCompany={p.isCompany}
            onDeleteMessage={p.onDeleteMessage}
            enableDeletes={p.enableDeletes}
          />
          <MessageInput
            value={p.newMessage}
            onChange={p.setNewMessage}
            onSend={p.onSend}
            onKeyDown={p.onKeyDown}
            sending={p.sending}
          />
        </>
      )}
    </Box>
  );
};

// ── Empty state ───────────────────────────────────────────
const EmptyPanel: React.FC<{ hasConversations: boolean; isCompany: boolean }> = ({
  hasConversations,
  isCompany,
}) => {
  const { isMobile, setShowChat } = useShell();
  const { t } = useTranslation("shared/chat");
  const { t: tCandidate } = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, p: 4 }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: "50%",
        bgcolor: TL, border: `1px solid ${TB}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <ChatOutlined sx={{ fontSize: 32, color: T }} />
      </Box>
      <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
        {hasConversations ? t("panel.select_conversation") : t("panel.no_conversations")}
      </Typography>
      <Typography sx={{ fontSize: "13px", color: "#6B7280", textAlign: "center", maxWidth: 280 }}>
        {hasConversations
          ? t("panel.choose_from_sidebar")
          : (isCompany ? tCompanyHub("panel.contact_candidate") : tCandidate("panel.contact_recruiter"))}
      </Typography>
      {isMobile && (
        <Button startIcon={<ArrowBackOutlined />} onClick={() => setShowChat(false)}
          sx={{ textTransform: "none", color: T, fontWeight: 600 }}>
          {t("panel.back_to_conversations")}
        </Button>
      )}
    </Box>
  );
};

export default ChatShell;
