import type { Participant } from "@/modules/chat/shared/components/helpers";
import type {
  CandidateChatParticipant,
  CandidateConversation,
  CandidateMessage,
} from "@/modules/chat/candidate-chat/types";
// Direct file imports (not the `@/modules/chat/shared` barrel) — this mapper
// is used by `candidateChatSlice.ts`, which the root reducer loads eagerly; a
// barrel import here would pull the chat UI shells + socket client into `_app`.
import { normalizeId } from "@/modules/chat/shared/utils/normalizeId";
import { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";
import {
  CHAT_LAST_MESSAGE_DELETED_SENTINEL,
  CHAT_LAST_MESSAGE_BLOCKED_PREVIEW,
  CHAT_MESSAGE_BODY_TOMBSTONE,
} from "@/modules/chat/shared/constants/contactPolicy";
import type { ChatShellConversation, ChatShellMessage } from "@/modules/chat/shared/types/shell";

export type { ChatShellConversation, ChatShellMessage };

type ParticipantInput = CandidateChatParticipant | string | { _id?: unknown };

export const toParticipant = (user?: ParticipantInput): Participant | undefined => {
  if (user == null) return undefined;

  if (typeof user === "string") {
    const _id = normalizeId(user);
    if (!_id) return undefined;
    return { _id, firstName: "", lastName: "", email: "", profile: undefined };
  }

  const rawId = (user as CandidateChatParticipant)._id;
  if (!rawId) return undefined;

  const u = user as CandidateChatParticipant;
  const firstName = u.profile?.firstName || u.firstName;
  const lastName = u.profile?.lastName || u.lastName;

  return {
    _id: normalizeId(rawId),
    firstName,
    lastName,
    email: u.email || "",
    profile: u.profile,
  };
};

export const toChatShellConversation = (
  conversation: CandidateConversation,
  viewerUserId?: string | null,
): ChatShellConversation => {
  const lm = conversation.lastMessage;
  if (!lm) {
    return {
      _id: normalizeId(conversation._id),
      participants: (conversation.participants || [])
        .map(toParticipant)
        .filter((participant): participant is Participant => !!participant),
      unreadCount: normalizeConversationUnreadCount(conversation.unreadCount, viewerUserId),
      updatedAt: conversation.updatedAt,
    };
  }
  const rawText = lm.text ?? "";
  const fromSentinel = rawText === CHAT_LAST_MESSAGE_DELETED_SENTINEL;
  const deleted = !!lm.isDeletedForEveryone || fromSentinel;
  const senderId =
    lm.senderId
    || (typeof lm.sender === "string" ? lm.sender : lm.sender?._id)
    || undefined;

  if (!!lm.deliveryBlocked || rawText === CHAT_LAST_MESSAGE_BLOCKED_PREVIEW) {
    return {
      _id: normalizeId(conversation._id),
      participants: (conversation.participants || [])
        .map(toParticipant)
        .filter((participant): participant is Participant => !!participant),
      unreadCount: normalizeConversationUnreadCount(conversation.unreadCount, viewerUserId),
      updatedAt: conversation.updatedAt,
    };
  }

  return {
    _id: normalizeId(conversation._id),
    participants: (conversation.participants || [])
      .map(toParticipant)
      .filter((participant): participant is Participant => !!participant),
    lastMessage: {
      text: deleted ? "" : rawText,
      timestamp: lm.timestamp,
      isDeletedForEveryone: deleted,
      ...(senderId ? { senderId: normalizeId(senderId) } : {}),
    },
    unreadCount: normalizeConversationUnreadCount(conversation.unreadCount, viewerUserId),
    updatedAt: conversation.updatedAt,
  };
};

export const toChatShellMessage = (message: CandidateMessage): ChatShellMessage => {
  const rawText = String(message.text ?? "");
  const explicit = !!message.isDeletedForEveryone;
  const isBodyTombstone = rawText === CHAT_MESSAGE_BODY_TOMBSTONE;
  /**
   * Some legacy / socket payloads omit the explicit flag but set deletedAt and
   * empty text after a delete-for-everyone. Treat that combo as the tombstone too.
   */
  const inferredEveryone =
    !explicit
    && !isBodyTombstone
    && rawText.trim() === ""
    && (!!message.deletedAt || !!message.deletedForEveryoneBy);
  const softDeletedEveryone = explicit || isBodyTombstone || inferredEveryone;

  return {
    _id: normalizeId(message._id),
    text: softDeletedEveryone ? "" : rawText,
    // Lean JSON often has sender/receiver as plain ObjectId strings, not { _id }.
    sender: { _id: normalizeId(message.sender as unknown) },
    receiver: { _id: normalizeId(message.receiver as unknown) },
    isRead: message.isRead,
    createdAt: message.createdAt,
    conversationId: normalizeId(message.conversationId || message.conversation),
    isDeletedForEveryone: softDeletedEveryone,
    deletedAt: message.deletedAt ?? null,
    deletedForEveryoneBy: message.deletedForEveryoneBy
      ? normalizeId(message.deletedForEveryoneBy)
      : undefined,
    ...(message.deliveryBlocked
      ? {
          deliveryBlocked: true,
          ...(message.blockedReason ? { blockedReason: message.blockedReason } : {}),
        }
      : {}),
  };
};
