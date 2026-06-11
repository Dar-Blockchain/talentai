import { useQuery } from '@tanstack/react-query';
import { fetchPostAssessment } from '../api';

export function usePostAssessmentQuery(
  postId: string | null,
  candidateUserId: string | null,
) {
  return useQuery({
    queryKey:   ['postAssessment', postId, candidateUserId],
    queryFn:    () => fetchPostAssessment(postId!, candidateUserId!),
    enabled:    !!postId && !!candidateUserId,
    retry:      2,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000),
    staleTime:  5 * 60 * 1000,
  });
}
