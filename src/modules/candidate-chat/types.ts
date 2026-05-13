export interface CandidateChatParticipant {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profile?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    type?: "Candidate" | "Company";
    companyDetails?: {
      name?: string;
    };
  };
}

export interface CandidateConversation {
  _id: string;
  participants: CandidateChatParticipant[];
  candidateId?: string;
  companyId?: string;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface CandidateMessage {
  _id: string;
  text: string;
  sender: {
    _id: string;
    email?: string;
    profile?: CandidateChatParticipant["profile"];
  };
  receiver: {
    _id: string;
    email?: string;
    profile?: CandidateChatParticipant["profile"];
  };
  isRead: boolean;
  createdAt: string;
  conversationId?: string;
  conversation?: string;
}

export interface CandidateChatConversationsParams {
  page?: number;
  limit?: number;
}

export interface CandidateChatMessagesParams {
  page?: number;
  limit?: number;
}

export interface SendCandidateMessagePayload {
  conversationId: string;
  receiverId: string;
  text: string;
}

export interface CreateCandidateConversationPayload {
  candidateId: string;
  companyId: string;
}
