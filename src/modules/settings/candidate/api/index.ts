import axiosInstance from '@/utils/axiosInstance';
import { getToken } from '@/modules/auth/shared/utils/token';

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const candidateApi = {
  fetchProfile: async () => {
    const res = await axiosInstance.get('profiles/me', { headers: authHeaders() });
    return res.data;
  },

  updateProfile: async (userId: string, payload: Record<string, unknown>) => {
    const res = await axiosInstance.put(`profiles/${userId}`, payload, { headers: authHeaders() });
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

  fetchActiveApplicationsCount: async (): Promise<number> => {
    const res = await axiosInstance.get('job-applications/candidate/my/stats', { headers: authHeaders() });
    return (res.data?.statusCounts?.visited as number) ?? 0;
  },

  deleteResume: async () => {
    const res = await axiosInstance.delete('profiles/delete-resume', { headers: authHeaders() });
    return res.data;
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await axiosInstance.put('profiles/update-resume', formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateVisibility: async (userId: string, isPublicProfile: boolean) => {
    const res = await axiosInstance.put(
      `profiles/${userId}`,
      { isPublicProfile },
      { headers: authHeaders() }
    );
    return res.data;
  },
};
