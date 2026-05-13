import axiosInstance from "@/utils/axiosInstance";
import { getApiErrorMessage } from "@/modules/shared/chat";
import type {
  CandidateChatConversationsParams,
  CandidateChatMessagesParams,
  CandidateConversation,
  CandidateMessage,
  CreateCandidateConversationPayload,
  SendCandidateMessagePayload,
} from "@/modules/candidate-chat/types";

export const candidateChatApi = {
  fetchConversations: async (params?: CandidateChatConversationsParams) => {
    const res = await axiosInstance.get("chat/conversations", { params });
    return res.data.data as CandidateConversation[];
  },

  fetchConversation: async (conversationId: string) => {
    const res = await axiosInstance.get(`chat/conversations/${conversationId}`);
    return res.data.data as CandidateConversation;
  },

  fetchMessages: async (conversationId: string, params?: CandidateChatMessagesParams) => {
    const res = await axiosInstance.get(`chat/messages/${conversationId}`, { params });
    return res.data.data as CandidateMessage[];
  },

  sendMessage: async (payload: SendCandidateMessagePayload) => {
    const res = await axiosInstance.post("chat/messages", payload);
    return (res.data.data || res.data) as CandidateMessage;
  },

  markConversationRead: async (conversationId: string) => {
    await axiosInstance.put(`chat/conversations/${conversationId}/read`);
    return conversationId;
  },

  fetchUnreadCount: async () => {
    const res = await axiosInstance.get("chat/conversations/unread-count");
    return (res.data.data?.totalUnread ?? res.data.totalUnread ?? 0) as number;
  },

  createOrFindConversation: async (payload: CreateCandidateConversationPayload) => {
    const res = await axiosInstance.post("chat/conversations", payload);
    const data = res.data;
    if (data.success && data.data?._id) return data.data as CandidateConversation;
    throw new Error("Failed to create conversation");
  },

  deleteMessage: async (messageId: string) => {
    await axiosInstance.delete(`chat/messages/${messageId}`);
    return messageId;
  },

  deleteConversation: async (conversationId: string) => {
    await axiosInstance.delete(`chat/conversations/${conversationId}`);
    return conversationId;
  },
};

export { getApiErrorMessage as getCandidateChatErrorMessage };
