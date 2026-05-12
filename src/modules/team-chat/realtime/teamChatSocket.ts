import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let connectedUserId: string | null = null;

const getTeamChatSocketUrl = () =>
  `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}/team-chat`;

const getAuthToken = () =>
  localStorage.getItem("api_token") || localStorage.getItem("token") || "";

export const connectTeamChatSocket = (userId: string) => {
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

  socket = io(getTeamChatSocketUrl(), {
    auth: { userId, token },
    transports: ["websocket", "polling"],
  });
  connectedUserId = userId;
  return socket;
};

export const getTeamChatSocket = () => socket;

export const disconnectTeamChatSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  connectedUserId = null;
};

export const joinTeamConversationRoom = (conversationId: string) => {
  if (!conversationId || !socket?.connected) return;
  socket.emit("join_team_conversation", { conversationId });
};

export const leaveTeamConversationRoom = (conversationId: string) => {
  if (!conversationId || !socket?.connected) return;
  socket.emit("leave_team_conversation", { conversationId });
};
