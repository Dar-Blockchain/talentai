import { useQuery } from '@tanstack/react-query';
import { checkEligibility } from '../api/eligibility.api';

export function useEligibilityQuery(postId: string | null) {
  return useQuery({
    queryKey: ['eligibility', postId],
    queryFn:  () => checkEligibility(postId!),
    enabled:  !!postId,
    retry:    false,
    staleTime: Infinity,
  });
}
