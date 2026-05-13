import {
  createNamespaceSocket,
  type ChatConversationRoomConfig,
} from "@/modules/shared/chat";

const teamChatSocket = createNamespaceSocket({ namespacePath: "/team-chat" });

export const connectTeamChatSocket = teamChatSocket.connect;
export const getTeamChatSocket = teamChatSocket.getSocket;
export const disconnectTeamChatSocket = teamChatSocket.disconnect;

export const teamChatRoomConfig: ChatConversationRoomConfig = {
  joinEvent: "join_team_conversation",
  leaveEvent: "leave_team_conversation",
  buildJoinPayload: (conversationId) => ({ conversationId }),
  buildLeavePayload: (conversationId) => ({ conversationId }),
};

export const joinTeamConversationRoom = (conversationId: string) => {
  teamChatSocket.joinConversationRoom(conversationId, teamChatRoomConfig);
};

export const leaveTeamConversationRoom = (conversationId: string) => {
  teamChatSocket.leaveConversationRoom(conversationId, teamChatRoomConfig);
};
