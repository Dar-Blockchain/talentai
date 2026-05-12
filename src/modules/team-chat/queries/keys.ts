import type { TeamChatConversationsParams, TeamChatMessagesParams } from "@/modules/team-chat/types";

export const teamChatKeys = {
  all: ["team-chat"] as const,
  conversations: (params?: TeamChatConversationsParams) =>
    [...teamChatKeys.all, "conversations", params ?? {}] as const,
  conversation: (conversationId: string) =>
    [...teamChatKeys.all, "conversation", conversationId] as const,
  messages: (conversationId: string, params?: TeamChatMessagesParams) =>
    [...teamChatKeys.all, "messages", conversationId, params ?? {}] as const,
  unreadCount: () => [...teamChatKeys.all, "unread-count"] as const,
};
