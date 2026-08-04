import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { PublicBlogListResponse, PublicBlogPost } from "../types";

export const publicBlogApi = {
  fetchPosts: (page = 1, limit = 9) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("blog/public", { params: { page, limit } });
        return data as PublicBlogListResponse;
      },
      "Failed to load blog posts.",
    ),

  fetchPostBySlug: (slug: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get(`blog/public/${slug}`);
        return data.data as PublicBlogPost;
      },
      "Failed to load blog post.",
    ),
};
