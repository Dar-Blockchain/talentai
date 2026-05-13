import type { Participant } from "@/components/features/chat/helpers";
import type {
  CandidateChatParticipant,
  CandidateConversation,
  CandidateMessage,
} from "@/modules/candidate-chat/types";
import {
  normalizeId,
  type ChatShellConversation,
  type ChatShellMessage,
} from "@/modules/shared/chat";

export type { ChatShellConversation, ChatShellMessage };

export const toParticipant = (user?: CandidateChatParticipant): Participant | undefined => {
  if (!user?._id) return undefined;

  const firstName = user.profile?.firstName || user.firstName;
  const lastName = user.profile?.lastName || user.lastName;

  return {
    _id: normalizeId(user._id),
    firstName,
    lastName,
    email: user.email || "",
    profile: user.profile,
  };
};

export const toChatShellConversation = (conversation: CandidateConversation): ChatShellConversation => ({
  _id: normalizeId(conversation._id),
  participants: (conversation.participants || [])
    .map(toParticipant)
    .filter((participant): participant is Participant => !!participant),
  lastMessage: conversation.lastMessage
    ? {
        text: conversation.lastMessage.text,
        timestamp: conversation.lastMessage.timestamp,
      }
    : undefined,
  unreadCount: conversation.unreadCount || 0,
  updatedAt: conversation.updatedAt,
});

export const toChatShellMessage = (message: CandidateMessage): ChatShellMessage => ({
  _id: normalizeId(message._id),
  text: message.text,
  sender: { _id: normalizeId(message.sender?._id) },
  receiver: { _id: normalizeId(message.receiver?._id) },
  isRead: message.isRead,
  createdAt: message.createdAt,
  conversationId: normalizeId(message.conversationId || message.conversation),
});
