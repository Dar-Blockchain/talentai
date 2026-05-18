import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  useTheme,
  alpha,
  Fade,
  Grow,
  Tooltip,
} from "@mui/material";
import { keyframes } from "@mui/system";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import MoreVert from "@mui/icons-material/MoreVert";
import { useTranslation } from "react-i18next";
import { formatTime, getParticipantDisplayName, isSameCalendarDay, messageDayKey, chatContextMenuPaperSlotProps, chatContextMenuItemSx } from "./helpers";
import type { Participant } from "./helpers";
import type { ChatShellConversation } from "@/modules/shared/chat/types/shell";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL } from "@/modules/team-chat/constants/lastMessagePreview";
import ChatContextMenuTrigger from "./ChatContextMenuTrigger";
import { safeAlpha } from "@/utils/safeMuiAlpha";
import { TEAM_MINT_UI, TEAM_MINT_SCROLLBAR_SX } from "@/modules/shared/chat/constants/teamMintUi";

const bubbleIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const easeOut = "cubic-bezier(0.4, 0, 0.2, 1)";

/** Synthetic row when API returns no messages but conversation tail is "deleted for everyone" (e.g. clearedAt / race). */
const THREAD_DELETED_PLACEHOLDER_ID = "__thread_deleted_placeholder__";

/** Messages created within this window are considered "just arrived" and get a mount animation. */
const ANIMATE_IN_THRESHOLD_MS = 30_000;

const DaySeparator = memo(function DaySeparator({
  label,
  mintLightTeamUi,
}: {
  label: string;
  mintLightTeamUi: boolean;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: mintLightTeamUi ? 1 : 1.25 }}>
      <Paper
        elevation={0}
        sx={{
          px: 1.75,
          py: 0.5,
          borderRadius: 999,
          bgcolor: mintLightTeamUi
            ? TEAM_MINT_UI.bgCard
            : (isDark ? safeAlpha(theme.palette.background.paper, 0.85) : theme.palette.background.paper),
          border: mintLightTeamUi
            ? `1px solid ${TEAM_MINT_UI.border}`
            : `1px solid ${alpha(theme.palette.divider, isDark ? 0.35 : 0.8)}`,
          boxShadow: mintLightTeamUi
            ? TEAM_MINT_UI.shadowSoft
            : (isDark ? `0 1px 6px ${alpha("#000", 0.35)}` : `0 1px 4px ${alpha("#000", 0.05)}`),
        }}
      >
        <Typography
          variant="caption"
          fontWeight={600}
          letterSpacing={0.02}
          sx={{ color: mintLightTeamUi ? TEAM_MINT_UI.textSecondary : undefined }}
        >
          {label}
        </Typography>
      </Paper>
    </Box>
  );
});

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    email?: string;
    profile?: any;
  };
  receiver: {
    _id: string;
    email?: string;
    profile?: any;
  };
  isRead: boolean;
  createdAt: string;
  isDeletedForEveryone?: boolean;
  deletedAt?: string | null;
  deletedForEveryoneBy?: string;
  deliveryBlocked?: boolean;
  blockedReason?: "email" | "phone";
  pending?: boolean;
}

interface MessageListProps {
  messages: Message[];
  /** When `messages` is empty but the open conversation still has a deleted-for-everyone tail, show one placeholder bubble (WhatsApp-like). */
  threadLastMessage?: ChatShellConversation["lastMessage"];
  currentUserId: string | undefined;
  /** DM counterpart — used to show "{{name}} deleted this message" for the receiver. */
  otherUser?: Participant;
  isCompany: boolean;
  onDeleteMessage: (messageId: string, scope?: "me" | "everyone") => void;
  enableDeletes?: boolean;
  teamScopedDeletes?: boolean;
  /** Team chat: light mint message surfaces + bubbles. */
  mintLightTeamUi?: boolean;
}

type Row =
  | { kind: "separator"; dayKey: string; label: string }
  | { kind: "message"; message: Message };

function buildRows(messages: Message[], labelForDay: (iso: string) => string): Row[] {
  const rows: Row[] = [];
  let prevKey = "";
  for (const message of messages) {
    const dk = messageDayKey(message.createdAt);
    if (dk !== prevKey) {
      rows.push({ kind: "separator", dayKey: dk, label: labelForDay(message.createdAt) });
      prevKey = dk;
    }
    rows.push({ kind: "message", message });
  }
  return rows;
}

