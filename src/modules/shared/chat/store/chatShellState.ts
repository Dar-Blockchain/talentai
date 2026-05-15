import type { ChatShellConversation, ChatShellMessage } from "@/modules/shared/chat/types/shell";
import type { Participant } from "@/components/features/chat/helpers";
import { CHAT_LAST_MESSAGE_BLOCKED_PREVIEW } from "@/modules/shared/chat/constants/contactPolicy";
import { normalizeConversationUnreadCount } from "@/modules/shared/chat/utils/normalizeConversationUnread";

const minimalParticipant = (_id: string): Participant => ({
  _id,
  firstName: "",
  lastName: "",
  email: "",
});

export const dedupeMessages = (messages: ChatShellMessage[]) => {
  const seen = new Set<string>();
  return messages.filter((message) => {
    const id = String(message._id);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const sortTime = (c: ChatShellConversation) => {
  const raw = c.lastMessage?.timestamp ?? c.updatedAt;
  const t = new Date(raw as string | number | Date).getTime();
  return Number.isFinite(t) ? t : 0;
};

export const sortConversationsByRecent = (conversations: ChatShellConversation[]) => {
  conversations.sort((a, b) => sortTime(b) - sortTime(a));
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
  const storeMatchesOpenThread = String(state.currentConversation?._id || "") === convId;
  const pathSaysViewingThread = viewerIsViewingConversation === true;
  const isActiveConversation = storeMatchesOpenThread || pathSaysViewingThread;
  const isIncoming = viewerUserId
    ? String(message.sender._id) !== String(viewerUserId)
    : false;

  let conversation = state.conversations.find((item) => String(item._id) === convId);
  if (!conversation && convId && viewerUserId) {
    const vid = String(viewerUserId);
    const sid = String(message.sender?._id ?? "");
    const rid = String(message.receiver?._id ?? "");
    const otherId = sid && rid ? (sid === vid ? rid : sid) : "";
    if (otherId) {
      conversation = {
        _id: convId,
        participants: [minimalParticipant(vid), minimalParticipant(otherId)],
        unreadCount: 0,
        updatedAt: message.createdAt || new Date().toISOString(),
      };
      state.conversations.unshift(conversation);
    }
  }

  if (isActiveConversation && msgId && !state.messages.some((item) => String(item._id) === msgId)) {
    state.messages.push(message);
  }

  if (conversation) {
    const deletedForEveryone = !!message.isDeletedForEveryone;
    const blocked = !!message.deliveryBlocked;
    if (!blocked) {
      conversation.lastMessage = {
        text: deletedForEveryone ? "" : message.text,
        timestamp: message.createdAt,
        isDeletedForEveryone: deletedForEveryone,
      };
    }
    conversation.updatedAt = message.createdAt;
    if (isIncoming && !isActiveConversation && !blocked) {
      const prev = normalizeConversationUnreadCount(conversation.unreadCount, viewerUserId);
      conversation.unreadCount = prev + 1;
    }
  }

  if (isIncoming && !isActiveConversation && !message.deliveryBlocked) {
    state.totalUnread += 1;
  }

  sortConversationsByRecent(state.conversations);
};
