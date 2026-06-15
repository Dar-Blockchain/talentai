import axios, { type AxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";

export interface ContactPayload {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  message: string;
}

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = (err as AxiosError<{ message?: string; error?: string }>).response?.data;
    return data?.message ?? data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export const homeApi = {
  sendContact: async (payload: ContactPayload, signal?: AbortSignal): Promise<void> => {
    try {
      await axiosInstance.post("contact", payload, { signal });
    } catch (err) {
      throw new Error(extractMessage(err, "Failed to send message. Please try again."));
    }
  },
};
