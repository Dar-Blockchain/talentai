import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";

export const adminPostInterviewApi = {
  fetchAssessments: (params: { page?: number; limit?: number; company?: string }) =>
    apiCall(
      async () => {
        const { page = 1, limit = 10, company } = params;
        const { data } = await axiosInstance.get("post-interview-assessments", {
          params: { page, limit, ...(company ? { company } : {}) },
        });
        const items = data.data || data.results || [];
        const total = data.pagination?.totalCount || data.total || data.count || data.totalCount || items.length;
        return { items, total };
      },
      "Failed to load post-interview assessments.",
    ),
};
