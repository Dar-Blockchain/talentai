import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPostsApi } from "../api";
import { FetchAdminPostsParams } from "../types";

export const ADMIN_POSTS_QUERY_KEY = ["admin", "posts"] as const;

export const useAdminPostsQuery = (params: FetchAdminPostsParams) =>
  useQuery({
    queryKey: [...ADMIN_POSTS_QUERY_KEY, params],
    queryFn: () => adminPostsApi.fetchPosts(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useArchivePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => adminPostsApi.archivePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_POSTS_QUERY_KEY });
    },
  });
};

export const useUnarchivePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => adminPostsApi.unarchivePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_POSTS_QUERY_KEY });
    },
  });
};

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => adminPostsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_POSTS_QUERY_KEY });
    },
  });
};
