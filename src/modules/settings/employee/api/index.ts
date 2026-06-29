import axiosInstance from '@/utils/axiosInstance';

export const employeeApi = {
  fetchProfile: async () => {
    const res = await axiosInstance.get('profiles/me');
    return res.data;
  },

  updateUsername: async (userId: string, username: string) => {
    const res = await axiosInstance.put(`users/${userId}`, { username });
    return res.data;
  },

  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('user_image', file);
    const res = await axiosInstance.put(`profiles/${userId}`, formData);
    return res.data;
  },
};
