import dayjs from 'dayjs';
import type { Campaign } from '@/modules/company/campaigns/types/campaign';
import type { DeadlineBadge } from './types';

export function daysLeft(iso?: string): number | null {
  if (!iso) return null;
  const end = new Date(iso);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000);
}

export function fmtDate(iso?: string) {
  return iso ? dayjs(iso).format('MMM D, YYYY') : '—';
}

export function computeDeadlineBadge(campaign: Campaign | null, remaining: number | null): DeadlineBadge | null {
  if (!campaign?.deadline || remaining === null) return null;
  if (remaining < 0)   return { text: 'Expired',            urgent: true  };
  if (remaining === 0) return { text: 'Expires today',      urgent: true  };
  if (remaining === 1) return { text: 'Expires tomorrow',   urgent: true  };
  if (remaining <= 7)  return { text: `${remaining}d left`, urgent: true  };
  return                      { text: fmtDate(campaign.deadline), urgent: false };
}

export function resolveEligibility(
  c: Campaign,
  isLoggedIn: boolean,
): 'login_required' | 'campaign_inactive' | 'expired' | 'already_completed' | 'eligible' {
  const deadlinePassed = c.deadline
    ? (() => { const d = new Date(c.deadline!); d.setHours(23, 59, 59, 999); return d.getTime() < Date.now(); })()
    : false;
  if (c.accessMethod === 'ACCOUNTS' && !isLoggedIn) return 'login_required';
  if (c.status !== 'ACTIVE')       return 'campaign_inactive';
  if (deadlinePassed)              return 'expired';
  if (c.participantStatus === 'COMPLETED') return 'already_completed';
  return 'eligible';
}
