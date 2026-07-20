import axiosInstance from "@/utils/axiosInstance";
import type { WebinarContact, WebinarData, WebinarSubmission } from "../types";

export const webinarApi = {
  // Single endpoint for both "a specific webinar" and "the currently active
  // one" — the backend treats the literal id "active" as a special case on
  // the same /public/:id route, so the frontend never needs to branch.
  getPublic: (id: string) =>
    axiosInstance
      .get<{ success: boolean; data: WebinarData }>(`webinars/public/${id}`)
      .then(res => res.data.data),

  saveProgress: (params: {
    submissionId?: string;
    webinarId: string;
    contact?: WebinarContact;
    lang?: string;
    consent?: boolean;
    answers?: Record<string, unknown>;
    source?: Record<string, string>;
  }) =>
    axiosInstance
      .post<{ success: boolean; submissionId: string; completed: boolean; isReturning: boolean }>("webinar-agent/progress", params)
      .then(res => res.data),

  getProgress: (submissionId: string) =>
    axiosInstance
      .get<{ success: boolean; submission: WebinarSubmission }>(`webinar-agent/progress/${submissionId}`)
      .then(res => res.data.submission),

  complete: (submissionId: string, answers: Record<string, unknown>) =>
    axiosInstance
      .post<{ success: boolean; submission: WebinarSubmission }>(`webinar-agent/complete/${submissionId}`, { answers })
      .then(res => res.data.submission),
};
