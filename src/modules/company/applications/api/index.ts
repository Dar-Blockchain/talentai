import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";

export interface JobApplicationDetail {
  _id: string;
  post: { _id: string };
  profile: { userId: { _id: string } | string };
}

export const applicationsApi = {
  getById: (id: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get(`job-applications/${id}`);
        return data?.data as JobApplicationDetail;
      },
      "Failed to load application.",
    ),

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
