import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";

export const applicationsApi = {
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
