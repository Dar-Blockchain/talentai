import axiosInstance from "@/utils/axiosInstance";
import axios, { type AxiosError } from "axios";
import type { AssessmentDetail, StepsData } from "../types";

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

export const assessmentApi = {
  fetchDetail: (id: string) =>
    call(async () => {
      const { data } = await axiosInstance.get(`post-interview-assessments/${id}`);
      const d = data?.data ?? data;
      return {
        assessment: (d?.assessment ?? d) as AssessmentDetail,
        stepsData:  (d?.stepsData ?? null) as StepsData | null,
      };
    }, "Failed to load assessment."),
};
