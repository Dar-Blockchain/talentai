import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { getToken } from '@/modules/auth/shared/utils/token';
import { type RootState } from '@/store/store';
import { useEligibilityQuery } from '../queries/useEligibilityQuery';
import { type EligibilityStatus, type EligibilityMeta } from '../types/api';

export type { EligibilityStatus, EligibilityMeta };

export function useEligibilityCheck(overrideJobId?: string | null) {
  const router   = useRouter();
  const token    = getToken();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const hasOverride = overrideJobId !== undefined;

  const jobIdResolved: string | null = hasOverride
    ? (overrideJobId ?? null)
    : (router.isReady && typeof router.query.jobId === 'string' ? router.query.jobId : null);

  const postId = jobIdResolved && !!authUser && !!token ? jobIdResolved : null;

  const { data, isLoading, isError } = useEligibilityQuery(postId, authUser?._id);

  const rawStatus = data?.status;

  const isReady = hasOverride ? true : router.isReady;
  const hasJobId = hasOverride ? !!overrideJobId : !!router.query.jobId;

  const eligibilityStatus: EligibilityStatus =
    !isReady                              ? 'checking'  :
    !hasJobId                             ? 'no_link'   :
    !authUser || !token                   ? 'eligible'  :
    isLoading                             ? 'checking'  :
    isError || rawStatus === 'error'      ? 'error'     :
    !rawStatus || rawStatus === 'not_found' ? 'eligible' :
    rawStatus;

  return { eligibilityStatus, eligibilityMeta: data?.meta ?? null };
}
