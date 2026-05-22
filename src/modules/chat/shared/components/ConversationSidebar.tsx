import React, { memo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Badge,
  Stack,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL } from "@/modules/chat/team-chat/constants/lastMessagePreview";
import { CHAT_LAST_MESSAGE_BLOCKED_PREVIEW } from "@/modules/chat/shared/constants/contactPolicy";
import { TEAM_MINT_SCROLLBAR_SX } from "@/modules/chat/shared/constants/teamMintUi";
import { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";
import { Participant, getParticipantDisplayName, getParticipantInitial, formatListTime, chatContextMenuPaperSlotProps, chatContextMenuItemSx } from "./helpers";
import ChatContextMenuTrigger from "./ChatContextMenuTrigger";
import { safeAlpha } from "@/utils/safeMuiAlpha";

const ease = "cubic-bezier(0.4, 0, 0.2, 1)";

// Avatar color palette — consistent per-initial, harmonises with mint theme
const AVATAR_PALETTE = [
  { bg: "#DBEAFE", color: "#1E40AF" }, // blue
  { bg: "#FCE7F3", color: "#9D174D" }, // pink
  { bg: "#FEF3C7", color: "#92400E" }, // amber
  { bg: "#EDE9FE", color: "#5B21B6" }, // violet
  { bg: "#FEE2E2", color: "#991B1B" }, // red
  { bg: "#E0F2FE", color: "#0369A1" }, // sky
  { bg: "#F0FDF4", color: "#065F46" }, // green
  { bg: "#FFF7ED", color: "#9A3412" }, // orange
] as const;

const getAvatarColors = (name: string) => {
  const code = (name.charCodeAt(0) || 65) + (name.charCodeAt(1) || 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};

// Stable sizing tokens
const ROW_SIZING_COMPACT = {
  py: 0.75,
  px: 1.25,
  avatar: 34,
  avatarFont: "0.75rem",
  nameFont: "0.75rem",
  previewFont: "0.6875rem",
  timeFont: "0.625rem",
} as const;

const ROW_SIZING_DEFAULT = {
  py: 1,
  px: 1.5,
  avatar: 40,
  avatarFont: "0.875rem",
  nameFont: "0.8125rem",
  previewFont: "0.75rem",
  timeFont: "0.6875rem",
} as const;

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: {
    text: string;
    timestamp: string;
    isDeletedForEveryone?: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

interface ConversationRowProps {
  conv: Conversation;
  isActive: boolean;
  me: string;
  onSelect: (id: string) => void;
  compact: boolean;
  mintLightTeamUi: boolean;
  showRowMenu: boolean;
  onRequestDeleteConversation?: (id: string) => void;
}

const ConversationRow = memo(function ConversationRow({
  conv,
  isActive,
  me,
  onSelect,
  compact,
  mintLightTeamUi,
  showRowMenu,
  onRequestDeleteConversation,
}: ConversationRowProps) {
  const theme = useTheme();
  const { t } = useTranslation("shared/chat");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const row = compact ? ROW_SIZING_COMPACT : ROW_SIZING_DEFAULT;
  const primary = theme.palette.primary.main;
  const isDark = theme.palette.mode === "dark";

  const otherUser = conv.participants.find((p) => String(p._id) !== me);
  const displayName = getParticipantDisplayName(otherUser);
  const initial = getParticipantInitial(otherUser);
  const avatarColors = getAvatarColors(displayName);

  const unreadN = normalizeConversationUnreadCount(conv.unreadCount, me || undefined);
  const hasUnread = unreadN > 0 && !isActive;

  const previewDeleted =
    !!conv.lastMessage?.isDeletedForEveryone
    || conv.lastMessage?.text === TEAM_LAST_MESSAGE_DELETED_SENTINEL;
  const previewBlocked = conv.lastMessage?.text === CHAT_LAST_MESSAGE_BLOCKED_PREVIEW;
  const hasNoMessages = !conv.lastMessage?.text;

  const previewText = previewDeleted
    ? t("messages.this_message_was_deleted")
    : previewBlocked
      ? ""
      : hasNoMessages
        ? t("sidebar.no_messages")
        : conv.lastMessage!.text;

  const timeStr = conv.lastMessage?.timestamp
    ? formatListTime(conv.lastMessage.timestamp)
    : formatListTime(conv.updatedAt);

  const handleRowClick = useCallback(() => onSelect(conv._id), [onSelect, conv._id]);
  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  }, []);
  const handleMenuClose = useCallback(() => setMenuAnchor(null), []);
  const handleDelete = useCallback(() => {
    if (onRequestDeleteConversation) onRequestDeleteConversation(conv._id);
    setMenuAnchor(null);
  }, [onRequestDeleteConversation, conv._id]);

  // Mint active/hover backgrounds
  const activeBg = mintLightTeamUi
    ? "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)"
    : isDark ? alpha(primary, 0.12) : alpha(primary, 0.07);
  const hoverBg = mintLightTeamUi
    ? "#DEEBEB"
    : isDark ? safeAlpha(theme.palette.common.white, 0.05) : safeAlpha(theme.palette.common.black, 0.04);

  return (
    <ListItem
      id={`chat-conv-item-${conv._id}`}
      disablePadding
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        px: mintLightTeamUi ? 1 : 0.75,
        py: 0.3,
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <ListItemButton
        onClick={handleRowClick}
        sx={{
          flex: 1,
          minWidth: 0,
          py: row.py,
          px: row.px,
          borderRadius: mintLightTeamUi ? "14px" : "10px",
          alignItems: "center",
          gap: 1.25,
          background: isActive
            ? activeBg
            : "transparent",
          border: mintLightTeamUi
            ? `1px solid ${isActive ? "rgba(52, 211, 153, 0.4)" : "transparent"}`
            : `1px solid ${isActive ? alpha(primary, 0.2) : "transparent"}`,
          boxShadow: isActive && mintLightTeamUi
            ? "0 2px 12px rgba(16, 185, 129, 0.12)"
            : "none",
          transition: `all 0.18s ${ease}`,
          "@media (hover: hover)": {
            "&:hover": {
              background: isActive ? activeBg : hoverBg,
              border: `1px solid ${mintLightTeamUi ? "rgba(52,211,153,0.2)" : alpha(primary, 0.1)}`,
              transform: isActive ? "none" : "translateX(2px)",
            },
          },
        }}
      >
        {/* Avatar with colored background */}
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            badgeContent={hasUnread ? unreadN : 0}
            invisible={!hasUnread}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: mintLightTeamUi ? "#10B981" : theme.palette.error.main,
                color: "#fff",
                fontWeight: 700,
                fontSize: compact ? "0.5625rem" : "0.5625rem",
                minWidth: compact ? 17 : 18,
                height: compact ? 17 : 18,
                px: 0.5,
                borderRadius: 999,
                right: compact ? 1 : 2,
                top: compact ? 1 : 2,
                border: "2px solid #fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Avatar
              sx={{
                width: row.avatar,
                height: row.avatar,
                fontSize: row.avatarFont,
                fontWeight: 700,
                bgcolor: isActive
                  ? (mintLightTeamUi ? "#10B981" : primary)
                  : (isDark ? alpha(theme.palette.text.primary, 0.12) : avatarColors.bg),
                color: isActive
                  ? "#fff"
                  : (isDark ? theme.palette.text.secondary : avatarColors.color),
                boxShadow: isActive
                  ? (mintLightTeamUi ? "0 2px 10px rgba(16,185,129,0.4)" : `0 2px 8px ${alpha(primary, 0.35)}`)
                  : "0 1px 4px rgba(0,0,0,0.08)",
                transition: `all 0.18s ${ease}`,
                letterSpacing: "-0.01em",
              }}
            >
              {initial}
            </Avatar>
          </Badge>
        </Box>

        {/* Text content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.2 }}>
            <Typography
              noWrap
              sx={{
                fontSize: row.nameFont,
                fontWeight: hasUnread ? 700 : isActive ? 700 : 600,
                color: isActive
                  ? (mintLightTeamUi ? "#065F46" : primary)
                  : (mintLightTeamUi ? "#111827" : "text.primary"),
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                flex: 1,
                minWidth: 0,
                mr: 0.75,
              }}
            >
              {displayName}
            </Typography>
            <Typography
              sx={{
                fontSize: row.timeFont,
                fontWeight: isActive || hasUnread ? 600 : 400,
                color: isActive
                  ? (mintLightTeamUi ? "#10B981" : primary)
                  : hasUnread
                    ? (mintLightTeamUi ? "#059669" : "text.primary")
                    : (mintLightTeamUi ? "#9CA3AF" : "text.secondary"),
                flexShrink: 0,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {timeStr}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              noWrap
              sx={{
                fontSize: row.previewFont,
                fontWeight: hasUnread ? 600 : 400,
                fontStyle: previewDeleted || hasNoMessages ? "italic" : "normal",
                color: previewDeleted || hasNoMessages
                  ? (mintLightTeamUi ? "#D1D5DB" : "text.disabled")
                  : hasUnread
                    ? (mintLightTeamUi ? "#374151" : "text.primary")
                    : (mintLightTeamUi ? "#6B7280" : "text.secondary"),
                flex: 1,
                minWidth: 0,
                lineHeight: 1.4,
              }}
            >
              {previewText}
            </Typography>
            {hasUnread && unreadN > 1 && (
              <Box
                sx={{
                  ml: 0.75,
                  flexShrink: 0,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: mintLightTeamUi ? "#10B981" : primary,
                  boxShadow: mintLightTeamUi ? "0 0 6px rgba(16,185,129,0.5)" : undefined,
                }}
              />
            )}
          </Stack>
        </Box>
      </ListItemButton>

      {/* Three-dot menu trigger — only visible on hover */}
      {showRowMenu && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            pr: 0.5,
            opacity: hovered || Boolean(menuAnchor) ? 1 : 0,
            transition: `opacity 0.18s ${ease}`,
          }}
        >
          <ChatContextMenuTrigger
            visibility="always"
            menuOpen={Boolean(menuAnchor)}
            aria-label={t("sidebar.conversation_menu_aria")}
            onClick={handleMenuOpen}
          >
            <MoreVert sx={{ fontSize: 18 }} />
          </ChatContextMenuTrigger>
        </Box>
      )}

      {showRowMenu && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: chatContextMenuPaperSlotProps }}
          MenuListProps={{ dense: true, sx: { py: 0.5 } }}
        >
          <MenuItem
            onClick={handleDelete}
            sx={{
              ...chatContextMenuItemSx,
              color: "error.main",
              fontWeight: 600,
              "&:hover": {
                pl: 1.25,
                bgcolor: alpha(theme.palette.error.main, isDark ? 0.16 : 0.09),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            {t("sidebar.delete_conversation_menu")}
          </MenuItem>
        </Menu>
      )}
    </ListItem>
  );
});

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | undefined;
  currentUserId: string | undefined;
  onSelectConversation: (conversationId: string) => void;
  conversationMenuDelete?: boolean;
  onRequestDeleteConversation?: (conversationId: string) => void;
  compact?: boolean;
  mintLightTeamUi?: boolean;
  viewerIsCompany?: boolean;
}

