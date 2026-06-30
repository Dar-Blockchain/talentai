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
  /**
   * Sends a one-time code to the email address for sign-in.
   * Throws a normalised Error on failure.
   */
  signin: async (email: string, language?: string, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth", { email, language }, { signal });
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
      return res.data;
    } catch (err) {
      throw new Error(extractMessage(err, "Verification failed. Please try again."));
    }
  },

  /**
   * Requests a new OTP code for the given email.
   * Throws a normalised Error on failure.
   */
  resendOtp: async (email: string, language?: string, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("auth/resend-otp", { email, language }, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Failed to resend code. Please try again."));
    }
  },

  /** Returns the role of an existing user by email, or null if the user is not found. */
  checkRole: async (email: string): Promise<string | null> => {
    try {
      const res = await axiosInstance.get<{ success: boolean; role: string }>(
        'auth/check-role',
        { params: { email } },
      );
      return res.data.role ?? null;
    } catch {
      return null;
    }
  },

  /** Returns the current authenticated user and profile. Throws on 401. */
  me: async (): Promise<MeResponse> => {
    const res = await axiosInstance.get<MeResponse>("auth/me");
    return res.data;
  },

  /**
   * Signs the user out server-side (clears the jwt_token cookie and revokes the JWT).
   * Uses native fetch with keepalive:true so the request survives page navigation —
   * Axios requests are cancelled by the browser when the page unloads, which would
   * leave the httpOnly jwt_token cookie in place until it naturally expires.
   * Never throws — client-side cleanup runs regardless of network outcome.
   */
  logout: async (): Promise<void> => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
      await fetch(`${base}/auth/logout`, {
        method:      "POST",
        credentials: "include", // send the httpOnly jwt_token cookie
        keepalive:   true,      // survives page navigation / unload
      });
    } catch {
      // Network error or server down — auth_present was already cleared client-side.
    }
  },
};
