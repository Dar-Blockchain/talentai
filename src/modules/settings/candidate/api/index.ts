import axiosInstance from '@/utils/axiosInstance';
import { getToken } from '@/utils/tokenUtils';

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const candidateApi = {
  fetchProfile: async () => {
    const res = await axiosInstance.get('profiles/me', { headers: authHeaders() });
    return res.data?.data ?? res.data;
  },

  updateProfile: async (userId: string, payload: Record<string, unknown>) => {
    const res = await axiosInstance.put(`profiles/${userId}`, payload, { headers: authHeaders() });
    return res.data?.data ?? res.data;
  },

  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('profile_image', file);
    const res = await axiosInstance.put(`profiles/${userId}`, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data ?? res.data;
  },

  updateVisibility: async (isPublicProfile: boolean) => {
    const res = await axiosInstance.put(
      'profiles/updateProfileVisibility',
      { isPublicProfile },
      { headers: authHeaders() }
    );
    return res.data?.data ?? res.data;
  },
};