const ConversationSidebar = memo(function ConversationSidebar({
  conversations,
  currentConversationId,
  currentUserId,
  onSelectConversation,
  conversationMenuDelete = false,
  onRequestDeleteConversation,
  compact = false,
  mintLightTeamUi = false,
  viewerIsCompany = true,
}: ConversationSidebarProps) {
  const { t } = useTranslation("shared/chat");
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;
  const showRowMenu = conversationMenuDelete && typeof onRequestDeleteConversation === "function";
  const me = currentUserId != null ? String(currentUserId) : "";

  const emptyListHint = viewerIsCompany
    ? t("sidebar.start_chatting")
    : t("sidebar.start_chatting_candidate");

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        minHeight: 0,
        bgcolor: mintLightTeamUi ? "#F8FAFC" : undefined,
        ...(mintLightTeamUi
          ? TEAM_MINT_SCROLLBAR_SX
          : {
              scrollbarWidth: "thin",
              scrollbarColor: `${alpha(theme.palette.text.primary, 0.22)} transparent`,
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
                marginBlock: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.text.primary, 0.12),
                borderRadius: 100,
                border: "2px solid transparent",
                backgroundClip: "content-box",
              },
              "@media (hover: hover)": {
                "&:hover::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(theme.palette.text.primary, 0.22),
                },
              },
            }),
      }}
    >
      {conversations.length === 0 ? (
        <Stack id="chat-sidebar-empty-state" alignItems="center" spacing={1.5} sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: mintLightTeamUi ? "16px" : "50%",
              bgcolor: mintLightTeamUi ? "#ECFDF5" : alpha(primary, 0.12),
              border: mintLightTeamUi ? "1px solid rgba(52, 211, 153, 0.25)" : `1px solid ${alpha(primary, 0.2)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: mintLightTeamUi ? "0 4px 20px rgba(15, 23, 42, 0.05)" : undefined,
            }}
          >
            <ChatOutlined sx={{ fontSize: 28, color: mintLightTeamUi ? "#10B981" : primary }} />
          </Box>
          <Typography fontWeight={700} sx={{ color: mintLightTeamUi ? "#111827" : "text.primary", fontSize: "0.8125rem" }}>
            {t("sidebar.no_conversations")}
          </Typography>
          <Typography variant="caption" sx={{ maxWidth: 240, color: mintLightTeamUi ? "#6B7280" : "text.secondary" }}>
            {emptyListHint}
          </Typography>
        </Stack>
      ) : (
        <List id="chat-conversations-list" sx={{ p: compact ? 0.5 : 0.75, pt: compact ? 0.75 : 1 }}>
          {conversations.map((conv) => (
            <ConversationRow
              key={conv._id}
              conv={conv}
              isActive={conv._id === currentConversationId}
              me={me}
              onSelect={onSelectConversation}
              compact={compact}
              mintLightTeamUi={mintLightTeamUi}
              showRowMenu={showRowMenu}
              onRequestDeleteConversation={onRequestDeleteConversation}
            />
          ))}
        </List>
      )}
    </Box>
  );
});

export default ConversationSidebar;
