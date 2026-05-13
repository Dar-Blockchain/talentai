import {
  createNamespaceSocket,
  type ChatConversationRoomConfig,
} from "@/modules/shared/chat";

const candidateChatSocket = createNamespaceSocket({ namespacePath: "/chat" });

export const connectCandidateChatSocket = candidateChatSocket.connect;
export const getCandidateChatSocket = candidateChatSocket.getSocket;
export const disconnectCandidateChatSocket = candidateChatSocket.disconnect;

export const candidateChatRoomConfig: ChatConversationRoomConfig = {
  joinEvent: "join_conversation",
  leaveEvent: "leave_conversation",
  buildJoinPayload: (conversationId) => ({ conversationId }),
  buildLeavePayload: (conversationId) => conversationId,
};

export const joinCandidateConversationRoom = (conversationId: string) => {
  candidateChatSocket.joinConversationRoom(conversationId, candidateChatRoomConfig);
};

export const leaveCandidateConversationRoom = (conversationId: string) => {
  candidateChatSocket.leaveConversationRoom(conversationId, candidateChatRoomConfig);
};
