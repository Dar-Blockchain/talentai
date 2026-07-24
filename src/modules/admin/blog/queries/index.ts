import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminBlogApi } from "../api";
import { BlogPostInput, FetchAdminBlogPostsParams } from "../types";

export const ADMIN_BLOG_QUERY_KEY = ["admin", "blog"] as const;

export const useAdminBlogPostsQuery = (params: FetchAdminBlogPostsParams) =>
  useQuery({
    queryKey: [...ADMIN_BLOG_QUERY_KEY, params],
    queryFn: () => adminBlogApi.fetchPosts(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useAdminBlogPostQuery = (id: string | null) =>
  useQuery({
    queryKey: [...ADMIN_BLOG_QUERY_KEY, "detail", id],
    queryFn: () => adminBlogApi.fetchPost(id as string),
    enabled: Boolean(id),
  });

export const useCreateBlogPostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BlogPostInput) => adminBlogApi.createPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BLOG_QUERY_KEY });
    },
  });
};

export const useUpdateBlogPostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BlogPostInput> }) => adminBlogApi.updatePost(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BLOG_QUERY_KEY });
    },
  });
};

export const useDeleteBlogPostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminBlogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BLOG_QUERY_KEY });
    },
  });
};

export const usePublishBlogPostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminBlogApi.publishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BLOG_QUERY_KEY });
    },
  });
};

export const useUnpublishBlogPostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminBlogApi.unpublishPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_BLOG_QUERY_KEY });
    },
  });
};
