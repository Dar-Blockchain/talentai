import axiosInstance from "@/utils/axiosInstance";
import type { JobPost } from "../types";

export const postService = {
  fetchMyPosts: async (params: { page?: number; limit?: number; search?: string; sort?: string; status?: string; creationType?: string } = {}): Promise<{
    posts: JobPost[];
    pagination: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
  }> => {
    const { page = 1, limit = 12, search = "", sort = "newest", status, creationType } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(), limit: limit.toString(),
      ...(search && { search }), sort,
      ...(status && status !== "all" && { status }),
      ...(creationType && creationType !== "all" && { creationType }),
    });
    const res = await axiosInstance.get(`post/my-posts?${queryParams}`);
    const data = res.data;
    return {
      posts: data.results || [],
      pagination: {
        total: data.total || 0, page: data.page || 1, limit: data.limit || 10,
        totalPages: data.totalPages || 1, hasNextPage: data.hasNextPage || false, hasPrevPage: data.hasPrevPage || false,
      },
    };
  },

  deletePost: async (jobId: string) => {
    await axiosInstance.delete(`post/deletePost/${jobId}`);
    return jobId;
  },

  updatePostStatus: async (postId: string, status: string) => {
    const res = await axiosInstance.patch(`post/updatePostStatus/${postId}`, { status });
    return res.data;
  },

  fetchPostMetrics: async (): Promise<{ total?: number; active?: number; draft?: number; closed?: number }> => {
    const res = await axiosInstance.get("post/metrics");
    return res.data.data;
  },

  savePost: async (jobData: unknown) => {
    if (!jobData) throw new Error("No job data available");
    const res = await axiosInstance.post("post/save-post", jobData);
    const saved = res.data;
    const job = saved.data || saved;
    return { success: true, jobData: job, planUsage: saved.planUsage || null };
  },

  updatePost: async (jobId: string | number, jobData: unknown) => {
    if (!jobData || !jobId) throw new Error("Job ID or data is missing");
    const res = await axiosInstance.put(`post/updatePost/${jobId}`, jobData);
    const job = res.data.data || res.data;
    return { success: true, jobData: job };
  },

  fetchRecommendedPosts: async (params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const res = await axiosInstance.get(`post/adsPost?${queryParams}`);
    return res.data;
  },
};
