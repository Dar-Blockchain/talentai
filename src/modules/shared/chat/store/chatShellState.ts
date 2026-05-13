import type { ChatShellConversation, ChatShellMessage } from "@/modules/shared/chat/types/shell";

export const dedupeMessages = (messages: ChatShellMessage[]) => {
  const seen = new Set<string>();
  return messages.filter((message) => {
    const id = String(message._id);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const sortConversationsByRecent = (conversations: ChatShellConversation[]) => {
  conversations.sort((a, b) => {
    const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt).getTime();
    const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt).getTime();
    return bTime - aTime;
  });
};

interface ChatShellState {
  conversations: ChatShellConversation[];
  currentConversation: ChatShellConversation | null;
  messages: ChatShellMessage[];
  totalUnread: number;
}

export const applyIncomingMessage = (
  state: ChatShellState,
  message: ChatShellMessage,
  viewerUserId?: string,
  viewerIsViewingConversation?: boolean,
) => {
  const msgId = String(message._id);
  const convId = String(message.conversationId || "");
  const isActiveConversation = typeof viewerIsViewingConversation === "boolean"
    ? viewerIsViewingConversation
    : String(state.currentConversation?._id || "") === convId;
  const isIncoming = viewerUserId
    ? String(message.sender._id) !== String(viewerUserId)
    : false;

  if (isActiveConversation && msgId && !state.messages.some((item) => String(item._id) === msgId)) {
    state.messages.push(message);
  }

  const conversation = state.conversations.find((item) => String(item._id) === convId);
  if (conversation) {
    conversation.lastMessage = { text: message.text, timestamp: message.createdAt };
    conversation.updatedAt = message.createdAt;
    if (isIncoming && !isActiveConversation) {
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }
  }

  if (isIncoming && !isActiveConversation) {
    state.totalUnread += 1;
  }

  sortConversationsByRecent(state.conversations);
};
