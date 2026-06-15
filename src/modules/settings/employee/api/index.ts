import axiosInstance from '@/utils/axiosInstance';
import { getToken } from '@/modules/auth/shared/utils/token';

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const employeeApi = {
  fetchProfile: async () => {
    const res = await axiosInstance.get('profiles/me', { headers: authHeaders() });
    return res.data;
  },

  updateUsername: async (userId: string, username: string) => {
    const res = await axiosInstance.put(`users/${userId}`, { username }, { headers: authHeaders() });
    return res.data;
  },

  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('user_image', file);
    const res = await axiosInstance.put(`profiles/${userId}`, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
