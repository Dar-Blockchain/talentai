import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { AdminBlogPost, BlogPostInput, FetchAdminBlogPostsParams, FetchAdminBlogPostsResponse } from "../types";

export const adminBlogApi = {
  fetchPosts: (params: FetchAdminBlogPostsParams) =>
    apiCall(
      async () => {
        const { page = 1, limit = 10, status, search } = params;
        const { data } = await axiosInstance.get("blog", {
          params: {
            page,
            limit,
            ...(status ? { status } : {}),
            ...(search ? { search } : {}),
          },
        });
        return data as FetchAdminBlogPostsResponse;
      },
      "Failed to load blog posts.",
    ),

  fetchPost: (id: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get(`blog/${id}`);
        return data.data as AdminBlogPost;
      },
      "Failed to load blog post.",
    ),

  createPost: (input: BlogPostInput) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.post("blog", input);
        return data.data as AdminBlogPost;
      },
      "Failed to create blog post.",
    ),

  updatePost: (id: string, input: Partial<BlogPostInput>) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.patch(`blog/${id}`, input);
        return data.data as AdminBlogPost;
      },
      "Failed to update blog post.",
    ),

  deletePost: (id: string) =>
    apiCall(
      async () => {
        await axiosInstance.delete(`blog/${id}`);
      },
      "Failed to delete blog post.",
    ),

  publishPost: (id: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.patch(`blog/${id}/publish`);
        return data.data as AdminBlogPost;
      },
      "Failed to publish blog post.",
    ),

  unpublishPost: (id: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.patch(`blog/${id}/unpublish`);
        return data.data as AdminBlogPost;
      },
      "Failed to unpublish blog post.",
    ),

  uploadImage: (file: File) =>
    apiCall(
      async () => {
        const formData = new FormData();
        formData.append("image", file);
        const { data } = await axiosInstance.post("blog/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return data.data as { url: string };
      },
      "Failed to upload image.",
    ),
};
