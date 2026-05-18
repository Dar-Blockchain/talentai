import { useQuery } from '@tanstack/react-query';
import { fetchJobPost } from '../api/jobPost.api';

export function useJobPostQuery(jobId: string | null) {
  return useQuery({
    queryKey: ['jobPost', jobId],
    queryFn:  () => fetchJobPost(jobId!),
    enabled:  !!jobId,
    staleTime: 5 * 60 * 1000,
  });
}
