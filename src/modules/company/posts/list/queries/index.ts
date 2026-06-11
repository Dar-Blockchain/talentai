import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { postService } from "../api/postService";

export const POST_KEYS = {
  all:     ()                                                          => ["posts"]                 as const,
  list:    (p: Record<string, unknown>)                               => ["posts", "list",    p]   as const,
  metrics: ()                                                          => ["posts", "metrics"]      as const,
};

export const useMyPostsQuery = (params: Parameters<typeof postService.fetchMyPosts>[0]) =>
  useQuery({
    queryKey:        POST_KEYS.list(params as Record<string, unknown>),
    queryFn:         () => postService.fetchMyPosts(params),
    staleTime:       30_000,
    placeholderData: keepPreviousData,
  });

export const usePostMetricsQuery = () =>
  useQuery({
    queryKey:  POST_KEYS.metrics(),
    queryFn:   postService.fetchPostMetrics,
    staleTime: 60_000,
  });

export const useDeletePostMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all() });
    },
  });
};

export const useUpdatePostStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: string }) =>
      postService.updatePostStatus(postId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: POST_KEYS.all() });
    },
  });
};
