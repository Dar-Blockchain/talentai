import type { ChatShellConversation } from "@/modules/shared/chat/types/shell";
import { normalizeConversationUnreadCount } from "@/modules/shared/chat/utils/normalizeConversationUnread";

export const sumConversationUnread = (
  conversations: ChatShellConversation[],
  viewerUserId?: string | null,
) =>
  conversations.reduce(
    (total, conversation) =>
      total + normalizeConversationUnreadCount(conversation.unreadCount, viewerUserId),
    0,
  );
