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

  createCheckoutSession: async (planId: string) => {
    // window.open must fire synchronously inside the click handler to count
    // as a trusted user gesture — opening it here (before the await) and
    // redirecting it once the URL is known avoids the popup blocker that
    // kicks in when window.open runs after a network call.
    // NOTE: "noopener"/"noreferrer" here would make window.open() return
    // null (no reference to redirect later), which defeats the whole
    // point — omit them on this call specifically.
    const checkoutWindow = window.open('', '_blank');
    try {
      const res = await axiosInstance.post('stripe/create-checkout-session', { planId });
      const { url, sessionId, paymentId } = res.data;
      if (!url) throw new Error('Stripe session URL missing');
      if (paymentId) localStorage.setItem('pending_payment_id', paymentId);
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.opener = null; // sever the opener link before navigating away, same mitigation noopener would've given
        checkoutWindow.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return { url, sessionId, paymentId };
    } catch (err) {
      checkoutWindow?.close();
      throw err;
    }
  },
};
