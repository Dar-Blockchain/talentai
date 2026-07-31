import axiosInstance from '@/utils/axiosInstance';
import type { PlanLimit } from '@/store/slices/planLimitsSlice';

export const planLimitsService = {
  fetchAll: async () => {
    const res = await axiosInstance.get('plan-limits');
    const data = res.data;
    if (data.success && data.data) return data.data;
    return data.data || [];
  },

  fetchById: async (planLimitId: string) => {
    const res = await axiosInstance.get(`plan-limits/${planLimitId}`);
    return res.data.data || res.data;
  },

  update: async (planLimitId: string, payload: Partial<PlanLimit>) => {
    const res = await axiosInstance.put(`plan-limits`, { ...payload, _id: planLimitId });
    return res.data.data || res.data;
  },
};
