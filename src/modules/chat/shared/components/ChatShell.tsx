import React, { createContext, useContext, useState, useCallback, useMemo, memo, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
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
  /** Node rendered at the bottom of the conversations sidebar (e.g. Colleagues button). */
  sidebarFooter?: React.ReactNode;
  /** When set, replaces the right-side chat panel content (e.g. Colleagues panel). */
  overridePanel?: React.ReactNode;
  // handlers
  onSend:               (text: string) => Promise<void>;
  onDeleteMessage:      (id: string, scope?: "me" | "everyone") => void;
  onDeleteConversation: (targetId: string) => Promise<void>;
  onSelectConversation: (id: string) => void;
  /** Team chat: delete from sidebar row menu instead of header trash. */
  deleteConversationFromSidebar?: boolean;
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
  const sidebarDeleteMenu = Boolean(p.deleteConversationFromSidebar);
  const headerShowDeleteConversation = sidebarDeleteMenu ? false : p.showDeleteConversation;

  const deleteTargetRef = useRef<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelect = useCallback((id: string) => {
    p.onSelectConversation(id);
    if (isMobile) setShowChat(true);
  }, [p.onSelectConversation, isMobile]);

  const requestDeleteConversation = useCallback((conversationId: string) => {
    deleteTargetRef.current = conversationId;
    setDeleteDialogOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback(() => {
    if (p.activeConversationId) requestDeleteConversation(p.activeConversationId);
  }, [p.activeConversationId, requestDeleteConversation]);

  const handleCloseDeleteDialog = useCallback(() => {
    if (isDeleting) return;
    deleteTargetRef.current = null;
    setDeleteDialogOpen(false);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    const targetId = deleteTargetRef.current;
    if (!targetId) return;
    setIsDeleting(true);
    try {
      await p.onDeleteConversation(targetId);
      setDeleteDialogOpen(false);
      deleteTargetRef.current = null;
    } finally {
      setIsDeleting(false);
    }
  }, [p.onDeleteConversation]);

  const ctxValue = useMemo(
    () => ({ isMobile, showChat, setShowChat }),
    [isMobile, showChat],
  );

  return (
    <ShellCtx.Provider value={ctxValue}>
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
              onRequestDeleteConversation={sidebarDeleteMenu ? requestDeleteConversation : undefined}
              mintLightTeamUi={mintLightTeamUi}
              viewerIsCompany={p.isCompany}
              footer={p.sidebarFooter}
            />
          )}
          <Panel
            hasConversations={p.conversations.length > 0}
            conversation={p.conversation}
            messages={p.messages}
            currentUserId={p.currentUserId}
            otherUser={p.otherUser}
            loading={p.loading}
            sending={p.sending}
            isCompany={p.isCompany}
            onSend={p.onSend}
            onDeleteMessage={p.onDeleteMessage}
            onDeleteConversation={handleOpenDeleteDialog}
            enableDeletes={enableDeletes}
            teamScopedMessageDeletes={p.teamScopedMessageDeletes}
            showDeleteConversation={headerShowDeleteConversation}
            compactFooter={compactInFrame}
            mintLightTeamUi={mintLightTeamUi}
            overrideContent={p.overridePanel}
          />
        </Box>

        {enableDeletes && (
          <DeleteConversationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
            description={p.deleteConversationDescription}
            title={p.deleteConversationTitle}
          />
        )}
      </Box>
    </ShellCtx.Provider>
  );
};

// ── Return-to-post banner ─────────────────────────────────
const ReturnBanner = memo(function ReturnBanner({ jobTitle, onReturn }: ReturnToPost) {
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
        size="sm"
        variant="outline"
        onClick={onReturn}
        className="rounded-lg text-xs font-semibold"
        style={{ borderColor: alpha(ACCENT, 0.45), color: ACCENT }}
      >
        <ArrowBackOutlined sx={{ fontSize: 16 }} />
        {t("banner.return_to_post")}
      </Button>
    </Paper>
  );
});

// ── Sidebar ───────────────────────────────────────────────
interface SidebarProps {
  conversations: any[];
  activeConversationId: string | null;
  currentUserId: string | undefined;
  onSelect: (id: string) => void;
  compact?: boolean;
  conversationMenuDelete?: boolean;
  onRequestDeleteConversation?: (conversationId: string) => void;
  mintLightTeamUi?: boolean;
  viewerIsCompany: boolean;
  footer?: React.ReactNode;
}

