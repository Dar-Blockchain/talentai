import axiosInstance from "@/utils/axiosInstance";
import axios, { type AxiosError } from "axios";
import type { ApplicationDetail } from "../types";

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = (err as AxiosError<{ message?: string; error?: string }>).response?.data;
    return d?.message ?? d?.error ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

async function call<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new Error(extractMessage(err, fallback));
  }
}

export const applicationsApi = {
  fetchDetail: (id: string) =>
    call(async () => {
      const { data } = await axiosInstance.get(`job-applications/${id}`);
      return (data?.data ?? data) as ApplicationDetail;
    }, "Failed to load application."),

  inviteToInterview: (id: string, interviewLink: string) =>
    call(
      () => axiosInstance.post(`job-applications/${id}/invite-to-interview`, { interviewLink }),
      "Failed to send invitation.",
    ),

  updateDecision: (id: string, decision: "shortlisted" | "rejected") =>
    call(
      () => axiosInstance.patch(`job-applications/${id}/recruiter-decision`, { decision }),
      "Failed to update decision.",
    ),
};
