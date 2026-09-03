import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import dayjs from '@/lib/dayjs';
import { type AppDispatch, type RootState } from '@/store/store';
import { getMyProfile } from '@/store/slices/userSlice';
import { useSkillInterviewConfig, type SkillInterviewOverrides } from '../hooks/useSkillInterviewConfig';
import { useInterviewSession } from '../../shared/hooks/useInterviewSession';
import InterviewScreen from '../../shared/components/session/InterviewScreen';
import InterviewLoadingScreen from '../../shared/components/layout/InterviewLoadingScreen';
import SkillPreviewPanel from './skill-preview/SkillPreviewPanel';
import SkillQuotaReached from './skill-preview/SkillQuotaReached';

// Skill-test cap per reset cycle. Kept in sync with the candidate-side
// gates (AssessmentModal / CandidateSkills) and the backend $inc quota.
const SKILL_TEST_QUOTA = 5;

interface SkillInterviewFlowProps {
  skill?: string;
  category?: string;
  language?: string;
  skillType?: 'technical' | 'soft';
  /** Called whenever the flow moves between the skill preview and the live interview (e.g. to hide the site nav during the interview). */
  onPhaseChange?: (phase: 'preview' | 'interview') => void;
}

export default function SkillInterviewFlow({ skill: propSkill, category: propCategory, language: propLanguage, skillType: propSkillType, onPhaseChange }: SkillInterviewFlowProps = {}) {
  const { t } = useTranslation('modules/interview/skill-interview');
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);

  // The persisted profile (from login) can carry a stale quota / no
  // quotaResetAt -- refresh it so the gate below is accurate when the
  // /interviews/<session> link is opened directly.
  useEffect(() => { if (authUser) dispatch(getMyProfile()); }, [authUser, dispatch]);

  const quotaUsed = Math.min(profile?.quota ?? 0, SKILL_TEST_QUOTA);
  const quotaReached = !!authUser && quotaUsed >= SKILL_TEST_QUOTA;
  const quotaResetLabel = profile?.quotaResetAt && dayjs(profile.quotaResetAt).isAfter(dayjs())
    ? dayjs(profile.quotaResetAt).format('MMM D, YYYY [at] h:mm A')
    : null;

  const overrides: SkillInterviewOverrides | undefined = propSkill !== undefined
    ? { skill: propSkill, category: propCategory, language: propLanguage, skillType: propSkillType }
    : undefined;

  const {
    interviewConfig, setInterviewConfig,
    skill, category, language,
    isReady,
  } = useSkillInterviewConfig(overrides);

  const [step, setStep] = useState<'preview' | 'interview'>('preview');

  useEffect(() => { onPhaseChange?.(step); }, [step, onPhaseChange]);

  const session = useInterviewSession({
    interviewConfig,
    setInterviewConfig,
    authUser,
    jobData: null,
  });

  const handleStartInterview = useCallback(() => {
    if (quotaReached) return;
    setStep('interview');
  }, [quotaReached]);

  if (!isReady || !skill) {
    return (
      <InterviewLoadingScreen
        title={t('loading.title')}
        subtitle={t('loading.subtitle')}
      />
    );
  }

  // Only block at the preview step -- never yank a candidate out of a live
  // session or their post-interview results (quota hits 5 on completion).
  if (quotaReached && step === 'preview') {
    return <SkillQuotaReached max={SKILL_TEST_QUOTA} resetLabel={quotaResetLabel} />;
  }

  if (step === 'preview') {
    return (
      <SkillPreviewPanel
        skill={skill}
        category={category}
        language={language}
        isSoftSkill={interviewConfig.interviewType === 'SOFT_SKILL'}
        onStartInterview={authUser ? handleStartInterview : undefined}
      />
    );
  }

  return (
    <InterviewScreen
      session={session}
      configData={{ jobData: null, interviewConfig }}
      onBack={() => setStep('preview')}
    />
  );
}
