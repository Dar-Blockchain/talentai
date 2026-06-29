import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";

export const adminSkillInterviewApi = {
  fetchAssessments: (params: { page: number; limit: number; skill?: string }) =>
    apiCall(
      async () => {
        const { page, limit, skill } = params;
        const { data } = await axiosInstance.get("skill-interview-assessments", {
          params: { page: page + 1, limit, ...(skill ? { skill } : {}) },
        });
        const results = data.data || data.results || [];
        const total = data.pagination?.totalCount || data.total || data.count || data.totalCount || results.length;
        return { results, total };
      },
      "Failed to load skill-interview assessments.",
    ),
};
