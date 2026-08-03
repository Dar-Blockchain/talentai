import axiosInstance from "@/utils/axiosInstance";
import { getApiErrorMessage } from "@/modules/chat/shared";
import type {
  SendTeamMessagePayload,
  TeamChatConversationsParams,
  TeamChatMessagesParams,
  TeamConversation,
  TeamMessage,
} from "@/modules/chat/team-chat/types";

export const teamChatApi = {
  openConversation: async (targetUserId: string) => {
    const res = await axiosInstance.post("chat/team/requests", { targetUserId });
    return res.data.data as TeamConversation;
  },

  fetchConversations: async (params?: TeamChatConversationsParams) => {
    const res = await axiosInstance.get("chat/team/conversations", { params });
    return res.data.data as TeamConversation[];
  },

  fetchConversation: async (conversationId: string) => {
    const res = await axiosInstance.get(`chat/team/conversations/${conversationId}`);
    return res.data.data as TeamConversation;
  },

  fetchMessages: async (conversationId: string, params?: TeamChatMessagesParams) => {
    const res = await axiosInstance.get(`chat/team/messages/${conversationId}`, { params });
    return res.data.data as TeamMessage[];
  },

  sendMessage: async (payload: SendTeamMessagePayload) => {
    const res = await axiosInstance.post("chat/team/messages", payload);
    return res.data.data as TeamMessage;
  },

  markConversationRead: async (conversationId: string) => {
    await axiosInstance.put(`chat/team/conversations/${conversationId}/read`);
    return conversationId;
  },

  fetchUnreadCount: async () => {
    const res = await axiosInstance.get("chat/team/unread-count");
    return res.data.data.totalUnread as number;
  },

  deleteMessage: async (messageId: string, scope: "me" | "everyone" = "me") => {
    const res = await axiosInstance.delete(`chat/team/messages/${messageId}`, {
      params: { scope },
    });
    return res.data.data as {
      messageId: string;
      conversationId: string;
      scope: "me" | "everyone";
      message?: TeamMessage;
    };
  },

  deleteConversation: async (conversationId: string) => {
    await axiosInstance.post(
      `chat/team/conversations/${conversationId}/hide-for-me`,
    );
    return conversationId;
  },
};

export { getApiErrorMessage as getTeamChatErrorMessage };
