import axiosInstance from '@/utils/axiosInstance';
import type { UpdateProfilePayload, ProfileApiResponse, ApiKey, CreateApiKeyPayload, UpdateApiKeyPayload } from '../types';

export const settingsApi = {
  fetchProfile: async (): Promise<ProfileApiResponse> => {
    const res = await axiosInstance.get('profiles/me');
    return res.data;
  },

  updateProfile: async (
    userId: string,
    payload: UpdateProfilePayload
  ): Promise<ProfileApiResponse> => {
    const res = await axiosInstance.put(`profiles/${userId}`, payload);
    return res.data;
  },

  uploadAvatar: async (
    userId: string,
    file: File
  ): Promise<ProfileApiResponse> => {
    const formData = new FormData();
    formData.append('user_image', file);
    const res = await axiosInstance.put(`profiles/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const apiKeysApi = {
  fetchAll: async (): Promise<ApiKey[]> => {
    const res = await axiosInstance.get('api/api-keys');
    return res.data?.data ?? res.data;
  },

  create: async (payload: CreateApiKeyPayload): Promise<ApiKey> => {
    const res = await axiosInstance.post('api/api-keys', payload);
    return res.data?.data ?? res.data;
  },

  delete: async (id: string): Promise<string> => {
    await axiosInstance.delete(`api/api-keys/${id}`);
    return id;
  },

  toggle: async (id: string): Promise<{ id: string; isActive: boolean }> => {
    const res = await axiosInstance.patch(`api/api-keys/${id}/toggle`, {});
    return res.data?.data ?? res.data;
  },

  update: async (id: string, data: UpdateApiKeyPayload): Promise<ApiKey> => {
    const res = await axiosInstance.put(`api/api-keys/${id}`, data);
    return res.data?.data ?? res.data;
  },

  regenerate: async (id: string): Promise<{ id: string; name: string; key: string }> => {
    const res = await axiosInstance.post(`api/api-keys/${id}/regenerate`, {});
    return res.data?.data ?? res.data;
  },
};
