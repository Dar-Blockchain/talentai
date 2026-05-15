import type { ChatShellMessage } from "@/modules/shared/chat/types/shell";
import type { ChatUnreadModule } from "@/modules/shared/chat/unread/paths";
import { isViewerInActiveConversation } from "@/modules/shared/chat/unread/paths";

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
