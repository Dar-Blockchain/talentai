import axiosInstance from "@/utils/axiosInstance";
import type { VerifyOtpResponse } from "../types";

export const authApi = {
  signin: async (email: string): Promise<void> => {
    await axiosInstance.post("auth", { email });
  },

  register: async (payload: FormData | Record<string, any>): Promise<void> => {
    await axiosInstance.post("auth/register", payload);
  },

  verifyOtp: async (email: string, otp: string, location?: any): Promise<VerifyOtpResponse> => {
    const res = await axiosInstance.post(
      "auth/verify-otp",
      { email, otp, location },
      { validateStatus: (s) => s >= 200 && s < 500 }
    );
    return res.data;
  },

  resendOtp: async (email: string): Promise<void> => {
    await axiosInstance.post("auth/resend-otp", { email });
  },
};