interface BubbleProps {
  message: Message;
  isOwn: boolean;
  /** From parent row (flags + team empty-text heuristic). */
  isDeletedForEveryone: boolean;
  /** Team chat: empty body should render as tombstone (WhatsApp-like). */
  assumeEmptyMeansDeleted?: boolean;
  deletedLabel: string;
  timeLabel: string;
  /** Own message blocked from delivery (contact policy). */
  deliveryBlockedCaption?: string;
  mintLightTeamUi?: boolean;
  isPending?: boolean;
}

const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  isDeletedForEveryone,
  assumeEmptyMeansDeleted,
  deletedLabel,
  timeLabel,
  deliveryBlockedCaption,
  mintLightTeamUi = false,
  isPending = false,
}: BubbleProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;
  const textEmpty = !String(message.text ?? "").trim();
  const showDeleted =
    isDeletedForEveryone
    || (textEmpty && (!!message.deletedAt || !!message.deletedForEveryoneBy))
    || (!!assumeEmptyMeansDeleted && textEmpty);

  const showDeliveryBlocked = isOwn && !!message.deliveryBlocked && !showDeleted;

  const ownBg = mintLightTeamUi ? "transparent" : (isDark ? alpha(primary, 0.85) : primary);
  const otherBg = mintLightTeamUi
    ? TEAM_MINT_UI.bgCard
    : (isDark ? safeAlpha(theme.palette.common.white, 0.06) : theme.palette.background.paper);
  const ownColor = mintLightTeamUi ? "#FFFFFF" : theme.palette.primary.contrastText;
  const otherColor = mintLightTeamUi ? TEAM_MINT_UI.textPrimary : theme.palette.text.primary;
  const borderOther = mintLightTeamUi
    ? `1px solid ${TEAM_MINT_UI.border}`
    : (isDark ? `1px solid ${alpha(theme.palette.divider, 0.35)}` : `1px solid ${alpha(theme.palette.divider, 0.9)}`);

  const deletedPaper = mintLightTeamUi
    ? "rgba(243, 244, 246, 0.95)"
    : (isDark ? alpha(theme.palette.action.hover, 0.35) : alpha(theme.palette.grey[500], 0.08));

  const blockedBg = mintLightTeamUi
    ? "rgba(254, 226, 226, 0.9)"
    : (isDark ? alpha(theme.palette.error.main, 0.18) : alpha(theme.palette.error.main, 0.07));

  const ownBubbleGradient = mintLightTeamUi ? TEAM_MINT_UI.ownBubbleGradient : undefined;

  const bubbleSurface =
    showDeleted
      ? { bgcolor: deletedPaper, backgroundImage: "none" }
      : showDeliveryBlocked
        ? { bgcolor: blockedBg, backgroundImage: "none" }
        : mintLightTeamUi && isOwn
          ? { bgcolor: "transparent", backgroundImage: ownBubbleGradient }
          : { bgcolor: isOwn ? ownBg : otherBg, backgroundImage: "none" };

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: { xs: "88%", sm: "72%", md: "68%" },
        px: 2,
        py: 1.25,
        borderRadius: mintLightTeamUi
          ? (isOwn ? "18px 18px 6px 18px" : "18px 18px 18px 6px")
          : (isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px"),
        ...bubbleSurface,
        color: showDeleted
          ? (mintLightTeamUi ? TEAM_MINT_UI.textSecondary : theme.palette.text.secondary)
          : showDeliveryBlocked
            ? (isDark ? alpha(theme.palette.error.light, 0.92) : theme.palette.text.primary)
            : isOwn
              ? ownColor
              : otherColor,
        border: showDeleted
          ? `1px solid ${mintLightTeamUi ? TEAM_MINT_UI.border : alpha(theme.palette.divider, isDark ? 0.25 : 0.5)}`
          : showDeliveryBlocked
            ? `2px solid ${alpha(theme.palette.error.main, isDark ? 0.7 : 0.55)}`
            : isOwn
              ? "none"
              : borderOther,
        boxShadow: showDeleted
          ? "none"
          : mintLightTeamUi
            ? (isOwn ? "0 4px 18px rgba(16, 185, 129, 0.22)" : TEAM_MINT_UI.shadowSoft)
            : isOwn
              ? `0 2px 12px ${alpha(primary, isDark ? 0.35 : 0.28)}`
              : isDark
                ? `0 1px 4px ${alpha("#000", 0.35)}`
                : `0 1px 4px ${alpha("#000", 0.06)}`,
        transition: `box-shadow 0.2s ${easeOut}, transform 0.2s ${easeOut}, background-color 0.2s ${easeOut}, border-color 0.2s ${easeOut}, filter 0.2s ${easeOut}, opacity 0.2s ${easeOut}`,
        animation: `${bubbleIn} 0.22s ease-out both`,
        opacity: isPending ? 0.65 : 1,
        cursor: "default",
        "@media (hover: hover)": {
          "&:hover": {
            transform: showDeleted ? "none" : "translateY(-2px)",
            filter: showDeleted || !isOwn ? "none" : mintLightTeamUi ? "brightness(1.02)" : (isDark ? "brightness(1.06)" : "brightness(1.03)"),
            boxShadow: showDeleted
              ? `0 1px 8px ${safeAlpha(theme.palette.common.black, mintLightTeamUi ? 0.04 : (isDark ? 0.2 : 0.04))}`
              : showDeliveryBlocked
                ? `0 6px 20px ${alpha(theme.palette.error.main, isDark ? 0.38 : 0.22)}`
                : mintLightTeamUi
                  ? (isOwn ? "0 8px 28px rgba(16, 185, 129, 0.32)" : TEAM_MINT_UI.shadowLift)
                  : isOwn
                    ? `0 8px 24px ${alpha(primary, isDark ? 0.5 : 0.38)}`
                    : isDark
                      ? `0 6px 20px ${alpha("#000", 0.42)}`
                      : `0 6px 20px ${alpha("#000", 0.09)}`,
            bgcolor: showDeleted
              ? (mintLightTeamUi ? "rgba(243, 244, 246, 1)" : (isDark ? alpha(theme.palette.action.hover, 0.5) : alpha(theme.palette.grey[500], 0.11)))
              : showDeliveryBlocked
                ? undefined
                : mintLightTeamUi && isOwn && !showDeleted
                  ? "transparent"
                  : undefined,
            borderColor: showDeleted ? (mintLightTeamUi ? TEAM_MINT_UI.border : alpha(theme.palette.divider, isDark ? 0.45 : 0.65)) : undefined,
            "& .chat-bubble-time": {
              opacity: showDeleted ? 0.78 : isOwn ? 0.95 : 0.72,
            },
          },
        },
      }}
    >
      {showDeleted ? (
        <Typography
          component="p"
          sx={{
            m: 0,
            fontSize: "0.8125rem",
            lineHeight: 1.55,
            fontStyle: "italic",
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          {deletedLabel || "This message was deleted"}
        </Typography>
      ) : (
        <Typography
          component="p"
          sx={{
            m: 0,
            fontSize: "0.8125rem",
            lineHeight: 1.55,
            wordBreak: "break-word",
            fontWeight: 400,
          }}
        >
          {message.text}
        </Typography>
      )}
      {showDeliveryBlocked && deliveryBlockedCaption ? (
        <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 0.75 }}>
          <CancelOutlined
            sx={{
              fontSize: 16,
              color: isDark ? alpha(theme.palette.error.light, 0.9) : theme.palette.error.main,
              mt: "1px",
              flexShrink: 0,
            }}
          />
          <Typography
            component="p"
            variant="caption"
            sx={{
              m: 0,
              fontSize: "0.6875rem",
              lineHeight: 1.45,
              fontWeight: 600,
              color: isDark ? alpha(theme.palette.error.light, 0.85) : theme.palette.error.dark,
            }}
          >
            {deliveryBlockedCaption}
          </Typography>
        </Stack>
      ) : null}
      <Typography
        component="span"
        className="chat-bubble-time"
        sx={{
          display: "block",
          textAlign: "right",
          mt: 0.5,
          fontSize: "0.6875rem",
          fontWeight: 500,
          opacity: showDeleted ? 0.65 : isOwn ? 0.82 : 0.55,
          color: mintLightTeamUi && !isOwn ? TEAM_MINT_UI.textMuted : "inherit",
          transition: `opacity 0.22s ${easeOut}`,
        }}
      >
        {isPending ? "···" : timeLabel}
      </Typography>
    </Paper>
  );
});

