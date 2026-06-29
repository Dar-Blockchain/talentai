import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { AdminSkillInterviewStats } from "../types";

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
        const stats = data.data?.stats as AdminSkillInterviewStats | undefined;
        return { results, total, stats };
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
