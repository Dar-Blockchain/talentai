import axiosInstance from "@/utils/axiosInstance";
import type { WebinarAnswers, WebinarContact, WebinarSubmission } from "./types";

const BASE = "/webinar-agent";

export const webinarApi = {
  saveProgress: async (params: {
    submissionId?: string;
    webinarId: string;
    contact?: WebinarContact;
    lang?: string;
    consent?: boolean;
    answers?: Partial<WebinarAnswers> | Record<string, any>;
    source?: Record<string, string>;
  }) => {
    const { data } = await axiosInstance.post(`${BASE}/progress`, params);
    return data as { success: boolean; submissionId: string };
  },

  getProgress: async (submissionId: string) => {
    const { data } = await axiosInstance.get(`${BASE}/progress/${submissionId}`);
    return data.submission as WebinarSubmission;
  },

  complete: async (submissionId: string, answers: Partial<WebinarAnswers> | Record<string, any>) => {
    const { data } = await axiosInstance.post(`${BASE}/complete/${submissionId}`, { answers });
    return data.submission as WebinarSubmission;
  },
};