interface MessageRowProps {
  message: Message;
  /** Pre-computed so only the 2 affected rows rerender on isOwn change. */
  isOwn: boolean;
  isSyntheticDeleted: boolean;
  currentUserId: string | undefined;
  otherUser?: Participant;
  isCompany: boolean;
  onDeleteMessage: (id: string, scope?: "me" | "everyone") => void;
  enableDeletes: boolean;
  teamScopedDeletes: boolean;
  mintLightTeamUi: boolean;
}

const MessageRow = memo(function MessageRow({
  message,
  isOwn,
  isSyntheticDeleted,
  currentUserId,
  otherUser,
  isCompany,
  onDeleteMessage,
  enableDeletes,
  teamScopedDeletes,
  mintLightTeamUi,
}: MessageRowProps) {
  const theme = useTheme();
  const { t } = useTranslation("shared/chat");
  const { t: tTeam } = useTranslation("modules/company/teamChat");
  const isDark = theme.palette.mode === "dark";
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // Decide at mount time whether to animate in. `appear` on <Grow> only fires once
  // (at mount), so this never needs to change — using useState initializer avoids
  // the need for `isLatest` prop which would flip true→false on the previous-last row
  // every time a new message arrives (causing a wasted rerender with no visual change).
  const [shouldAnimateIn] = useState(
    () => !!message.pending || (Date.now() - new Date(message.createdAt).getTime()) < ANIMATE_IN_THRESHOLD_MS,
  );

  const textEmpty = !String(message.text ?? "").trim();
  const isDeletedForEveryone =
    !!message.isDeletedForEveryone
    || (textEmpty && (!!message.deletedAt || !!message.deletedForEveryoneBy))
    || (teamScopedDeletes && textEmpty && !isSyntheticDeleted);

  const deletedBubbleLabel = useMemo(() => {
    if (!teamScopedDeletes) {
      return t("messages.this_message_was_deleted", { defaultValue: "This message was deleted" });
    }
    if (!isDeletedForEveryone) {
      return tTeam("message.this_message_was_deleted", { defaultValue: "This message was deleted" });
    }
    const deleterId = message.deletedForEveryoneBy ? String(message.deletedForEveryoneBy) : "";
    const viewerId = currentUserId ? String(currentUserId) : "";
    if (deleterId && viewerId && deleterId === viewerId) {
      return tTeam("message.you_deleted_this_message", { defaultValue: "You deleted this message" });
    }
    if (deleterId && otherUser && deleterId === String(otherUser._id)) {
      const name = getParticipantDisplayName(otherUser);
      return tTeam("message.peer_deleted_this_message", {
        name,
        defaultValue: "{{name}} deleted this message",
      });
    }
    return tTeam("message.this_message_was_deleted", { defaultValue: "This message was deleted" });
  }, [teamScopedDeletes, isDeletedForEveryone, message.deletedForEveryoneBy, currentUserId, otherUser, t, tTeam]);

  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(e.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => setMenuAnchor(null), []);

  const handleDeleteForMe = useCallback(() => {
    onDeleteMessage(message._id, "me");
    setMenuAnchor(null);
  }, [onDeleteMessage, message._id]);

  const handleDeleteForEveryone = useCallback(() => {
    onDeleteMessage(message._id, "everyone");
    setMenuAnchor(null);
  }, [onDeleteMessage, message._id]);

  const handleDeleteSingle = useCallback(() => {
    onDeleteMessage(message._id);
  }, [onDeleteMessage, message._id]);

  const menuButton = teamScopedDeletes && enableDeletes && !isDeletedForEveryone && !message.pending ? (
    <ChatContextMenuTrigger
      key="msg-menu"
      className="delete-btn"
      visibility="fadeOnRowHover"
      menuOpen={Boolean(menuAnchor)}
      tooltipTitle={tTeam("message.actions")}
      onClick={handleMenuOpen}
      aria-label={tTeam("message.actions")}
    >
      <MoreVert sx={{ fontSize: 20 }} />
    </ChatContextMenuTrigger>
  ) : null;

  const bubble = (
    <MessageBubble
      message={message}
      isOwn={isOwn}
      isDeletedForEveryone={isDeletedForEveryone}
      assumeEmptyMeansDeleted={teamScopedDeletes}
      deletedLabel={deletedBubbleLabel}
      timeLabel={formatTime(message.createdAt)}
      mintLightTeamUi={mintLightTeamUi}
      isPending={!!message.pending}
      deliveryBlockedCaption={
        isOwn && message.deliveryBlocked
          ? message.blockedReason === "phone"
            ? t("messages.delivery_blocked_phone")
            : t("messages.delivery_blocked_email")
          : undefined
      }
    />
  );

  const messageRow = (
    <Stack
      direction="row"
      spacing={0.5}
      justifyContent={isOwn ? "flex-end" : "flex-start"}
      alignItems="flex-end"
      sx={{
        py: mintLightTeamUi ? 0.2 : 0.35,
        px: { xs: 0.25, sm: 0.5 },
        mx: { xs: -0.25, sm: -0.5 },
        borderRadius: mintLightTeamUi ? "14px" : 2,
        transition: `background-color 0.2s ${easeOut}, box-shadow 0.2s ${easeOut}`,
        "@media (hover: hover)": {
          "&:hover": {
            bgcolor: mintLightTeamUi ? "rgba(236, 253, 245, 0.55)" : alpha(theme.palette.primary.main, isDark ? 0.04 : 0.03),
            boxShadow: mintLightTeamUi ? "none" : `inset 0 0 0 1px ${alpha(theme.palette.divider, isDark ? 0.12 : 0.06)}`,
          },
        },
        "&:hover .delete-btn": { opacity: 1 },
      }}
    >
      {teamScopedDeletes && enableDeletes
        ? (isOwn ? [bubble, menuButton] : [menuButton, bubble])
        : (
          <>
            {!teamScopedDeletes && isCompany && enableDeletes && isOwn && !isSyntheticDeleted && !message.pending && (
              <Tooltip title={t("delete_dialog.delete")}>
                <IconButton
                  className="delete-btn"
                  onClick={handleDeleteSingle}
                  size="small"
                  sx={{
                    opacity: 0,
                    transition: `opacity 0.22s ${easeOut}, transform 0.2s ${easeOut}`,
                    color: theme.palette.error.main,
                    p: "6px",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.error.main, 0.12),
                      transform: "scale(1.08)",
                    },
                  }}
                >
                  <DeleteOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {bubble}
          </>
        )}
    </Stack>
  );

  return (
    <React.Fragment>
      <Grow in timeout={240} appear={shouldAnimateIn}>
        <Box sx={{ width: "100%" }}>{messageRow}</Box>
      </Grow>
      {teamScopedDeletes && enableDeletes && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{ paper: chatContextMenuPaperSlotProps }}
          MenuListProps={{ dense: true, sx: { py: 0.5 } }}
        >
          <MenuItem onClick={handleDeleteForMe} sx={chatContextMenuItemSx}>
            {tTeam("message.delete_for_me")}
          </MenuItem>
          {isOwn && (
            <MenuItem onClick={handleDeleteForEveryone} sx={chatContextMenuItemSx}>
              {tTeam("message.delete_for_everyone")}
            </MenuItem>
          )}
        </Menu>
      )}
    </React.Fragment>
  );
});

