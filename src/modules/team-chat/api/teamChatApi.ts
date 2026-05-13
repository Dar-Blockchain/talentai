import axiosInstance from "@/utils/axiosInstance";
import { getApiErrorMessage } from "@/modules/shared/chat";
import type {
  SendTeamMessagePayload,
  TeamChatConversationsParams,
  TeamChatMessagesParams,
  TeamConversation,
  TeamMessage,
} from "@/modules/team-chat/types";

export const teamChatApi = {
  openConversation: async (targetUserId: string) => {
    const res = await axiosInstance.post("team-chat/requests", { targetUserId });
    return res.data.data as TeamConversation;
  },

  fetchConversations: async (params?: TeamChatConversationsParams) => {
    const res = await axiosInstance.get("team-chat/conversations", { params });
    return res.data.data as TeamConversation[];
  },

  fetchConversation: async (conversationId: string) => {
    const res = await axiosInstance.get(`team-chat/conversations/${conversationId}`);
    return res.data.data as TeamConversation;
  },

  fetchMessages: async (conversationId: string, params?: TeamChatMessagesParams) => {
    const res = await axiosInstance.get(`team-chat/messages/${conversationId}`, { params });
    return res.data.data as TeamMessage[];
  },

  sendMessage: async (payload: SendTeamMessagePayload) => {
    const res = await axiosInstance.post("team-chat/messages", payload);
    return res.data.data as TeamMessage;
  },

  markConversationRead: async (conversationId: string) => {
    await axiosInstance.put(`team-chat/conversations/${conversationId}/read`);
    return conversationId;
  },

  fetchUnreadCount: async () => {
    const res = await axiosInstance.get("team-chat/unread-count");
    return res.data.data.totalUnread as number;
  },
};

export { getApiErrorMessage as getTeamChatErrorMessage };
