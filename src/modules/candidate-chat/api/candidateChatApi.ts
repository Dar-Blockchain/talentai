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

// Note: cache-control headers are intentionally NOT sent from the client.
// They would trigger a CORS preflight that fails unless the server explicitly
// allows them via Access-Control-Allow-Headers. The chat namespace already
// disables ETag + sets `Cache-Control: no-store` server-side, so freshness
// is guaranteed without any client-side hint.

function extractList<T>(res: { data?: { data?: unknown; success?: boolean } }): T[] {
  const raw = res.data?.data;
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { messages?: unknown }).messages)) {
    return (raw as { messages: T[] }).messages;
  }
  return [];
}

export const candidateChatApi = {
  fetchConversations: async (params?: CandidateChatConversationsParams) => {
    const res = await axiosInstance.get("chat/conversations", { params });
    return extractList<CandidateConversation>(res);
  },

  fetchConversation: async (conversationId: string) => {
    const res = await axiosInstance.get(`chat/conversations/${conversationId}`);
    return res.data.data as CandidateConversation;
  },

  fetchMessages: async (conversationId: string, params?: CandidateChatMessagesParams) => {
    const res = await axiosInstance.get(`chat/messages/${conversationId}`, { params });
    return extractList<CandidateMessage>(res);
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

  deleteMessage: async (messageId: string, scope?: "me" | "everyone") => {
    await axiosInstance.delete(`chat/messages/${messageId}`, {
      params: scope ? { scope } : {},
    });
  },

  deleteConversation: async (conversationId: string) => {
    await axiosInstance.delete(`chat/conversations/${conversationId}`);
    return conversationId;
  },
};

export { getApiErrorMessage as getCandidateChatErrorMessage };
