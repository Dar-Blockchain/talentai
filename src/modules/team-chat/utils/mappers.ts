import type { Participant } from "@/modules/shared/chat/components/helpers";
import type { TeamChatParticipant, TeamConversation, TeamMessage } from "@/modules/team-chat/types";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL, TEAM_MESSAGE_BODY_TOMBSTONE } from "@/modules/team-chat/constants/lastMessagePreview";
import {
  normalizeId,
  CHAT_LAST_MESSAGE_BLOCKED_PREVIEW,
  type ChatShellConversation,
  type ChatShellMessage,
} from "@/modules/shared/chat";

export type { ChatShellConversation, ChatShellMessage };

export const toParticipant = (user?: TeamChatParticipant): Participant | undefined => {
  if (!user?._id) return undefined;

  const firstName = user.firstName || undefined;
  const lastName = user.lastName || undefined;
  const displayName = user.displayName?.trim()
    || user.companyName?.trim()
    || `${firstName || ""} ${lastName || ""}`.trim()
    || user.username?.trim()
    || undefined;

  const participant: Participant = {
    _id: user._id,
    firstName,
    lastName,
    displayName,
    email: "",
  };

  participant.profile = {
    firstName,
    lastName,
    type: user.role === "Company" ? "Company" : undefined,
    companyDetails: user.companyName ? { name: user.companyName } : undefined,
  };

  return participant;
};

export const toChatShellConversation = (conversation: TeamConversation): ChatShellConversation => {
  const other = toParticipant(conversation.otherParticipant);
  const lm = conversation.lastMessage;
  if (!lm) {
    return {
      _id: normalizeId(conversation._id),
      participants: other ? [other] : [],
      unreadCount: conversation.unreadCount || 0,
      updatedAt: conversation.updatedAt,
    };
  }
  const rawText = lm.text ?? "";
  const fromSentinel = rawText === TEAM_LAST_MESSAGE_DELETED_SENTINEL;
  const deleted = !!lm.isDeletedForEveryone || fromSentinel;

  if (rawText === CHAT_LAST_MESSAGE_BLOCKED_PREVIEW) {
    return {
      _id: normalizeId(conversation._id),
      participants: other ? [other] : [],
      unreadCount: conversation.unreadCount || 0,
      updatedAt: conversation.updatedAt,
    };
  }

  return {
    _id: normalizeId(conversation._id),
    participants: other ? [other] : [],
    lastMessage: {
      text: deleted ? "" : rawText,
      timestamp: lm.timestamp,
      isDeletedForEveryone: deleted,
      ...(lm.senderId ? { senderId: normalizeId(lm.senderId) } : {}),
    },
    unreadCount: conversation.unreadCount || 0,
    updatedAt: conversation.updatedAt,
  };
};

export const toChatShellMessage = (message: TeamMessage): ChatShellMessage => {
  const cid = normalizeId(message.conversationId);
  const rawText = String(message.text ?? "");
  const explicit = !!message.isDeletedForEveryone;
  const isBodyTombstone = rawText === TEAM_MESSAGE_BODY_TOMBSTONE;
  /** Some API/socket payloads omit the flag but set deletedAt + empty text after delete-for-everyone. */
  const inferredEveryone =
    !explicit
    && !isBodyTombstone
    && rawText.trim() === ""
    && (!!message.deletedAt || !!message.deletedForEveryoneBy);
  const softDeletedEveryone = explicit || isBodyTombstone || inferredEveryone;
  const blocked = !!message.deliveryBlocked;
  return {
    _id: normalizeId(message._id),
    text: softDeletedEveryone ? "" : rawText,
    sender: { _id: normalizeId(message.senderId) },
    receiver: { _id: normalizeId(message.receiverId) },
    isRead: message.isRead,
    createdAt: message.createdAt,
    conversationId: cid,
    isDeletedForEveryone: softDeletedEveryone,
    deletedAt: message.deletedAt ?? null,
    deletedForEveryoneBy: message.deletedForEveryoneBy
      ? normalizeId(message.deletedForEveryoneBy)
      : undefined,
    ...(blocked
      ? {
          deliveryBlocked: true,
          ...(message.blockedReason ? { blockedReason: message.blockedReason } : {}),
        }
      : {}),
  };
};
