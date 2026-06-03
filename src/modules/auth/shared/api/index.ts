import axios, { type AxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import type { VerifyOtpPayload, VerifyOtpResponse } from "../types";

// ─── Error normaliser ─────────────────────────────────────────────────────────
// Extracts the most useful human-readable message from an AxiosError.
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
  /**
   * Sends a one-time code to the email address for sign-in.
   * Throws a normalised Error on failure.
   */
  signin: async (email: string, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth", { email }, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Sign in failed. Please try again."));
    }
  },

  /**
   * Creates a new account (candidate or company).
   * Accepts FormData for CV uploads or a plain object for company registration.
   * Throws a normalised Error on failure.
   */
  register: async (payload: FormData | Record<string, unknown>, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth/register", payload, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Registration failed. Please try again."));
    }
  },

  /**
   * Verifies the OTP and returns the full session payload.
   * Always throws on non-2xx — callers never need to check res.data.token manually.
   */
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

  /**
   * Requests a new OTP code for the given email.
   * Throws a normalised Error on failure.
   */
  resendOtp: async (email: string, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth/resend-otp", { email }, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Failed to resend code. Please try again."));
    }
  },
};
