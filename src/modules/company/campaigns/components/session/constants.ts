import type React from 'react';
import {
  Brain, FileText, Zap, BookOpen,
  CheckCircle2, Lock, AlertTriangle, CalendarClock, Trophy, AlertCircle, Loader2,
} from 'lucide-react';
import type { ModuleType, Campaign } from '@/modules/company/campaigns/types/campaign';
import type { ModuleMeta, EligibilityStatus } from './types';
import { fmtDate } from './helpers';

export const MODULE_META: Record<ModuleType, ModuleMeta> = {
  QUESTIONNAIRE: {
    label:       'Questionnaire',
    color:       '#3B82F6',
    bg:          '#EFF6FF',
    border:      '#BFDBFE',
    Icon:        FileText,
    duration:    '~10–15 min',
    description: 'Answer a series of written questions designed to assess your knowledge and profile.',
    bullets: [
      'Multiple formats: text, single/multiple choice, rating',
      'Complete at your own pace — no per-question time limit',
      'Answers submitted once on final completion',
    ],
  },
  AI_INTERVIEW: {
    label:       'AI Interview',
    color:       '#8B5CF6',
    bg:          '#F5F3FF',
    border:      '#DDD6FE',
    Icon:        Brain,
    duration:    '~20–30 min',
    description: 'Engage in a dynamic conversation with our AI interviewer that adapts to your responses.',
    bullets: [
      'Real-time AI-driven conversation',
      'Voice or typed responses supported',
      'Results evaluated and scored automatically',
    ],
  },
  SKILL_TEST: {
    label:       'Skill Assessment',
    color:       '#10B981',
    bg:          '#ECFDF5',
    border:      '#A7F3D0',
    Icon:        Zap,
    duration:    '~15–25 min',
    description: 'Demonstrate your technical proficiency through a structured, practical evaluation.',
    bullets: [
      'Scenario-based technical challenges',
      'Time-measured responses per question',
      'Immediate scoring on completion',
    ],
  },
  TRAINING_PATH: {
    label:       'Training Path',
    color:       '#F59E0B',
    bg:          '#FFFBEB',
    border:      '#FDE68A',
    Icon:        BookOpen,
    duration:    'Variable',
    description: 'Follow a structured learning path tailored to your role and level.',
    bullets: [
      'Self-paced modular content',
      'Progress tracked automatically',
    ],
  },
};

export const ELIGIBILITY_CFG: Record<EligibilityStatus, {
  Icon: React.ElementType;
  alertCls: string;
  iconCls: string;
  title: string;
  subtitle: (c: Campaign | null, r: number | null) => string;
}> = {
  checking: {
    Icon:     Loader2,
    alertCls: 'border-border bg-muted/40',
    iconCls:  'text-muted-foreground animate-spin',
    title:    'Verifying eligibility…',
    subtitle: () => 'Please wait while we check your access.',
  },
  eligible: {
    Icon:     CheckCircle2,
    alertCls: 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20',
    iconCls:  'text-emerald-600',
    title:    "You're eligible to participate",
    subtitle: (_, r) =>
      r !== null && r > 0
        ? `Campaign is active · ${r === 1 ? '1 day' : `${r} days`} left to complete`
        : 'Campaign is active · No deadline set',
  },
  login_required: {
    Icon:     Lock,
    alertCls: 'border-primary/30 bg-primary/5',
    iconCls:  'text-primary',
    title:    'Sign in required',
    subtitle: (c) =>
      c?.accessMethod === 'ACCOUNTS'
        ? 'This campaign requires a TalentAI account to participate.'
        : 'Please sign in to continue.',
  },
  campaign_inactive: {
    Icon:     AlertTriangle,
    alertCls: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20',
    iconCls:  'text-amber-600',
    title:    'Campaign is not active',
    subtitle: (c) =>
      c?.status === 'PAUSED'
        ? 'This campaign is currently paused by the organiser.'
        : c?.status === 'CLOSED'
        ? 'This campaign has been closed.'
        : 'This campaign is not open for participation right now.',
  },
  expired: {
    Icon:     CalendarClock,
    alertCls: 'border-destructive/30 bg-destructive/5',
    iconCls:  'text-destructive',
    title:    'Campaign has expired',
    subtitle: (c) =>
      c?.deadline
        ? `The deadline was ${fmtDate(c.deadline)}. Please contact the organiser.`
        : 'The deadline for this campaign has passed.',
  },
  already_completed: {
    Icon:     Trophy,
    alertCls: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20',
    iconCls:  'text-amber-500',
    title:    "You've already completed this campaign",
    subtitle: (c) =>
      (c as any)?.score != null
        ? `Your score: ${(c as any).score}/100. Great work!`
        : 'You have already submitted your responses.',
  },
  error: {
    Icon:     AlertCircle,
    alertCls: 'border-destructive/30 bg-destructive/5',
    iconCls:  'text-destructive',
    title:    'Could not verify eligibility',
    subtitle: () => 'There was a problem checking your access. Please try again.',
  },
};
