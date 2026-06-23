import { type EligibilityStatus } from '../types/api';

export type BlockableStatus = Exclude<EligibilityStatus, 'checking' | 'eligible' | 'no_link'>;

export type ScreenEntry = {
  icon: string;
  titleKey?: string;
  descKey?: string;
  actionPath: string;
  actionLabelKey?: string;
  actionReplace?: boolean;
};

export const ELIGIBILITY_SCREEN_CONFIG: Record<BlockableStatus, ScreenEntry> = {
  company_blocked: {
    icon: '🏢',
    titleKey: 'company_only.title',
    descKey: 'company_only.desc',
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
  no_cv: {
    icon: '📄',
    titleKey: 'no_cv.title',
    descKey: 'no_cv.desc',
    actionLabelKey: 'no_cv.action',
    actionPath: '/settings',
  },
  error: {
    icon: '⚠️',
    titleKey: 'no_link.title',
    actionPath: '/candidate/dashboard',
  },
};
