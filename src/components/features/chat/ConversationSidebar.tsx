import React, { useState } from "react";
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

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  currentUserId,
  onSelectConversation,
  conversationMenuDelete = false,
  onRequestDeleteConversation,
  compact = false,
  mintLightTeamUi = false,
  viewerIsCompany = true,
}) => {
  const { t } = useTranslation("shared/chat");
  const theme = useTheme();
  const [rowMenu, setRowMenu] = useState<{ anchor: HTMLElement; conversationId: string } | null>(null);
  const showRowMenu = conversationMenuDelete && typeof onRequestDeleteConversation === "function";
  const primary = theme.palette.primary.main;
  const isDark = theme.palette.mode === "dark";
  const me = currentUserId != null ? String(currentUserId) : "";

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find((p) => String(p._id) !== me);

  const emptyListHint = viewerIsCompany
    ? t("sidebar.start_chatting")
    : t("sidebar.start_chatting_candidate");

  const ease = "cubic-bezier(0.4, 0, 0.2, 1)";
  const activeRowBg = mintLightTeamUi
    ? "#ECFDF5"
    : isDark ? alpha(primary, 0.12) : alpha(primary, 0.07);
  /** Light hover background only — no motion or shadows. */
  const hoverRowBg = mintLightTeamUi
    ? "#F8FAFC"
    : isDark ? safeAlpha(theme.palette.common.white, 0.05) : safeAlpha(theme.palette.common.black, 0.04);

  const row = compact
    ? {
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
      }
    : {
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
      };

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
          {conversations.map((conv, index) => {
            const otherUser = getOtherParticipant(conv);
            const isActive = conv._id === currentConversationId;
            const unreadN = normalizeConversationUnreadCount(conv.unreadCount, currentUserId);
            const hasUnread = unreadN > 0 && !isActive;
            const previewDeleted =
              !!conv.lastMessage?.isDeletedForEveryone
              || conv.lastMessage?.text === TEAM_LAST_MESSAGE_DELETED_SENTINEL;
            const previewBlocked = conv.lastMessage?.text === CHAT_LAST_MESSAGE_BLOCKED_PREVIEW;

            return (
              <React.Fragment key={conv._id}>
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
                    onClick={() => onSelectConversation(conv._id)}
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
                          /** Reserve space so the badge does not sit under the name */
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
                            /** Slightly inset on the avatar so the chip clears the title column */
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
                              : hasUnread
                                ? (mintLightTeamUi ? "#111827" : "text.primary")
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                        pr: 0.25,
                      }}
                    >
                      <ChatContextMenuTrigger
                        visibility="always"
                        menuOpen={rowMenu?.conversationId === conv._id}
                        aria-label={t("sidebar.conversation_menu_aria")}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRowMenu({ anchor: e.currentTarget, conversationId: conv._id });
                        }}
                      >
                        <MoreVert sx={{ fontSize: 20 }} />
                      </ChatContextMenuTrigger>
                    </Box>
                  )}
                </ListItem>
                {index < conversations.length - 1 && (
                  <Divider sx={{ mx: 1.5, borderColor: alpha(theme.palette.divider, isDark ? 0.25 : 0.5) }} />
                )}
              </React.Fragment>
            );
          })}
        </List>
      )}
      <Menu
        anchorEl={rowMenu?.anchor ?? null}
        open={Boolean(rowMenu)}
        onClose={() => setRowMenu(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: chatContextMenuPaperSlotProps,
        }}
        MenuListProps={{
          dense: true,
          sx: { py: 0.5 },
        }}
      >
        <MenuItem
          onClick={() => {
            if (rowMenu && onRequestDeleteConversation) {
              onRequestDeleteConversation(rowMenu.conversationId);
            }
            setRowMenu(null);
          }}
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
    </Box>
  );
};

export default ConversationSidebar;
