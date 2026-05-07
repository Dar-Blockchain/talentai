import axiosInstance from '@/utils/axiosInstance';

export const paymentService = {
  verifyPayment: async (sessionId: string) => {
    const res = await axiosInstance.post('payments/verify', { sessionId });
    return res.data.data;
  },

  cancelSubscription: async (subscriptionId: string, reason?: string) => {
    await axiosInstance.post(`subscriptions/${subscriptionId}/cancel`, { reason: reason || '' });
  },

  enableAutoRenew: async (subscriptionId: string) => {
    await axiosInstance.post(`subscriptions/${subscriptionId}/enable-auto-renew`);
  },

  scheduleDowngrade: async (subscriptionId: string, newPlanId: string) => {
    const res = await axiosInstance.post(`subscriptions/${subscriptionId}/schedule-downgrade`, { newPlanId });
    return res.data.data;
  },

  fetchCompanyPaymentHistory: async () => {
    const res = await axiosInstance.get('payments/user/history');
    return res.data.data || res.data;
  },

  fetchActiveSubscription: async () => {
    const res = await axiosInstance.get('subscriptions/active');
    return res.data.data;
  },

  fetchCompanySubscriptions: async () => {
    const res = await axiosInstance.get('subscriptions/');
    return res.data.data || [];
  },

  fetchCombinedSubscriptionDetails: async () => {
    const res = await axiosInstance.get('subscriptions/combined');
    return res.data.data;
  },

  fetchSubscriptionDetails: async (subscriptionId: string) => {
    const res = await axiosInstance.get(`subscriptions/${subscriptionId}/details`);
    return res.data.data;
  },

  checkSubscriptionLimit: async (companyProfileId: string, limitType: 'posts' | 'monthlyInterviews') => {
    const res = await axiosInstance.get(`subscriptions/${companyProfileId}/check-limit/${limitType}`);
    return res.data;
  },

  updatePaymentStatus: async (paymentId: string, status: string, additionalData?: Record<string, any>) => {
    const res = await axiosInstance.put(`payments/${paymentId}/status`, {
      status,
      ...(additionalData ? { additionalData } : {}),
    });
    return res.data.data;
  },
};
