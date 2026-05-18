import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchPipelineProgress,
  initializePipelineProgress,
  updatePipelineStep,
} from '../api/pipelineProgress.api';

export function usePipelineProgressQuery(candidateId: string | null, jobId: string | null) {
  return useQuery({
    queryKey: ['pipelineProgress', candidateId, jobId],
    queryFn: async () => {
      try {
        return await fetchPipelineProgress(candidateId!, jobId!);
      } catch (e: any) {
        if (e.response?.status === 404) {
          await initializePipelineProgress(candidateId!, jobId!);
          return fetchPipelineProgress(candidateId!, jobId!);
        }
        throw e;
      }
    },
    enabled:  !!candidateId && !!jobId,
    retry:    false,
    staleTime: 0,
  });
}

export function useUpdatePipelineStepMutation() {
  return useMutation({
    mutationFn: (payload: Parameters<typeof updatePipelineStep>[0]) =>
      updatePipelineStep(payload),
  });
}
