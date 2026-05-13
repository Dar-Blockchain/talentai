import type { ChatShellConversation } from "@/modules/shared/chat/types/shell";

export const sumConversationUnread = (conversations: ChatShellConversation[]) =>
  conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0);
