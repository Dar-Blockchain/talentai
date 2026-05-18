import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getToken } from '@/utils/tokenUtils';
import { useEligibilityQuery } from '../queries/useEligibilityQuery';
import { type EligibilityStatus, type EligibilityMeta } from '../types/api';

// Re-export so existing imports from this file continue to work
export type { EligibilityStatus, EligibilityMeta };

export function useEligibilityCheck() {
  const router = useRouter();
  const token  = getToken();

  const postId = router.isReady && typeof router.query.jobId === 'string' && token
    ? (router.query.jobId as string)
    : null;

  const { data, isLoading } = useEligibilityQuery(postId);

  useEffect(() => {
    if (data?.status === 'company_blocked') {
      setTimeout(() => router.replace('/company/dashboard'), 3000);
    }
  }, [data?.status]);

  const rawStatus = data?.status;
  const eligibilityStatus: EligibilityStatus =
    !router.isReady                                               ? 'checking' :
    !router.query.jobId || !token                                 ? 'eligible' :
    isLoading                                                     ? 'checking' :
    !rawStatus || rawStatus === 'not_found' || rawStatus === 'error' ? 'eligible' :
    rawStatus;

  return { eligibilityStatus, eligibilityMeta: data?.meta ?? null };
}
