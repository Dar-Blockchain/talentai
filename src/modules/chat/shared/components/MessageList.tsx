import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle as ChatOutlined, Trash2 as DeleteOutlined, XCircle as CancelOutlined, MoreVertical as MoreVert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { formatTime, getParticipantDisplayName, isSameCalendarDay, messageDayKey, chatContextMenuContentCn, chatContextMenuItemCn } from "./helpers";
import type { Participant } from "./helpers";
import type { ChatShellConversation } from "@/modules/chat/shared/types/shell";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL } from "@/modules/chat/team-chat/constants/lastMessagePreview";
import { TEAM_MINT_UI } from "@/modules/chat/shared/constants/teamMintUi";

const PRIMARY = "#0D9488";
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

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
  return (
    <div className={cn("flex justify-center", mintLightTeamUi ? "py-2" : "py-2.5")}>
      <div
        className="rounded-full px-3.5 py-1"
        style={{
          backgroundColor: mintLightTeamUi ? TEAM_MINT_UI.bgCard : "#fff",
          border: mintLightTeamUi ? `1px solid ${TEAM_MINT_UI.border}` : "1px solid #E5E7EBCC",
          boxShadow: mintLightTeamUi ? TEAM_MINT_UI.shadowSoft : "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <span
          className="text-xs font-semibold tracking-[0.02em]"
          style={{ color: mintLightTeamUi ? TEAM_MINT_UI.textSecondary : undefined }}
        >
          {label}
        </span>
      </div>
    </div>
  );
});

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    email?: string;
    profile?: Participant["profile"];
  };
  receiver: {
    _id: string;
    email?: string;
    profile?: Participant["profile"];
  };
  isRead: boolean;
  createdAt: string;
  isDeletedForEveryone?: boolean;
  deletedAt?: string | null;
  deletedForEveryoneBy?: string;
  deliveryBlocked?: boolean;
  blockedReason?: "email" | "phone";
  pending?: boolean;
  /** Stable React key: set to tempId on send, carried forward on confirm so the
   *  MessageRow component is REUSED across the temp→confirmed transition instead of
   *  being remounted — prevents the double bubbleIn animation. */
  stableKey?: string;
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
  const textEmpty = !String(message.text ?? "").trim();
  const showDeleted =
    isDeletedForEveryone
    || (textEmpty && (!!message.deletedAt || !!message.deletedForEveryoneBy))
    || (!!assumeEmptyMeansDeleted && textEmpty);

  const showDeliveryBlocked = isOwn && !!message.deliveryBlocked && !showDeleted;

  const ownBg = mintLightTeamUi ? "transparent" : PRIMARY;
  const otherBg = mintLightTeamUi ? TEAM_MINT_UI.bgCard : "#fff";
  const ownColor = mintLightTeamUi ? "#FFFFFF" : "#fff";
  const otherColor = mintLightTeamUi ? TEAM_MINT_UI.textPrimary : "#111827";
  const borderOther = mintLightTeamUi ? `1px solid ${TEAM_MINT_UI.border}` : "1px solid #E5E7EBE6";

  const deletedPaper = mintLightTeamUi ? "rgba(243, 244, 246, 0.95)" : "#9E9E9E14";
  const blockedBg = mintLightTeamUi ? "rgba(254, 226, 226, 0.9)" : "#EF444412";
  const ownBubbleGradient = mintLightTeamUi ? TEAM_MINT_UI.ownBubbleGradient : undefined;

  const bubbleSurface =
    showDeleted
      ? { backgroundColor: deletedPaper, backgroundImage: "none" }
      : showDeliveryBlocked
        ? { backgroundColor: blockedBg, backgroundImage: "none" }
        : mintLightTeamUi && isOwn
          ? { backgroundColor: "transparent", backgroundImage: ownBubbleGradient }
          : { backgroundColor: isOwn ? ownBg : otherBg, backgroundImage: "none" };

  const color = showDeleted
    ? (mintLightTeamUi ? TEAM_MINT_UI.textSecondary : "#6B7280")
    : showDeliveryBlocked
      ? "#111827"
      : isOwn
        ? ownColor
        : otherColor;

  const border = showDeleted
    ? `1px solid ${mintLightTeamUi ? TEAM_MINT_UI.border : "#E5E7EB80"}`
    : showDeliveryBlocked
      ? "2px solid #EF44448C"
      : isOwn
        ? "none"
        : borderOther;

  const boxShadow = showDeleted
    ? "none"
    : mintLightTeamUi
      ? (isOwn ? "0 4px 18px rgba(16, 185, 129, 0.22)" : TEAM_MINT_UI.shadowSoft)
      : isOwn
        ? "0 2px 12px #0D948847"
        : "0 1px 4px rgba(0,0,0,0.06)";

  const hoverTransform = showDeleted ? "none" : "translateY(-2px)";
  const hoverFilter = showDeleted || !isOwn ? "none" : mintLightTeamUi ? "brightness(1.02)" : "brightness(1.03)";
  const hoverShadow = showDeleted
    ? "0 1px 8px rgba(0,0,0,0.04)"
    : showDeliveryBlocked
      ? "0 6px 20px #EF444438"
      : mintLightTeamUi
        ? (isOwn ? "0 8px 28px rgba(16, 185, 129, 0.32)" : TEAM_MINT_UI.shadowLift)
        : isOwn
          ? "0 8px 24px #0D948861"
          : "0 6px 20px rgba(0,0,0,0.09)";
  const hoverBg = showDeleted
    ? (mintLightTeamUi ? "rgba(243, 244, 246, 1)" : "#9E9E9E1C")
    : showDeliveryBlocked
      ? undefined
      : (mintLightTeamUi && isOwn ? "transparent" : undefined);
  const hoverBorder = showDeleted ? (mintLightTeamUi ? TEAM_MINT_UI.border : "#E5E7EBA6") : undefined;
  const hoverTimeOpacity = showDeleted ? 0.78 : isOwn ? 0.95 : 0.72;

  return (
    <div
      className={cn(
        "group/bubble max-w-[88%] sm:max-w-[72%] md:max-w-[68%] px-4 py-2.5 cursor-default",
        "hover:[transform:var(--bubble-hover-transform)] hover:[filter:var(--bubble-hover-filter)] hover:[box-shadow:var(--bubble-hover-shadow)]",
        hoverBg !== undefined && "hover:[background-color:var(--bubble-hover-bg)]",
        hoverBorder !== undefined && "hover:[border-color:var(--bubble-hover-border)]",
        mintLightTeamUi
          ? (isOwn ? "rounded-[18px_18px_6px_18px]" : "rounded-[18px_18px_18px_6px]")
          : (isOwn ? "rounded-[18px_18px_4px_18px]" : "rounded-[18px_18px_18px_4px]"),
      )}
      style={{
        ...bubbleSurface,
        color,
        border,
        boxShadow,
        transition: `box-shadow 0.2s ${EASE}, transform 0.2s ${EASE}, background-color 0.2s ${EASE}, border-color 0.2s ${EASE}, filter 0.2s ${EASE}, opacity 0.2s ${EASE}`,
        animation: "chatBubbleIn 0.22s ease-out both",
        opacity: isPending ? 0.65 : 1,
        ["--bubble-hover-transform" as string]: hoverTransform,
        ["--bubble-hover-filter" as string]: hoverFilter,
        ["--bubble-hover-shadow" as string]: hoverShadow,
        ...(hoverBg !== undefined ? { ["--bubble-hover-bg" as string]: hoverBg } : {}),
        ...(hoverBorder !== undefined ? { ["--bubble-hover-border" as string]: hoverBorder } : {}),
        ["--bubble-hover-time-opacity" as string]: String(hoverTimeOpacity),
      }}
    >
      {showDeleted ? (
        <p className="m-0 text-[0.8125rem] leading-[1.55] italic font-medium tracking-[0.01em]">
          {deletedLabel || "This message was deleted"}
        </p>
      ) : (
        <p className="m-0 text-[0.8125rem] leading-[1.55] break-words font-normal">
          {message.text}
        </p>
      )}
      {showDeliveryBlocked && deliveryBlockedCaption ? (
        <div className="mt-1.5 flex flex-row items-start gap-1.5">
          <CancelOutlined size={16} color="#EF4444" className="mt-px shrink-0" />
          <p className="m-0 text-[0.6875rem] leading-[1.45] font-semibold" style={{ color: "#EF4444" }}>
            {deliveryBlockedCaption}
          </p>
        </div>
      ) : null}
      <span
        className="chat-bubble-time block text-right mt-1 text-[0.6875rem] font-medium group-hover/bubble:[opacity:var(--bubble-hover-time-opacity)]"
        style={{
          opacity: showDeleted ? 0.65 : isOwn ? 0.82 : 0.55,
          color: mintLightTeamUi && !isOwn ? TEAM_MINT_UI.textMuted : "inherit",
          transition: `opacity 0.22s ${EASE}`,
        }}
      >
        {isPending ? "···" : timeLabel}
      </span>
    </div>
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
  const { t } = useTranslation("shared/chat");
  const { t: tTeam } = useTranslation("modules/company/teamChat");

  // Decide at mount time whether to animate in. Only fires once (at mount), since
  // it's computed via useState initializer — this avoids the need for an `isLatest`
  // prop which would flip true→false on the previous-last row every time a new
  // message arrives (causing a wasted rerender with no visual change).
  const [shouldAnimateIn] = useState(() => {
    // Pending (optimistic) messages always animate in — they're just sent.
    if (message.pending) return true;
    // Messages with a stableKey are confirmed sends: they were already animated
    // as the temp (pending) bubble. Suppressing here avoids a second animation
    // if React ever does remount this component (defensive, should not happen).
    if (message.stableKey) return false;
    // Incoming messages received within the threshold animate in.
    return (Date.now() - new Date(message.createdAt).getTime()) < ANIMATE_IN_THRESHOLD_MS;
  });

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

  const handleDeleteForMe = useCallback(() => {
    onDeleteMessage(message._id, "me");
  }, [onDeleteMessage, message._id]);

  const handleDeleteForEveryone = useCallback(() => {
    onDeleteMessage(message._id, "everyone");
  }, [onDeleteMessage, message._id]);

  const handleDeleteSingle = useCallback(() => {
    onDeleteMessage(message._id);
  }, [onDeleteMessage, message._id]);

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

  const menuButton = teamScopedDeletes && enableDeletes && !isSyntheticDeleted && !message.pending ? (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t("messages.more_actions", { defaultValue: "More actions" })}
                className={cn(
                  "delete-btn shrink-0 rounded-lg p-1 opacity-0 transition-[opacity,transform,background-color] duration-200 group-hover/row:opacity-100 hover:scale-[1.08]",
                  mintLightTeamUi ? "hover:bg-[#F3F4F6]" : "hover:bg-[#F3F4F614]",
                )}
                style={{ color: "#6B7280" }}
              >
                <MoreVert size={18} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{t("messages.more_actions", { defaultValue: "More actions" })}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align={isOwn ? "end" : "start"} className={chatContextMenuContentCn}>
        <DropdownMenuItem onClick={handleDeleteForMe} className={chatContextMenuItemCn}>
          <DeleteOutlined size={18} />
          {tTeam("message.delete_for_me", { defaultValue: "Delete for me" })}
        </DropdownMenuItem>
        {isOwn && (
          <DropdownMenuItem
            onClick={handleDeleteForEveryone}
            variant="destructive"
            className={cn(chatContextMenuItemCn, "font-semibold gap-2")}
          >
            <DeleteOutlined size={18} />
            {tTeam("message.delete_for_everyone", { defaultValue: "Delete for everyone" })}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const messageRow = (
    <div
      className={cn(
        "group/row flex flex-row items-end gap-1",
        isOwn ? "justify-end" : "justify-start",
        "px-0.5 sm:px-1 -mx-0.5 sm:-mx-1",
        mintLightTeamUi ? "py-[1.6px] rounded-[14px]" : "py-[2.8px] rounded-lg",
        "hover:[background-color:var(--row-hover-bg)] hover:[box-shadow:var(--row-hover-shadow)]",
      )}
      style={{
        transition: `background-color 0.2s ${EASE}, box-shadow 0.2s ${EASE}`,
        ["--row-hover-bg" as string]: mintLightTeamUi ? "rgba(236, 253, 245, 0.55)" : "#0D948808",
        ["--row-hover-shadow" as string]: mintLightTeamUi ? "none" : "inset 0 0 0 1px #E5E7EB0F",
      }}
    >
      {teamScopedDeletes && enableDeletes && !isSyntheticDeleted && !message.pending ? (
        isOwn ? <>{bubble}{menuButton}</> : <>{menuButton}{bubble}</>
      ) : (
        <>
          {!teamScopedDeletes && isCompany && enableDeletes && isOwn && !isSyntheticDeleted && !message.pending && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleDeleteSingle}
                    aria-label={t("delete_dialog.delete")}
                    className="delete-btn shrink-0 rounded-md p-1.5 opacity-0 transition-[opacity,transform,background-color] duration-200 group-hover/row:opacity-100 hover:scale-[1.08] hover:bg-[#EF44441F]"
                    style={{ color: "#EF4444" }}
                  >
                    <DeleteOutlined size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("delete_dialog.delete")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {bubble}
        </>
      )}
    </div>
  );

  return (
    <div
      className="w-full"
      style={shouldAnimateIn ? { animation: `chatRowGrowIn 0.24s ${EASE} both` } : undefined}
    >
      {messageRow}
    </div>
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

  const surface = mintLightTeamUi ? TEAM_MINT_UI.bgMain : "#FAFAFAF2";
  const backgroundImage = mintLightTeamUi ? "none" : "linear-gradient(180deg, #FFFFFFE6 0%, transparent 32%)";

  return (
    <div
      ref={listRef}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-3 sm:px-4 [scroll-behavior:smooth]",
        mintLightTeamUi ? "py-3.5" : "py-4",
        mintLightTeamUi
          ? "[scrollbar-width:thin] [scrollbar-color:rgba(17,24,39,0.22)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:[background-clip:content-box] [&::-webkit-scrollbar-thumb]:bg-[rgba(17,24,39,0.12)] hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(17,24,39,0.22)]"
          : "[scrollbar-width:thin] [scrollbar-color:#11182738_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-[#1118271F] hover:[&::-webkit-scrollbar-thumb]:bg-[#11182738]",
      )}
      style={{ backgroundColor: surface, backgroundImage }}
    >
      <style>{`
        @keyframes chatBubbleIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes chatRowGrowIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes chatListFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      {effectiveMessages.length === 0 ? (
        <div
          className="flex min-h-[220px] flex-col items-center justify-center gap-3 py-8"
          style={{ animation: "chatListFadeIn 0.28s ease-out both" }}
        >
          <div
            className={cn("flex h-14 w-14 items-center justify-center", mintLightTeamUi ? "rounded-2xl" : "rounded-full")}
            style={{
              backgroundColor: mintLightTeamUi ? TEAM_MINT_UI.primarySoft : "#0D94881F",
              border: mintLightTeamUi ? "1px solid rgba(52, 211, 153, 0.2)" : "none",
              boxShadow: mintLightTeamUi ? TEAM_MINT_UI.shadowSoft : undefined,
            }}
          >
            <ChatOutlined size={28} color={mintLightTeamUi ? TEAM_MINT_UI.primaryHover : PRIMARY} />
          </div>
          <p className="text-sm font-semibold" style={{ color: mintLightTeamUi ? TEAM_MINT_UI.textPrimary : "#111827" }}>
            {t("messages.no_messages")}
          </p>
          <p className="max-w-[280px] text-center text-xs" style={{ color: mintLightTeamUi ? TEAM_MINT_UI.textSecondary : "#6B7280" }}>
            {t("messages.start_conversation")}
          </p>
        </div>
      ) : (
        <div className={cn("flex flex-col", mintLightTeamUi ? "gap-[2.8px]" : "gap-1")}>
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
                key={message.stableKey ?? message._id}
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
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});

export default MessageList;
