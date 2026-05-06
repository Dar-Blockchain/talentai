import axiosInstance from '@/utils/axiosInstance';
import { getToken } from '@/utils/tokenUtils';

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiKeyService = {
  fetchAll: async () => {
    const res = await axiosInstance.get('api/api-keys', { headers: authHeaders() });
    return res.data?.data ?? res.data;
  },

  create: async (payload: {
    name: string;
    serviceName: string;
    scopes: string[];
    rateLimit: number;
    expiresAt: string;
    ipWhitelist?: string[];
  }) => {
    const res = await axiosInstance.post('api/api-keys', payload, { headers: authHeaders() });
    return res.data?.data ?? res.data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`api/api-keys/${id}`, { headers: authHeaders() });
    return id;
  },

  toggle: async (id: string) => {
    const res = await axiosInstance.patch(`api/api-keys/${id}/toggle`, {}, { headers: authHeaders() });
    return res.data?.data ?? res.data;
  },

  update: async (id: string, data: any) => {
    const res = await axiosInstance.put(`api/api-keys/${id}`, data, { headers: authHeaders() });
    return res.data?.data ?? res.data;
  },

  regenerate: async (id: string) => {
    const res = await axiosInstance.post(`api/api-keys/${id}/regenerate`, {}, { headers: authHeaders() });
    return res.data?.data ?? res.data;
  },
};
