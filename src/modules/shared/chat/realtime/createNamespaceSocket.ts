import { io, Socket } from "socket.io-client";

const getAuthToken = () =>
  localStorage.getItem("api_token") || localStorage.getItem("token") || "";

export interface ChatNamespaceSocketConfig {
  namespacePath: string;
}

export interface ChatConversationRoomConfig {
  joinEvent: string;
  leaveEvent: string;
  buildJoinPayload: (conversationId: string) => unknown;
  buildLeavePayload?: (conversationId: string) => unknown;
}

export const createNamespaceSocket = ({ namespacePath }: ChatNamespaceSocketConfig) => {
  let socket: Socket | null = null;
  let connectedUserId: string | null = null;

  const getSocketUrl = () =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}${namespacePath}`;

  const connect = (userId: string) => {
    const token = getAuthToken();
    if (!userId || !token) return null;

    if (socket && connectedUserId === userId) {
      if (!socket.connected) socket.connect();
      return socket;
    }

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    socket = io(getSocketUrl(), {
      auth: { userId, token },
      transports: ["websocket", "polling"],
    });
    connectedUserId = userId;
    return socket;
  };

  const getSocket = () => socket;

  const disconnect = () => {
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectedUserId = null;
  };

  const joinConversationRoom = (
    conversationId: string,
    roomConfig: ChatConversationRoomConfig,
  ) => {
    if (!conversationId || !socket?.connected) return;
    socket.emit(roomConfig.joinEvent, roomConfig.buildJoinPayload(conversationId));
  };

  const leaveConversationRoom = (
    conversationId: string,
    roomConfig: ChatConversationRoomConfig,
  ) => {
    if (!conversationId || !socket?.connected) return;
    const payload = roomConfig.buildLeavePayload
      ? roomConfig.buildLeavePayload(conversationId)
      : roomConfig.buildJoinPayload(conversationId);
    socket.emit(roomConfig.leaveEvent, payload);
  };

  return {
    connect,
    getSocket,
    disconnect,
    joinConversationRoom,
    leaveConversationRoom,
  };
};
