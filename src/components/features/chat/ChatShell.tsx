import React, { createContext, useContext, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  Stack,
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

// ── Constants (accent; primary palette still drives most surfaces) ──
const ACCENT = "#0D9488";

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
  /** Tighter gap / sidebar chrome (e.g. team module framed layout). */
  compactInFrame?: boolean;
  enableDeletes?:       boolean;
  /** Team chat: per-message delete for me / for everyone */
  teamScopedMessageDeletes?: boolean;
  /** Team chat: show header trash for Company + Employee */
  showDeleteConversation?: boolean;
  /** Optional copy for delete-conversation dialog body */
  deleteConversationDescription?: string;
  deleteConversationTitle?: string;
  /** Team chat: light mint / SaaS-style surfaces (does not affect candidate DMs). */
  mintLightTeamUi?: boolean;
  newMessage:           string;
  setNewMessage:        (v: string) => void;
  deleteDialogOpen:     boolean;
  setDeleteDialogOpen:  (v: boolean) => void;
  isDeleting:           boolean;
  // handlers
  onSend:               () => void;
  onKeyDown:            (e: React.KeyboardEvent) => void;
  onDeleteMessage:      (id: string, scope?: "me" | "everyone") => void;
  onConfirmDelete:      () => void;
  onSelectConversation: (id: string) => void;
  /** Team chat: delete from sidebar row menu instead of header trash. */
  deleteConversationFromSidebar?: boolean;
  onRequestDeleteConversation?: (conversationId: string) => void;
  /** Clears pending delete target when dialog closes without confirming. */
  resetDeleteConversationTarget?: () => void;
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
  const compactInFrame = p.compactInFrame ?? false;
  const mintLightTeamUi = p.mintLightTeamUi ?? false;
  const sidebarDeleteMenu = Boolean(
    p.deleteConversationFromSidebar && p.onRequestDeleteConversation,
  );
  const headerShowDeleteConversation = sidebarDeleteMenu ? false : p.showDeleteConversation;

  const handleSelect = (id: string) => {
    p.onSelectConversation(id);
    if (isMobile) setShowChat(true);
  };

  return (
    <ShellCtx.Provider value={{ isMobile, showChat, setShowChat }}>
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%", overflow: "hidden" }}>

        {p.returnTo && <ReturnBanner {...p.returnTo} />}

        <Box
          sx={{
            display: "flex",
            gap: compactInFrame ? (mintLightTeamUi ? 1.75 : 1) : 2,
            flex: 1,
            minHeight: 0,
            alignItems: "stretch",
            overflow: "hidden",
            ...(mintLightTeamUi ? { bgcolor: "#F8FAFC", borderRadius: "20px", p: { xs: 1, sm: 1.25 } } : {}),
          }}
        >
          {showConversationSidebar && (
            <Sidebar
              conversations={p.conversations}
              activeConversationId={p.activeConversationId}
              currentUserId={p.currentUserId}
              onSelect={handleSelect}
              compact={compactInFrame}
              conversationMenuDelete={sidebarDeleteMenu}
              onRequestDeleteConversation={p.onRequestDeleteConversation}
              mintLightTeamUi={mintLightTeamUi}
              viewerIsCompany={p.isCompany}
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
            teamScopedMessageDeletes={p.teamScopedMessageDeletes}
            showDeleteConversation={headerShowDeleteConversation}
            compactFooter={compactInFrame}
            mintLightTeamUi={mintLightTeamUi}
          />
        </Box>

        {enableDeletes && (
          <DeleteConversationDialog
            open={p.deleteDialogOpen}
            onClose={() => {
              if (p.isDeleting) return;
              p.resetDeleteConversationTarget?.();
              p.setDeleteDialogOpen(false);
            }}
            onConfirm={p.onConfirmDelete}
            isDeleting={p.isDeleting}
            description={p.deleteConversationDescription}
            title={p.deleteConversationTitle}
          />
        )}
      </Box>
    </ShellCtx.Provider>
  );
};

// ── Return-to-post banner ─────────────────────────────────
const ReturnBanner: React.FC<ReturnToPost> = ({ jobTitle, onReturn }) => {
  const { t } = useTranslation("shared/chat");
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        px: 2,
        py: 1.25,
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(ACCENT, 0.25)}`,
        bgcolor: alpha(ACCENT, theme.palette.mode === "dark" ? 0.12 : 0.06),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <WorkOutlined sx={{ fontSize: 18, color: ACCENT }} />
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}>
          {t("banner.chatting_about")}{" "}
          <Box component="span" sx={{ fontWeight: 700, color: ACCENT }}>
            {jobTitle || t("banner.job_post")}
          </Box>
        </Typography>
      </Stack>
      <Button
        size="small"
        variant="outlined"
        startIcon={<ArrowBackOutlined sx={{ fontSize: 16 }} />}
        onClick={onReturn}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.75rem",
          borderColor: alpha(ACCENT, 0.45),
          color: ACCENT,
          borderRadius: 2,
          "&:hover": { borderColor: ACCENT, bgcolor: alpha(ACCENT, 0.08) },
        }}
      >
        {t("banner.return_to_post")}
      </Button>
    </Paper>
  );
};

// ── Sidebar ───────────────────────────────────────────────
const Sidebar: React.FC<{
  conversations: any[];
  activeConversationId: string | null;
  currentUserId: string | undefined;
  onSelect: (id: string) => void;
  compact?: boolean;
  conversationMenuDelete?: boolean;
  onRequestDeleteConversation?: (conversationId: string) => void;
  mintLightTeamUi?: boolean;
  viewerIsCompany: boolean;
}> = ({
  conversations,
  activeConversationId,
  currentUserId,
  onSelect,
  compact = false,
  conversationMenuDelete = false,
  onRequestDeleteConversation,
  mintLightTeamUi = false,
  viewerIsCompany,
}) => {
  const { isMobile, showChat } = useShell();
  const { t } = useTranslation("shared/chat");
  const theme = useTheme();
  return (
    <Paper
      id="chat-conversations-sidebar"
      elevation={0}
      sx={{
        width: { xs: "100%", md: 300 },
        flexShrink: 0,
        borderRadius: mintLightTeamUi ? "20px" : 2,
        border: mintLightTeamUi ? "1px solid #E5E7EB" : `1px solid ${theme.palette.divider}`,
        bgcolor: mintLightTeamUi ? "#FFFFFF" : theme.palette.background.paper,
        boxShadow: mintLightTeamUi ? "0 4px 20px rgba(15, 23, 42, 0.05)" : undefined,
        display: { xs: isMobile && showChat ? "none" : "flex", md: "flex" },
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
        alignSelf: "stretch",
      }}
    >
      <Box
        id="chat-sidebar-header"
        sx={{
          px: compact ? 1.5 : 2,
          py: compact ? 1 : 1.5,
          borderBottom: mintLightTeamUi ? "1px solid #E5E7EB" : `1px solid ${theme.palette.divider}`,
          bgcolor: mintLightTeamUi ? "#FFFFFF" : alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.04),
        }}
      >
        <Typography
          id="chat-sidebar-title"
          variant="subtitle2"
          fontWeight={700}
          sx={{ color: mintLightTeamUi ? "#111827" : "text.primary", fontSize: mintLightTeamUi ? "0.8125rem" : undefined, letterSpacing: mintLightTeamUi ? "-0.02em" : undefined }}
        >
          {t("sidebar.all_conversations", { count: conversations.length })}
        </Typography>
      </Box>
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={activeConversationId ?? ""}
        currentUserId={currentUserId}
        onSelectConversation={onSelect}
        conversationMenuDelete={conversationMenuDelete}
        onRequestDeleteConversation={onRequestDeleteConversation}
        compact={compact}
        mintLightTeamUi={mintLightTeamUi}
        viewerIsCompany={viewerIsCompany}
      />
    </Paper>
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
  onDeleteMessage:(id: string, scope?: "me" | "everyone") => void;
  onDeleteConversation: () => void;
  enableDeletes: boolean;
  teamScopedMessageDeletes?: boolean;
  showDeleteConversation?: boolean;
  compactFooter?: boolean;
  mintLightTeamUi?: boolean;
}

const Panel: React.FC<PanelProps> = (p) => {
  const { isMobile, showChat, setShowChat } = useShell();
  const theme = useTheme();
  return (
    <Paper
      id="chat-message-panel"
      elevation={0}
      sx={{
        flex: 1,
        display: { xs: isMobile && !showChat ? "none" : "flex", md: "flex" },
        flexDirection: "column",
        borderRadius: p.mintLightTeamUi ? "20px" : 2,
        border: p.mintLightTeamUi ? "1px solid #E5E7EB" : `1px solid ${theme.palette.divider}`,
        bgcolor: p.mintLightTeamUi ? "#FFFFFF" : theme.palette.background.paper,
        boxShadow: p.mintLightTeamUi ? "0 4px 20px rgba(15, 23, 42, 0.05)" : undefined,
        overflow: "hidden",
        minHeight: 0,
        minWidth: 0,
        alignSelf: "stretch",
      }}
    >
      {p.loading ? (
        <Stack flex={1} alignItems="center" justifyContent="center" minHeight={200}>
          <CircularProgress size={36} thickness={4} />
        </Stack>
      ) : !p.conversation ? (
        <EmptyPanel hasConversations={p.conversations.length > 0} isCompany={p.isCompany} mintLightTeamUi={p.mintLightTeamUi} />
      ) : (
        <Stack direction="column" sx={{ flex: 1, minHeight: 0 }}>
          {isMobile && (
            <IconButton
              size="small"
              onClick={() => setShowChat(false)}
              sx={{ alignSelf: "flex-start", m: 0.5, color: "text.secondary" }}
              aria-label="Back"
            >
              <ArrowBackOutlined sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <ConversationHeader
            otherUser={p.otherUser}
            isCompany={p.isCompany}
            onDeleteConversation={p.onDeleteConversation}
            enableDeletes={p.enableDeletes}
            showDeleteConversation={p.showDeleteConversation}
            compact={p.compactFooter}
            mintLightTeamUi={p.mintLightTeamUi}
          />
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <MessageList
              messages={p.messages}
              threadLastMessage={p.conversation?.lastMessage}
              currentUserId={p.currentUserId}
              otherUser={p.otherUser}
              isCompany={p.isCompany}
              onDeleteMessage={p.onDeleteMessage}
              enableDeletes={p.enableDeletes}
              teamScopedDeletes={p.teamScopedMessageDeletes}
              mintLightTeamUi={p.mintLightTeamUi}
            />
          </Box>
          <MessageInput
            value={p.newMessage}
            onChange={p.setNewMessage}
            onSend={p.onSend}
            onKeyDown={p.onKeyDown}
            sending={p.sending}
            compact={p.compactFooter}
            mintLightTeamUi={p.mintLightTeamUi}
          />
        </Stack>
      )}
    </Paper>
  );
};

// ── Empty state ───────────────────────────────────────────
const EmptyPanel: React.FC<{ hasConversations: boolean; isCompany: boolean; mintLightTeamUi?: boolean }> = ({
  hasConversations,
  isCompany,
  mintLightTeamUi = false,
}) => {
  const { isMobile, setShowChat } = useShell();
  const { t } = useTranslation("shared/chat");
  const { t: tCandidate } = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");
  const theme = useTheme();
  return (
    <Stack flex={1} alignItems="center" justifyContent="center" spacing={2} sx={{ p: 4, textAlign: "center", bgcolor: mintLightTeamUi ? "#F8FAFC" : undefined }}>
      <Box
        sx={{
          width: 68,
          height: 68,
          borderRadius: mintLightTeamUi ? "18px" : "50%",
          bgcolor: mintLightTeamUi ? "#ECFDF5" : alpha(theme.palette.primary.main, 0.1),
          border: mintLightTeamUi ? "1px solid rgba(52, 211, 153, 0.22)" : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: mintLightTeamUi ? "0 4px 20px rgba(15, 23, 42, 0.05)" : undefined,
        }}
      >
        <ChatOutlined sx={{ fontSize: 34, color: mintLightTeamUi ? "#10B981" : theme.palette.primary.main }} />
      </Box>
      <Typography sx={{ color: mintLightTeamUi ? "#111827" : "text.primary", fontWeight: 700, fontSize: "0.9375rem" }}>
        {hasConversations ? t("panel.select_conversation") : t("panel.no_conversations")}
      </Typography>
      <Typography sx={{ color: mintLightTeamUi ? "#6B7280" : "text.secondary", fontSize: "0.8125rem", maxWidth: 300 }}>
        {hasConversations
          ? t("panel.choose_from_sidebar")
          : (isCompany ? tCompanyHub("panel.contact_candidate") : tCandidate("panel.contact_recruiter"))}
      </Typography>
      {isMobile && (
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => setShowChat(false)}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {t("panel.back_to_conversations")}
        </Button>
      )}
    </Stack>
  );
};

export default ChatShell;
