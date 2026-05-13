import type { Participant } from "@/components/features/chat/helpers";
import type { TeamChatParticipant, TeamConversation, TeamMessage } from "@/modules/team-chat/types";
import {
  normalizeId,
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
  return {
    _id: normalizeId(conversation._id),
    participants: other ? [other] : [],
    lastMessage: conversation.lastMessage
      ? {
          text: conversation.lastMessage.text,
          timestamp: conversation.lastMessage.timestamp,
        }
      : undefined,
    unreadCount: conversation.unreadCount || 0,
    updatedAt: conversation.updatedAt,
  };
};

export const toChatShellMessage = (message: TeamMessage): ChatShellMessage => ({
  _id: normalizeId(message._id),
  text: message.text,
  sender: { _id: normalizeId(message.senderId) },
  receiver: { _id: normalizeId(message.receiverId) },
  isRead: message.isRead,
  createdAt: message.createdAt,
  conversationId: normalizeId(message.conversationId),
});
