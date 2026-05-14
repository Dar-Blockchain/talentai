import type {
  CandidateChatConversationsParams,
  CandidateChatMessagesParams,
} from "@/modules/candidate-chat/types";

export const candidateChatKeys = {
  all: ["candidate-chat"] as const,
  conversations: (params?: CandidateChatConversationsParams) =>
    [...candidateChatKeys.all, "conversations", params ?? {}] as const,
  conversation: (conversationId: string) =>
    [...candidateChatKeys.all, "conversation", conversationId] as const,
  messages: (conversationId: string, params?: CandidateChatMessagesParams) =>
    [...candidateChatKeys.all, "messages", conversationId, params ?? {}] as const,
  unreadCount: () => [...candidateChatKeys.all, "unread-count"] as const,
};
