import axios, { type AxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import type { MeResponse, VerifyOtpPayload, VerifyOtpResponse } from "../types";

// ─── Error normaliser ─────────────────────────────────────────────────────────

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = (err as AxiosError<{ message?: string; error?: string }>).response?.data;
    return data?.message ?? data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /** Sends a one-time code to the given email for sign-in. */
  signin: async (email: string, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth", { email }, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Sign in failed. Please try again."));
    }
  },

  /** Creates a new account. Accepts FormData (CV upload) or plain object (company). */
  register: async (payload: FormData | Record<string, unknown>, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth/register", payload, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Registration failed. Please try again."));
    }
  },

  /** Verifies the OTP and returns the full session payload including the JWT token. */
  verifyOtp: async ({ email, otp, location, signal }: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    try {
      const res = await axiosInstance.post<VerifyOtpResponse>(
        "auth/verify-otp",
        { email, otp, location },
        { signal }
      );
      if (!res.data.token) throw new Error("Verification succeeded but no token was returned.");
      return res.data;
    } catch (err) {
      throw new Error(extractMessage(err, "Verification failed. Please try again."));
    }
  },

  /** Requests a new OTP code for the given email. */
  resendOtp: async (email: string, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth/resend-otp", { email }, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Failed to resend code. Please try again."));
    }
  },

  /** Returns the current authenticated user and profile. Throws on 401. */
  me: async (): Promise<MeResponse> => {
    const res = await axiosInstance.get<MeResponse>("auth/me");
    return res.data;
  },

  /**
   * Signs the user out server-side (clears the jwt_token cookie).
   * Never throws — a failed network call should not block client-side cleanup.
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("auth/logout");
    } catch {
      // Cookie may already be gone; client-side cleanup still runs.
    }
  },
};
