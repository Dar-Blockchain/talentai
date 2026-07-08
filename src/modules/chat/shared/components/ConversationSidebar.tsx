import React, { memo, useCallback, useState } from "react";
import { MessageCircle as ChatOutlined, MoreVertical as MoreVert, Trash2 as DeleteOutline } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL } from "@/modules/chat/team-chat/constants/lastMessagePreview";
import { CHAT_LAST_MESSAGE_BLOCKED_PREVIEW } from "@/modules/chat/shared/constants/contactPolicy";
import { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";
import { Participant, getParticipantDisplayName, getParticipantInitial, formatListTime, chatContextMenuContentCn, chatContextMenuItemCn } from "./helpers";
import ChatContextMenuTrigger from "./ChatContextMenuTrigger";
import ChatUnreadBadge from "./ChatUnreadBadge";

const ease = "cubic-bezier(0.4, 0, 0.2, 1)";
const PRIMARY = "#0D9488";

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

// Stable sizing tokens (already resolved to px / rem — no MUI spacing scale involved)
const ROW_SIZING_COMPACT = {
  py: 6,
  px: 10,
  avatar: 34,
  avatarFont: "0.75rem",
  nameFont: "0.75rem",
  previewFont: "0.6875rem",
  timeFont: "0.625rem",
} as const;

const ROW_SIZING_DEFAULT = {
  py: 8,
  px: 12,
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
  const { t } = useTranslation("shared/chat");
  const [menuOpen, setMenuOpen] = useState(false);

  const row = compact ? ROW_SIZING_COMPACT : ROW_SIZING_DEFAULT;

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
  const handleDelete = useCallback(() => {
    if (onRequestDeleteConversation) onRequestDeleteConversation(conv._id);
    setMenuOpen(false);
  }, [onRequestDeleteConversation, conv._id]);

  // Mint active/hover backgrounds
  const activeBg = mintLightTeamUi
    ? "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)"
    : "#0D948812";
  const hoverBg = mintLightTeamUi ? "#DEEBEB" : "#0000000A";

  const nameColor = isActive ? (mintLightTeamUi ? "#065F46" : PRIMARY) : "#111827";
  const nameHoverColor = mintLightTeamUi ? "#065F46" : PRIMARY;
  const timeColor = isActive
    ? (mintLightTeamUi ? "#10B981" : PRIMARY)
    : hasUnread
      ? (mintLightTeamUi ? "#059669" : "#111827")
      : "#6B7280";
  const previewColor = previewDeleted || hasNoMessages
    ? (mintLightTeamUi ? "#D1D5DB" : "#00000061")
    : hasUnread
      ? (mintLightTeamUi ? "#374151" : "#111827")
      : "#6B7280";

  return (
    <li
      id={`chat-conv-item-${conv._id}`}
      className={cn("group flex items-stretch py-[2.4px]", mintLightTeamUi ? "px-2" : "px-1.5")}
    >
      <button
        type="button"
        onClick={handleRowClick}
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left",
          "hover:[background:var(--row-hover-bg)] hover:[border-color:var(--row-hover-border)] hover:[transform:var(--row-hover-transform)]",
        )}
        style={{
          paddingBlock: row.py,
          paddingInline: row.px,
          borderRadius: mintLightTeamUi ? "14px" : "10px",
          background: isActive ? activeBg : "transparent",
          border: `1px solid ${
            mintLightTeamUi
              ? (isActive ? "rgba(52, 211, 153, 0.4)" : "transparent")
              : (isActive ? "#0D948833" : "transparent")
          }`,
          boxShadow: isActive && mintLightTeamUi ? "0 2px 12px rgba(16, 185, 129, 0.12)" : "none",
          transition: `all 0.18s ${ease}`,
          ["--row-hover-bg" as string]: isActive ? activeBg : hoverBg,
          ["--row-hover-border" as string]: mintLightTeamUi ? "rgba(52,211,153,0.2)" : "#0D94881A",
          ["--row-hover-transform" as string]: isActive ? "none" : "translateX(2px)",
        }}
      >
        {/* Avatar with colored background */}
        <div className="relative shrink-0">
          <Avatar
            className="shrink-0 font-bold"
            style={{
              width: row.avatar,
              height: row.avatar,
              fontSize: row.avatarFont,
              backgroundColor: isActive ? (mintLightTeamUi ? "#10B981" : PRIMARY) : avatarColors.bg,
              color: isActive ? "#fff" : avatarColors.color,
              boxShadow: isActive
                ? (mintLightTeamUi ? "0 2px 10px rgba(16,185,129,0.4)" : `0 2px 8px ${PRIMARY}59`)
                : "0 1px 4px rgba(0,0,0,0.08)",
              transition: `all 0.18s ${ease}`,
              letterSpacing: "-0.01em",
            }}
          >
            <AvatarFallback className="font-bold" style={{ backgroundColor: "transparent", color: "inherit" }}>
              {initial}
            </AvatarFallback>
          </Avatar>
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5">
              <ChatUnreadBadge count={unreadN} size="sm" />
            </span>
          )}
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center justify-between">
            <p
              className={cn(
                "mr-1.5 min-w-0 flex-1 truncate transition-colors",
                !isActive && "group-hover:[color:var(--conv-name-hover-color)]",
              )}
              style={{
                fontSize: row.nameFont,
                fontWeight: hasUnread ? 700 : isActive ? 700 : 600,
                color: nameColor,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                ["--conv-name-hover-color" as string]: nameHoverColor,
              }}
            >
              {displayName}
            </p>
            <span
              className="shrink-0 whitespace-nowrap"
              style={{
                fontSize: row.timeFont,
                fontWeight: isActive || hasUnread ? 600 : 400,
                color: timeColor,
                letterSpacing: "0.01em",
              }}
            >
              {timeStr}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p
              className="min-w-0 flex-1 truncate"
              style={{
                fontSize: row.previewFont,
                fontWeight: hasUnread ? 600 : 400,
                fontStyle: previewDeleted || hasNoMessages ? "italic" : "normal",
                color: previewColor,
                lineHeight: 1.4,
              }}
            >
              {previewText}
            </p>
            {hasUnread && unreadN > 1 && (
              <span
                className="ml-1.5 shrink-0 rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: mintLightTeamUi ? "#10B981" : PRIMARY,
                  boxShadow: mintLightTeamUi ? "0 0 6px rgba(16,185,129,0.5)" : undefined,
                }}
              />
            )}
          </div>
        </div>
      </button>

      {/* Three-dot menu trigger — only visible on hover */}
      {showRowMenu && (
        <div
          className={cn(
            "flex shrink-0 items-center pr-1 transition-opacity duration-[180ms]",
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <ChatContextMenuTrigger
                visibility="always"
                menuOpen={menuOpen}
                aria-label={t("sidebar.conversation_menu_aria")}
                onClick={() => {}}
              >
                <MoreVert size={18} />
              </ChatContextMenuTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={chatContextMenuContentCn}>
              <DropdownMenuItem
                onClick={handleDelete}
                variant="destructive"
                className={cn(chatContextMenuItemCn, "font-semibold gap-2")}
              >
                <DeleteOutline size={18} />
                {t("sidebar.delete_conversation_menu")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </li>
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
  const showRowMenu = conversationMenuDelete && typeof onRequestDeleteConversation === "function";
  const me = currentUserId != null ? String(currentUserId) : "";

  const emptyListHint = viewerIsCompany
    ? t("sidebar.start_chatting")
    : t("sidebar.start_chatting_candidate");

  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-auto",
        "[scrollbar-width:thin] [scrollbar-color:#1118273D_transparent]",
        "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:[background-clip:content-box] [&::-webkit-scrollbar-thumb]:bg-[#1118271F]",
        "hover:[&::-webkit-scrollbar-thumb]:bg-[#11182738]",
      )}
      style={{ backgroundColor: mintLightTeamUi ? "#F8FAFC" : undefined }}
    >
      {conversations.length === 0 ? (
        <div id="chat-sidebar-empty-state" className="flex flex-col items-center gap-3 p-8 text-center">
          <div
            className="flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: mintLightTeamUi ? "16px" : "50%",
              backgroundColor: mintLightTeamUi ? "#ECFDF5" : "#0D94881F",
              border: mintLightTeamUi ? "1px solid rgba(52, 211, 153, 0.25)" : "1px solid #0D948833",
              boxShadow: mintLightTeamUi ? "0 4px 20px rgba(15, 23, 42, 0.05)" : undefined,
            }}
          >
            <ChatOutlined size={28} color={mintLightTeamUi ? "#10B981" : PRIMARY} />
          </div>
          <p className="text-[0.8125rem] font-bold" style={{ color: "#111827" }}>
            {t("sidebar.no_conversations")}
          </p>
          <p className="max-w-[240px] text-xs" style={{ color: "#6B7280" }}>
            {emptyListHint}
          </p>
        </div>
      ) : (
        <ul id="chat-conversations-list" className={compact ? "p-1 pt-1.5" : "p-1.5 pt-2"}>
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
        </ul>
      )}
    </div>
  );
});

export default ConversationSidebar;
