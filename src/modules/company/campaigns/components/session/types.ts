import type React from 'react';

export type EligibilityStatus =
  | 'checking'
  | 'eligible'
  | 'login_required'
  | 'campaign_inactive'
  | 'expired'
  | 'already_completed'
  | 'error';

export type ModuleMeta = {
  label: string;
  color: string;
  bg: string;
  border: string;
  Icon: React.ElementType;
  duration: string;
  description: string;
  bullets: string[];
};

export type DeadlineBadge = { text: string; urgent: boolean };
