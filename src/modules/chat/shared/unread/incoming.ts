import type { ChatShellMessage } from "@/modules/chat/shared/types/shell";
import type { ChatUnreadModule } from "@/modules/chat/shared/unread/paths";
import { isViewerInActiveConversation } from "@/modules/chat/shared/unread/paths";

export interface ChatIncomingMessageContext {
  module: ChatUnreadModule;
  pathname: string;
  role?: string | null;
  openConversationId: string | null;
  currentUserId: string;
  message: ChatShellMessage;
  conversationId: string;
}

export const getIncomingMessageFlags = ({
  module,
  pathname,
  role,
  openConversationId,
  currentUserId,
  message,
  conversationId,
}: ChatIncomingMessageContext) => {
  const senderId = String(message.sender._id);
  const isIncoming = senderId !== String(currentUserId);
  const viewerIsViewingConversation = isViewerInActiveConversation(
    pathname,
    module,
    conversationId,
    openConversationId,
    role,
  );

  return {
    isIncoming,
    viewerIsViewingConversation,
    shouldNotify: isIncoming && !viewerIsViewingConversation,
  };
};
