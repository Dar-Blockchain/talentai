import { useQuery } from '@tanstack/react-query';
import { checkEligibility } from '../api/eligibility.api';

export function useEligibilityQuery(postId: string | null, userId?: string | null) {
  return useQuery({
    queryKey: ['eligibility', postId, userId],
    queryFn:  () => checkEligibility(postId!),
    enabled:  !!postId && !!userId,
    retry:      2,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000),
    staleTime: 0,
  });
}
