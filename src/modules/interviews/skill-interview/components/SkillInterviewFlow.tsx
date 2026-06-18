import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type RootState } from '@/store/store';
import { useSkillInterviewConfig, type SkillInterviewOverrides } from '../hooks/useSkillInterviewConfig';
import { useInterviewSession } from '../../shared/hooks/useInterviewSession';
import InterviewScreen from '../../shared/components/session/InterviewScreen';
import InterviewLoadingScreen from '../../shared/components/layout/InterviewLoadingScreen';
import SkillPreviewPanel from './skill-preview/SkillPreviewPanel';

interface SkillInterviewFlowProps {
  skill?: string;
  category?: string;
  language?: string;
}

export default function SkillInterviewFlow({ skill: propSkill, category: propCategory, language: propLanguage }: SkillInterviewFlowProps = {}) {
  const { t } = useTranslation('modules/interview/skill-interview');
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const overrides: SkillInterviewOverrides | undefined = propSkill !== undefined
    ? { skill: propSkill, category: propCategory, language: propLanguage }
    : undefined;

  const {
    interviewConfig, setInterviewConfig,
    skill, category, language,
    isReady,
  } = useSkillInterviewConfig(overrides);

  const [step, setStep] = useState<'preview' | 'interview'>('preview');

  const session = useInterviewSession({
    interviewConfig,
    setInterviewConfig,
    authUser,
    jobData: null,
  });

  const handleStartInterview = useCallback(() => {
    setStep('interview');
  }, []);

  if (!isReady || !skill) {
    return (
      <InterviewLoadingScreen
        title={t('loading.title')}
        subtitle={t('loading.subtitle')}
      />
    );
  }

  if (step === 'preview') {
    return (
      <SkillPreviewPanel
        skill={skill}
        category={category}
        language={language}
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
