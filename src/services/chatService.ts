import axiosInstance from '@/utils/axiosInstance';

export const chatService = {
  fetchConversations: async (params?: { limit?: number }) => {
    const res = await axiosInstance.get('chat/conversations', {
      params: params?.limit ? { limit: params.limit } : {},
    });
    return res.data.data;
  },

  fetchConversation: async (conversationId: string) => {
    const res = await axiosInstance.get(`chat/conversations/${conversationId}`);
    return res.data.data;
  },

  fetchMessages: async (conversationId: string) => {
    const res = await axiosInstance.get(`chat/messages/${conversationId}`);
    return res.data.data;
  },

  sendMessage: async (payload: { conversationId: string; receiverId: string; text: string }) => {
    const res = await axiosInstance.post('chat/messages', payload);
    return res.data.data || res.data;
  },

  markConversationRead: async (conversationId: string) => {
    await axiosInstance.put(`chat/conversations/${conversationId}/read`);
    return conversationId;
  },

  deleteMessage: async (messageId: string) => {
    await axiosInstance.delete(`chat/messages/${messageId}`);
    return messageId;
  },

  deleteConversation: async (conversationId: string) => {
    await axiosInstance.delete(`chat/conversations/${conversationId}`);
    return conversationId;
  },

  createOrFindConversation: async (candidateId: string, companyId: string) => {
    const res = await axiosInstance.post('chat/conversations', { candidateId, companyId });
    const data = res.data;
    if (data.success && data.data?._id) return data.data;
    throw new Error('Failed to create conversation');
  },
};
