import axiosInstance from '@/utils/axiosInstance';

export const companyService = {
  fetchDashboardStats: async () => {
    const res = await axiosInstance.get('dashboard/statsCards');
    return res.data.data;
  },

  fetchRichStats: async () => {
    const res = await axiosInstance.get('dashboard/richStats');
    return res.data.data;
  },
};