const MessageList = memo(function MessageList({
  messages,
  threadLastMessage,
  currentUserId,
  otherUser,
  isCompany,
  onDeleteMessage,
  enableDeletes = true,
  teamScopedDeletes = false,
  mintLightTeamUi = false,
}: MessageListProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation("shared/chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const effectiveMessages = useMemo((): Message[] => {
    if (messages.length > 0) return messages;
    const lm = threadLastMessage;
    if (!lm) return messages;
    const deletedPreview =
      !!lm.isDeletedForEveryone
      || String(lm.text ?? "") === TEAM_LAST_MESSAGE_DELETED_SENTINEL;
    if (!deletedPreview) return messages;
    const senderIdStr = lm.senderId ? String(lm.senderId) : String(currentUserId || "unknown");
    const recv = currentUserId && senderIdStr !== String(currentUserId)
      ? String(currentUserId)
      : "receiver_placeholder";
    return [
      {
        _id: THREAD_DELETED_PLACEHOLDER_ID,
        text: "",
        sender: { _id: senderIdStr },
        receiver: { _id: recv },
        isRead: true,
        createdAt: lm.timestamp || new Date().toISOString(),
        isDeletedForEveryone: true,
      },
    ];
  }, [messages, threadLastMessage, currentUserId]);

  const labelForDay = useMemo(
    () => (iso: string) => {
      const d = new Date(iso);
      const now = new Date();
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      if (isSameCalendarDay(d, now)) return t("messages.date_today");
      if (isSameCalendarDay(d, y)) return t("messages.date_yesterday");
      return d.toLocaleDateString(i18n.language, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    },
    [t, i18n.language],
  );

  const rows = useMemo(
    () => buildRows(effectiveMessages, labelForDay),
    [effectiveMessages, labelForDay],
  );

  const lastMsgId = effectiveMessages.length ? effectiveMessages[effectiveMessages.length - 1]?._id : "";
  useEffect(() => {
    if (effectiveMessages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [effectiveMessages.length, lastMsgId]);

  const isDark = theme.palette.mode === "dark";
  const surface = mintLightTeamUi
    ? TEAM_MINT_UI.bgMain
    : (isDark ? safeAlpha(theme.palette.background.default, 0.6) : alpha(theme.palette.grey[50], 0.95));

  return (
    <Box
      ref={listRef}
      sx={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        scrollBehavior: "smooth",
        px: { xs: 1.5, sm: 2 },
        py: mintLightTeamUi ? 1.75 : 2,
        bgcolor: surface,
        minHeight: 0,
        backgroundImage: mintLightTeamUi
          ? "none"
          : (isDark
            ? `linear-gradient(180deg, ${safeAlpha(theme.palette.common.black, 0.2)} 0%, transparent 40%)`
            : `linear-gradient(180deg, ${safeAlpha(theme.palette.common.white, 0.9)} 0%, transparent 32%)`),
        ...(mintLightTeamUi
          ? TEAM_MINT_SCROLLBAR_SX
          : {
              scrollbarWidth: "thin",
              scrollbarColor: `${alpha(theme.palette.text.primary, 0.22)} transparent`,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                background: alpha(theme.palette.text.primary, 0.12),
                borderRadius: "8px",
              },
              "@media (hover: hover)": {
                "&:hover::-webkit-scrollbar-thumb": {
                  background: alpha(theme.palette.text.primary, 0.22),
                },
              },
            }),
      }}
    >
      {effectiveMessages.length === 0 ? (
        <Fade in timeout={280}>
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            sx={{ minHeight: 220, py: 4 }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: mintLightTeamUi ? "16px" : "50%",
                bgcolor: mintLightTeamUi ? TEAM_MINT_UI.primarySoft : alpha(theme.palette.primary.main, 0.12),
                border: mintLightTeamUi ? `1px solid rgba(52, 211, 153, 0.2)` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: mintLightTeamUi ? TEAM_MINT_UI.shadowSoft : undefined,
              }}
            >
              <ChatOutlined sx={{ fontSize: 28, color: mintLightTeamUi ? TEAM_MINT_UI.primaryHover : theme.palette.primary.main }} />
            </Box>
            <Typography sx={{ color: mintLightTeamUi ? TEAM_MINT_UI.textPrimary : "text.primary", fontWeight: 600, fontSize: "0.875rem" }}>
              {t("messages.no_messages")}
            </Typography>
            <Typography sx={{ color: mintLightTeamUi ? TEAM_MINT_UI.textSecondary : "text.secondary", fontSize: "0.75rem", textAlign: "center", maxWidth: 280 }}>
              {t("messages.start_conversation")}
            </Typography>
          </Stack>
        </Fade>
      ) : (
        <Stack spacing={mintLightTeamUi ? 0.35 : 0.5}>
          {rows.map((row) => {
            if (row.kind === "separator") {
              return (
                <DaySeparator
                  key={`sep-${row.dayKey}`}
                  label={row.label}
                  mintLightTeamUi={mintLightTeamUi}
                />
              );
            }

            const message = row.message;
            const senderId = typeof message.sender === "string" ? message.sender : message.sender._id;
            const isOwn = String(senderId) === String(currentUserId);
            const isSyntheticDeleted = message._id === THREAD_DELETED_PLACEHOLDER_ID;
            return (
              <MessageRow
                key={message._id}
                message={message}
                isOwn={isOwn}
                isSyntheticDeleted={isSyntheticDeleted}
                currentUserId={currentUserId}
                otherUser={otherUser}
                isCompany={isCompany}
                onDeleteMessage={onDeleteMessage}
                enableDeletes={enableDeletes}
                teamScopedDeletes={teamScopedDeletes}
                mintLightTeamUi={mintLightTeamUi}
              />
            );
          })}
        </Stack>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
});

export default MessageList;
