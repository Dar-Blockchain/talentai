import type { ChatShellConversation } from "@/modules/chat/shared/types/shell";
import { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";

export const sumConversationUnread = (
  conversations: ChatShellConversation[],
  viewerUserId?: string | null,
) =>
  conversations.reduce(
    (total, conversation) =>
      total + normalizeConversationUnreadCount(conversation.unreadCount, viewerUserId),
    0,
  );
