import axiosInstance from '@/utils/axiosInstance';

export const authService = {
  signin: async (email: string) => {
    const res = await axiosInstance.post('auth', { email });
    return res.data;
  },

  register: async (payload: FormData | Record<string, any>) => {
    const res = await axiosInstance.post('auth/register', payload);
    return res.data;
  },

  verifyOTP: async (email: string, otp: string, location?: any) => {
    const res = await axiosInstance.post(
      'auth/verify-otp',
      { email, otp, location },
      { validateStatus: (status) => status >= 200 && status < 500 },
    );
    return res;
  },

  resendOTP: async (email: string) => {
    const res = await axiosInstance.post('auth/resend-otp', { email });
    return res.data;
  },
};
