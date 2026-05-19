import { type EligibilityStatus } from '../types/api';

// Statuses that render a BlockedScreen (excludes checking / eligible)
export type BlockableStatus = Exclude<EligibilityStatus, 'checking' | 'eligible' | 'no_link'>;

export type ScreenEntry = {
  icon: string;
  titleKey?: string;       // resolved via t()
  descKey?: string;        // resolved via t()
  actionPath: string;
  actionLabelKey?: string; // resolved via t() (falls back to t('back_to_dashboard'))
  actionReplace?: boolean;
};

export const ELIGIBILITY_SCREEN_CONFIG: Record<BlockableStatus, ScreenEntry> = {
  company_blocked: {
    icon: '🏢',
    titleKey: 'company_only.title',
    descKey: 'company_only.redirecting',
    actionLabelKey: 'company_only.action',
    actionPath: '/company/dashboard',
    actionReplace: true,
  },
  employee_blocked: {
    icon: '🔒',
    titleKey: 'employee_blocked.title',
    descKey: 'employee_blocked.desc',
    actionLabelKey: 'employee_blocked.action',
    actionPath: '/employee/dashboard',
    actionReplace: true,
  },
  archived: {
    icon: '📦',
    titleKey: 'archived.title',
    descKey: 'archived.desc',
    actionPath: '/candidate/dashboard',
  },
  expired: {
    icon: '⏰',
    titleKey: 'expired.title',
    descKey: 'expired.desc',
    actionPath: '/candidate/dashboard',
  },
  completed: {
    icon: '✅',
    titleKey: 'completed.title',
    actionPath: '/candidate/dashboard',
  },
  under_threshold: {
    icon: '🔒',
    titleKey: 'under_threshold.title',
    actionPath: '/candidate/dashboard',
  },
  limit_reached: {
    icon: '🔒',
    titleKey: 'limit.title',
    actionPath: '/',
  },
};
