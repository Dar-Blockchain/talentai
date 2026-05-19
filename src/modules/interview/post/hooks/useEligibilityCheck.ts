import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { getToken } from '@/utils/tokenUtils';
import { type RootState } from '@/store/store';
import { useEligibilityQuery } from '../queries/useEligibilityQuery';
import { type EligibilityStatus, type EligibilityMeta } from '../types/api';

// Re-export so existing imports from this file continue to work
export type { EligibilityStatus, EligibilityMeta };

export function useEligibilityCheck() {
  const router   = useRouter();
  const token    = getToken();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  // Require both authUser (Redux — reliable after login) and token (cookie — needed for the request)
  const postId = router.isReady && typeof router.query.jobId === 'string' && !!authUser && !!token
    ? (router.query.jobId as string)
    : null;

  const { data, isLoading } = useEligibilityQuery(postId);

  const rawStatus = data?.status;
  const eligibilityStatus: EligibilityStatus =
    !router.isReady                                                   ? 'checking' :
    !router.query.jobId                                               ? 'no_link'  :
    !authUser || !token                                               ? 'eligible' :
    isLoading                                                         ? 'checking' :
    !rawStatus || rawStatus === 'not_found' || rawStatus === 'error'  ? 'eligible' :
    rawStatus;

  return { eligibilityStatus, eligibilityMeta: data?.meta ?? null };
}