const Sidebar = memo(function Sidebar({
  conversations,
  activeConversationId,
  currentUserId,
  onSelect,
  compact = false,
  conversationMenuDelete = false,
  onRequestDeleteConversation,
  mintLightTeamUi = false,
  viewerIsCompany,
  footer,
}: SidebarProps) {
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
          py: compact ? 1.25 : 1.75,
          borderBottom: mintLightTeamUi ? "1px solid #E5E7EB" : `1px solid ${theme.palette.divider}`,
          bgcolor: mintLightTeamUi ? "#FFFFFF" : alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.04),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          id="chat-sidebar-title"
          sx={{
            fontWeight: 800,
            fontSize: compact ? "0.8125rem" : "0.875rem",
            letterSpacing: "-0.03em",
            color: mintLightTeamUi ? "#111827" : "text.primary",
            lineHeight: 1.2,
          }}
        >
          {t("sidebar.title", { defaultValue: "Conversations" })}
        </Typography>
        {conversations.length > 0 && (
          <Chip
            label={conversations.length}
            size="small"
            sx={{
              height: 22,
              minWidth: 28,
              fontWeight: 700,
              fontSize: "0.6875rem",
              letterSpacing: "0.01em",
              bgcolor: mintLightTeamUi ? "#ECFDF5" : alpha(theme.palette.primary.main, 0.1),
              color: mintLightTeamUi ? "#059669" : theme.palette.primary.main,
              border: mintLightTeamUi ? "1px solid rgba(52,211,153,0.3)" : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        )}
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
      {footer && (
        <Box
          sx={{
            flexShrink: 0,
            px: compact ? 1.25 : 1.5,
            py: compact ? 1 : 1.25,
            borderTop: mintLightTeamUi ? "1px solid #E5E7EB" : `1px solid ${theme.palette.divider}`,
            bgcolor: mintLightTeamUi ? "#FFFFFF" : undefined,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  );
});

// ── Chat panel ────────────────────────────────────────────
interface PanelProps {
  hasConversations: boolean;
  conversation:   any;
  messages:       any[];
  currentUserId:  string | undefined;
  otherUser:      Participant | undefined;
  loading:        boolean;
  sending:        boolean;
  isCompany:      boolean;
  onSend:         (text: string) => Promise<void>;
  onDeleteMessage:(id: string, scope?: "me" | "everyone") => void;
  onDeleteConversation: () => void;
  enableDeletes: boolean;
  teamScopedMessageDeletes?: boolean;
  showDeleteConversation?: boolean;
  compactFooter?: boolean;
  mintLightTeamUi?: boolean;
  overrideContent?: React.ReactNode;
}

const Panel = memo(function Panel(p: PanelProps) {
  const { isMobile, showChat, setShowChat } = useShell();
  const theme = useTheme();
  const handleBack = useCallback(() => setShowChat(false), [setShowChat]);
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
      {p.overrideContent ? (
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>{p.overrideContent}</Box>
      ) : p.loading ? (
        <Stack flex={1} alignItems="center" justifyContent="center" minHeight={200}>
          <CircularProgress size={36} thickness={4} />
        </Stack>
      ) : !p.conversation ? (
        <EmptyPanel hasConversations={p.hasConversations} isCompany={p.isCompany} mintLightTeamUi={p.mintLightTeamUi} />
      ) : (
        <Stack direction="column" sx={{ flex: 1, minHeight: 0 }}>
          {isMobile && (
            <IconButton
              size="small"
              onClick={handleBack}
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
          {/* key resets the internal input state when switching conversations */}
          <MessageInput
            key={p.conversation._id}
            onSend={p.onSend}
            sending={p.sending}
            compact={p.compactFooter}
            mintLightTeamUi={p.mintLightTeamUi}
          />
        </Stack>
      )}
    </Paper>
  );
});

// ── Empty state ───────────────────────────────────────────
const EmptyPanel = memo(function EmptyPanel({
  hasConversations,
  isCompany,
  mintLightTeamUi = false,
}: { hasConversations: boolean; isCompany: boolean; mintLightTeamUi?: boolean }) {
  const { isMobile, setShowChat } = useShell();
  const handleBack = useCallback(() => setShowChat(false), [setShowChat]);
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
        <Button variant="ghost" onClick={handleBack} className="font-semibold">
          <ArrowBackOutlined />
          {t("panel.back_to_conversations")}
        </Button>
      )}
    </Stack>
  );
});

export default ChatShell;
