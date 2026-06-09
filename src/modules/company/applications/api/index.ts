import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import type { ApplicationDetail } from "../types";

export const applicationsApi = {
  fetchDetail: (id: string) =>
    apiCall(async () => {
      const { data } = await axiosInstance.get(`job-applications/${id}`);
      return (data?.data ?? data) as ApplicationDetail;
    }, "Failed to load application."),

  inviteToInterview: (id: string, interviewLink: string) =>
    apiCall(
      () => axiosInstance.post(`job-applications/${id}/invite-to-interview`, { interviewLink }),
      "Failed to send invitation.",
    ),

  updateDecision: (id: string, decision: "shortlisted" | "rejected") =>
    apiCall(
      () => axiosInstance.patch(`job-applications/${id}/recruiter-decision`, { decision }),
      "Failed to update decision.",
    ),
};
