import React, { memo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Badge,
  Divider,
  Stack,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL } from "@/modules/team-chat/constants/lastMessagePreview";
import { CHAT_LAST_MESSAGE_BLOCKED_PREVIEW } from "@/modules/shared/chat/constants/contactPolicy";
import { TEAM_MINT_SCROLLBAR_SX } from "@/modules/shared/chat/constants/teamMintUi";
import { normalizeConversationUnreadCount } from "@/modules/shared/chat/utils/normalizeConversationUnread";
import { Participant, getParticipantDisplayName, getParticipantInitial, formatListTime, chatContextMenuPaperSlotProps, chatContextMenuItemSx } from "./helpers";
import ChatContextMenuTrigger from "./ChatContextMenuTrigger";
import { safeAlpha } from "@/utils/safeMuiAlpha";

// Stable module-level constants so ConversationRow never sees a new object reference.
const ROW_SIZING_COMPACT = {
  listItemPy: 0,
  btnPy: 0.65,
  btnPx: 1.25,
  avatar: 34,
  avatarMinW: 44,
  avatarFont: "0.75rem",
  nameFont: "0.75rem",
  nameLine: 1.28,
  previewFont: "0.6875rem",
  timeFont: "0.625rem",
  timeMt: 0.2,
  avatarMt: 0.1,
} as const;

