import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";

export const adminPostInterviewApi = {
  fetchAssessments: (params: { page?: number; limit?: number; company?: string }) =>
    apiCall(
      async () => {
        const { page = 1, limit = 10, company } = params;
        const { data } = await axiosInstance.get("dashboard/post-interview-assessments", {
          params: { page, limit, ...(company ? { company } : {}) },
        });
        const items = data.data?.data || [];
        const total = data.data?.totalCount ?? items.length;
        return { items, total };
      },
      "Failed to load post-interview assessments.",
    ),

  archiveAssessment: (assessmentId: string) =>
    apiCall(
      async () => {
        await axiosInstance.patch(`dashboard/post-interview-assessments/${assessmentId}/archive`);
      },
      "Failed to archive assessment.",
    ),

  unarchiveAssessment: (assessmentId: string) =>
    apiCall(
      async () => {
        await axiosInstance.patch(`dashboard/post-interview-assessments/${assessmentId}/unarchive`);
      },
      "Failed to unarchive assessment.",
    ),

  deleteAssessment: (assessmentId: string) =>
    apiCall(
      async () => {
        await axiosInstance.delete(`dashboard/post-interview-assessments/${assessmentId}`);
      },
      "Failed to delete assessment.",
    ),
};
