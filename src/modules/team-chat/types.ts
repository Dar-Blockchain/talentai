export interface TeamChatParticipant {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
  avatar?: string | null;
  companyName?: string | null;
  username?: string | null;
  displayName?: string | null;
}

export interface TeamConversation {
  _id: string;
  companyId: string;
  participants: string[];
  otherParticipant?: TeamChatParticipant;
  lastMessage?: {
    text: string;
    senderId?: string;
    timestamp: string;
  } | null;
  unreadCount: number;
  status: string;
  updatedAt: string;
}

export interface TeamMessage {
  _id: string;
  conversationId: string;
  companyId?: string;
  senderId: string;
  receiverId: string;
  text: string;
  type?: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface TeamChatConversationsParams {
  page?: number;
  limit?: number;
}

export interface TeamChatMessagesParams {
  page?: number;
  limit?: number;
}

export interface SendTeamMessagePayload {
  conversationId: string;
  receiverId: string;
  text: string;
}

export interface TeamChatSocketMessagePayload {
  message: TeamMessage;
  conversationId: string;
}
