import axiosInstance from "@/utils/axiosInstance";

export interface PostApplicationsSummaryParams {
  postId: string;
  status?: string;
  search?: string;
  matchScoreMin?: number;
  matchScoreMax?: number;
  interviewScoreMin?: number;
  interviewScoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const applicationsApi = {
  fetchPostApplicationsSummary: async (params: PostApplicationsSummaryParams) => {
    const { postId, ...rest } = params;
    const query = new URLSearchParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
    });
    const res = await axiosInstance.get(
      `job-applications/post/${postId}/summary${query.toString() ? `?${query}` : ""}`,
    );
    return { data: res.data?.data ?? [], pagination: res.data?.pagination ?? {} };
  },
};
