import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";

export const adminSkillInterviewApi = {
  fetchAssessments: (params: { page: number; limit: number; skill?: string }) =>
    apiCall(
      async () => {
        const { page, limit, skill } = params;
        const { data } = await axiosInstance.get("dashboard/skill-interview-assessments", {
          params: { page: page + 1, limit, ...(skill ? { skill } : {}) },
        });
        const results = data.data?.data || [];
        const total = data.data?.totalCount ?? results.length;
        return { results, total };
      },
      "Failed to load skill-interview assessments.",
    ),

  archiveAssessment: (assessmentId: string) =>
    apiCall(
      async () => {
        await axiosInstance.patch(`dashboard/skill-interview-assessments/${assessmentId}/archive`);
      },
      "Failed to archive assessment.",
    ),

  unarchiveAssessment: (assessmentId: string) =>
    apiCall(
      async () => {
        await axiosInstance.patch(`dashboard/skill-interview-assessments/${assessmentId}/unarchive`);
      },
      "Failed to unarchive assessment.",
    ),

  deleteAssessment: (assessmentId: string) =>
    apiCall(
      async () => {
        await axiosInstance.delete(`dashboard/skill-interview-assessments/${assessmentId}`);
      },
      "Failed to delete assessment.",
    ),
};
