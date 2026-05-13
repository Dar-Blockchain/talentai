export interface ChatShellConversation {
  _id: string;
  participants: import("@/components/features/chat/helpers").Participant[];
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface ChatShellMessage {
  _id: string;
  text: string;
  sender: { _id: string };
  receiver: { _id: string };
  isRead: boolean;
  createdAt: string;
  conversationId?: string;
}

export interface ChatShellMessagePayload<TMessage = ChatShellMessage> {
  message: TMessage;
  viewerUserId: string;
}
