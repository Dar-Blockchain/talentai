import { useQuery } from '@tanstack/react-query';
import { fetchJobPost } from '../api/jobPost.api';

export function useJobPostQuery(jobId: string | null) {
  return useQuery({
    queryKey: ['jobPost', jobId],
    queryFn:  () => fetchJobPost(jobId!),
    enabled:  !!jobId,
    retry:      2,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000),
    staleTime: 5 * 60 * 1000,
  });
}
