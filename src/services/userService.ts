import axiosInstance from '@/utils/axiosInstance';

export const userService = {
  createOrUpdateProfile: async (profileData: any) => {
    const endpoint =
      profileData.type === 'company'
        ? 'profiles/createOrUpdateCompanyProfile'
        : 'profiles/createOrUpdateProfile';
    const res = await axiosInstance.post(endpoint, profileData);
    return res.data;
  },

  updateProfile: async (userId: string, payload: any) => {
    const res = await axiosInstance.put(`profiles/${userId}`, payload);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await axiosInstance.get('profiles/me');
    return res.data;
  },

  uploadProfileImage: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('user_image', file);
    const res = await axiosInstance.put(`profiles/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getProfileById: async (userId: string) => {
    const res = await axiosInstance.get(`profiles/${userId}`);
    return res.data;
  },
};
