import axiosInstance from '@/utils/axiosInstance';

export const candidateApi = {
  fetchProfile: async () => {
    const res = await axiosInstance.get('profiles/me');
    return res.data;
  },

  updateProfile: async (userId: string, payload: Record<string, unknown>) => {
    const res = await axiosInstance.put(`profiles/${userId}`, payload);
    return res.data;
  },

  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('user_image', file);
    const res = await axiosInstance.put(`profiles/${userId}`, formData);
    return res.data;
  },

  fetchActiveApplicationsCount: async (): Promise<number> => {
    const res = await axiosInstance.get('job-applications/candidate/my/stats');
    return (res.data?.statusCounts?.visited as number) ?? 0;
  },

  deleteResume: async () => {
    const res = await axiosInstance.delete('profiles/delete-resume');
    return res.data;
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await axiosInstance.put('profiles/update-resume', formData);
    return res.data;
  },

  updateVisibility: async (userId: string, isPublicProfile: boolean) => {
    const res = await axiosInstance.put(`profiles/${userId}`, { isPublicProfile });
    return res.data;
  },
};
