import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "../api/postService";
import { jobApplicationService } from "@/services/jobApplicationService";

export const POST_DETAIL_KEYS = {
  detail:  (id: string) => ["postDetails", "job",     id] as const,
  metrics: ()           => ["posts",       "metrics"]     as const,
};

export const useJobDetailQuery = (id: string | undefined) =>
  useQuery({
    queryKey:  POST_DETAIL_KEYS.detail(id ?? ""),
    queryFn:   () => postService.fetchJobById(id!),
    enabled:   !!id,
    staleTime: 30_000,
  });

export const useUpdatePostMutation = (jobId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobData: any) => postService.updatePost(jobId, jobData),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: POST_DETAIL_KEYS.detail(jobId) });
    },
  });
};

export const APPLICATION_KEYS = {
  summary: (params: any) => ["applications", "summary", params] as const,
};

export const useApplicationsSummaryQuery = (params: {
  postId: string;
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey:        APPLICATION_KEYS.summary(params),
    queryFn:         () => jobApplicationService.fetchPostApplicationsSummary(params),
    enabled:         !!params.postId,
    staleTime:       30_000,
    placeholderData: (prev: any) => prev,
  });