const ROW_SIZING_DEFAULT = {
  listItemPy: 0.25,
  btnPy: 1.25,
  btnPx: 1.5,
  avatar: 42,
  avatarMinW: 52,
  avatarFont: "0.875rem",
  nameFont: "0.8125rem",
  nameLine: 1.35,
  previewFont: "0.75rem",
  timeFont: "0.65rem",
  timeMt: 0.35,
  avatarMt: 0.25,
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
  /** Pre-computed so only the 2 affected rows rerender on conversation switch. */
  isActive: boolean;
  /** String(currentUserId) or "" — stable primitive, no re-boxing needed. */
  me: string;
  onSelect: (id: string) => void;
  compact: boolean;
  mintLightTeamUi: boolean;
  showRowMenu: boolean;
  onRequestDeleteConversation?: (id: string) => void;
  showDivider: boolean;
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
  showDivider,
}: ConversationRowProps) {
  const theme = useTheme();
  const { t } = useTranslation("shared/chat");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const row = compact ? ROW_SIZING_COMPACT : ROW_SIZING_DEFAULT;
  const primary = theme.palette.primary.main;
  const isDark = theme.palette.mode === "dark";
  const ease = "cubic-bezier(0.4, 0, 0.2, 1)";
  const activeRowBg = mintLightTeamUi
    ? "#ECFDF5"
    : isDark ? alpha(primary, 0.12) : alpha(primary, 0.07);
  const hoverRowBg = mintLightTeamUi
    ? "#F8FAFC"
    : isDark ? safeAlpha(theme.palette.common.white, 0.05) : safeAlpha(theme.palette.common.black, 0.04);

  const otherUser = conv.participants.find((p) => String(p._id) !== me);
  const unreadN = normalizeConversationUnreadCount(conv.unreadCount, me || undefined);
  const hasUnread = unreadN > 0 && !isActive;
  const previewDeleted =
    !!conv.lastMessage?.isDeletedForEveryone
    || conv.lastMessage?.text === TEAM_LAST_MESSAGE_DELETED_SENTINEL;
  const previewBlocked = conv.lastMessage?.text === CHAT_LAST_MESSAGE_BLOCKED_PREVIEW;

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

  return (
    <React.Fragment>
      <ListItem
        id={`chat-conv-item-${conv._id}`}
        disablePadding
        sx={{
          px: mintLightTeamUi ? 1.25 : 1,
          py: row.listItemPy,
          display: "flex",
          alignItems: "stretch",
          gap: 0,
        }}
      >
        <ListItemButton
          onClick={handleRowClick}
          sx={{
            flex: 1,
            minWidth: 0,
            py: mintLightTeamUi ? (compact ? 0.75 : 1) : row.btnPy,
            px: row.btnPx,
            borderRadius: mintLightTeamUi ? "14px" : 2,
            alignItems: "flex-start",
            bgcolor: isActive ? activeRowBg : "transparent",
            border: mintLightTeamUi ? `1px solid ${isActive ? "rgba(52, 211, 153, 0.35)" : "transparent"}` : undefined,
            borderLeft: mintLightTeamUi ? undefined : (isActive ? `3px solid ${primary}` : "3px solid transparent"),
            boxShadow: mintLightTeamUi && isActive ? "0 4px 16px rgba(15, 23, 42, 0.06)" : undefined,
            transition: mintLightTeamUi ? `all 0.2s ${ease}` : `background-color 0.18s ${ease}`,
            "@media (hover: hover)": {
              "&:hover": {
                bgcolor: isActive ? activeRowBg : hoverRowBg,
                ...(mintLightTeamUi && !isActive ? { boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)" } : {}),
                ...(mintLightTeamUi && !isActive ? { transform: "translateY(-1px)" } : {}),
              },
            },
          }}
        >
          <ListItemAvatar sx={{ minWidth: row.avatarMinW, mt: row.avatarMt }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              badgeContent={unreadN}
              invisible={!hasUnread}
              sx={{
                mr: hasUnread ? 1.25 : 0,
                "& .MuiBadge-badge": {
                  bgcolor: mintLightTeamUi ? "#34D399" : theme.palette.error.main,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: compact ? "0.6rem" : "0.625rem",
                  lineHeight: 1,
                  minWidth: compact ? 18 : 20,
                  height: compact ? 18 : 20,
                  px: 0.5,
                  borderRadius: 999,
                  right: compact ? "5px" : "7px",
                  top: compact ? "4px" : "5px",
                  boxSizing: "border-box",
                },
              }}
            >
              <Avatar
                sx={{
                  width: row.avatar,
                  height: row.avatar,
                  bgcolor: isActive
                    ? (mintLightTeamUi ? "#10B981" : primary)
                    : alpha(theme.palette.text.primary, isDark ? 0.12 : 0.08),
                  color: isActive ? "#fff" : theme.palette.text.secondary,
                  fontSize: row.avatarFont,
                  fontWeight: 700,
                  boxShadow: isActive
                    ? (mintLightTeamUi ? "0 2px 8px rgba(16, 185, 129, 0.35)" : `0 1px 4px ${alpha(primary, 0.25)}`)
                    : "none",
                }}
              >
                {getParticipantInitial(otherUser)}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                fontWeight={hasUnread ? 700 : 600}
                sx={{
                  color: isActive
                    ? (mintLightTeamUi ? "#065F46" : primary)
                    : (mintLightTeamUi ? "#111827" : "text.primary"),
                }}
                fontSize={row.nameFont}
                lineHeight={row.nameLine}
                noWrap
              >
                {getParticipantDisplayName(otherUser)}
              </Typography>
            }
            secondary={
              previewDeleted
                ? t("messages.this_message_was_deleted")
                : previewBlocked
                  ? ""
                  : conv.lastMessage?.text || t("sidebar.no_messages")
            }
            secondaryTypographyProps={{
              noWrap: true,
              fontSize: row.previewFont,
              fontStyle: previewDeleted ? "italic" : undefined,
              fontWeight: hasUnread && !previewDeleted ? 500 : 400,
              color: previewDeleted
                ? "text.disabled"
                : hasUnread
                  ? (mintLightTeamUi ? "#111827" : "text.primary")
                  : (mintLightTeamUi ? "#6B7280" : "text.secondary"),
              sx: { mt: compact ? 0.15 : 0.25, display: "block" },
            }}
            sx={{ my: 0 }}
          />
          <Typography
            variant="caption"
            color={isActive ? primary : "text.secondary"}
            sx={{
              flexShrink: 0,
              ml: 1,
              mt: row.timeMt,
              fontWeight: isActive ? 700 : 500,
              fontSize: row.timeFont,
            }}
          >
            {conv.lastMessage?.timestamp
              ? formatListTime(conv.lastMessage.timestamp)
              : formatListTime(conv.updatedAt)}
          </Typography>
        </ListItemButton>
        {showRowMenu && (
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, pr: 0.25 }}>
            <ChatContextMenuTrigger
              visibility="always"
              menuOpen={Boolean(menuAnchor)}
              aria-label={t("sidebar.conversation_menu_aria")}
              onClick={handleMenuOpen}
            >
              <MoreVert sx={{ fontSize: 20 }} />
            </ChatContextMenuTrigger>
          </Box>
        )}
      </ListItem>
      {showDivider && (
        <Divider sx={{ mx: 1.5, borderColor: alpha(theme.palette.divider, isDark ? 0.25 : 0.5) }} />
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
    </React.Fragment>
  );
});

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | undefined;
  currentUserId: string | undefined;
  onSelectConversation: (conversationId: string) => void;
  /** Row three-dot menu with delete (e.g. team chat). */
  conversationMenuDelete?: boolean;
  onRequestDeleteConversation?: (conversationId: string) => void;
  /** Denser list rows (team chat in module frame). */
  compact?: boolean;
  /** Team chat: light mint SaaS styling (fixed light palette on rows). */
  mintLightTeamUi?: boolean;
  /** Company vs candidate/recruiter copy for empty-state hint under the list. */
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
        <List id="chat-conversations-list" sx={{ p: 0 }}>
          {conversations.map((conv, index) => (
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
              showDivider={index < conversations.length - 1}
            />
          ))}
        </List>
      )}
    </Box>
  );
});

export default ConversationSidebar;
