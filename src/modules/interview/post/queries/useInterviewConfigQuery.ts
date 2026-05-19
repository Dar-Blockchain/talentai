import { useQuery } from '@tanstack/react-query';
import { fetchInterviewConfig } from '../api/interviewConfig.api';

export function useInterviewConfigQuery(jobId: string | null) {
  return useQuery({
    queryKey: ['interviewConfig', jobId],
    queryFn:  () => fetchInterviewConfig(jobId!),
    enabled:  !!jobId,
    retry:    false,
    staleTime: 5 * 60 * 1000,
  });
}
