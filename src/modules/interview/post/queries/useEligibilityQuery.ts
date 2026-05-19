import { useQuery } from '@tanstack/react-query';
import { checkEligibility } from '../api/eligibility.api';

export function useEligibilityQuery(postId: string | null, userId?: string | null) {
  return useQuery({
    queryKey: ['eligibility', postId, userId],
    queryFn:  () => checkEligibility(postId!),
    enabled:  !!postId && !!userId,
    retry:    false,
    staleTime: 0,
  });
}
