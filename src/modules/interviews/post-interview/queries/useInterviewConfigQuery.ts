import { useQuery } from '@tanstack/react-query';
import { fetchInterviewConfig } from '../api/interviewConfig.api';

export function useInterviewConfigQuery(jobId: string | null) {
  return useQuery({
    queryKey: ['interviewConfig', jobId],
    queryFn:  () => fetchInterviewConfig(jobId!),
    enabled:  !!jobId,
    retry:      2,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000),
    staleTime: 5 * 60 * 1000,
  });
}
