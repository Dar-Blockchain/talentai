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
  // Tracks which rooms this client has requested to join.
  // Used to re-join automatically on reconnect so no messages are missed.
  let pendingRooms: Map<string, ChatConversationRoomConfig> = new Map();

  const getSocketUrl = () =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}${namespacePath}`;

  const drainPendingRooms = () => {
    if (!socket?.connected) return;
    for (const [conversationId, roomConfig] of pendingRooms) {
      socket.emit(roomConfig.joinEvent, roomConfig.buildJoinPayload(conversationId));
    }
  };

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

    // On every successful connect (initial + reconnects), re-join all requested rooms.
    // This ensures no join is silently lost when the socket was still connecting
    // at the time joinConversationRoom was called.
    socket.on("connect", drainPendingRooms);

    return socket;
  };

  const getSocket = () => socket;

  const disconnect = () => {
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectedUserId = null;
    pendingRooms = new Map();
  };

  const joinConversationRoom = (
    conversationId: string,
    roomConfig: ChatConversationRoomConfig,
  ) => {
    if (!conversationId) return;
    // Always register in pendingRooms first so reconnects re-join automatically.
    pendingRooms.set(conversationId, roomConfig);
    // If already connected, emit immediately; otherwise drainPendingRooms fires on "connect".
    if (socket?.connected) {
      socket.emit(roomConfig.joinEvent, roomConfig.buildJoinPayload(conversationId));
    }
  };

  const leaveConversationRoom = (
    conversationId: string,
    roomConfig: ChatConversationRoomConfig,
  ) => {
    if (!conversationId) return;
    pendingRooms.delete(conversationId);
    if (!socket?.connected) return;
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
