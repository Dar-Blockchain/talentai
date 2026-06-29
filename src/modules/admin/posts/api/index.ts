import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { AdminPost, FetchAdminPostsParams, FetchAdminPostsResponse } from "../types";

export const adminPostsApi = {
  fetchPosts: (params: FetchAdminPostsParams) =>
    apiCall(
      async () => {
        const { page = 1, limit = 10, status, archived, search } = params;
        const { data } = await axiosInstance.get("dashboard/posts", {
          params: {
            page,
            limit,
            ...(status ? { status } : {}),
            ...(archived !== undefined ? { archived } : {}),
            ...(search ? { search } : {}),
          },
        });
        return data.data as FetchAdminPostsResponse;
      },
      "Failed to load posts.",
    ),

  archivePost: (postId: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.patch(`dashboard/posts/${postId}/archive`);
        return data.data as AdminPost;
      },
      "Failed to archive post.",
    ),

  unarchivePost: (postId: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.patch(`dashboard/posts/${postId}/unarchive`);
        return data.data as AdminPost;
      },
      "Failed to unarchive post.",
    ),

  deletePost: (postId: string) =>
    apiCall(
      async () => {
        await axiosInstance.delete(`dashboard/posts/${postId}`);
      },
      "Failed to delete post.",
    ),

  updateThreshold: (postId: string, thresholdScore: number) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.patch(`dashboard/posts/${postId}/threshold`, { thresholdScore });
        return data.data as AdminPost;
      },
      "Failed to update threshold score.",
    ),
};
