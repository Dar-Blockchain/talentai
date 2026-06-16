import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNotification } from '@/hooks/useNotification';
import { type RootState } from '@/store/store';
import { useSkillInterviewConfig } from '../hooks/useSkillInterviewConfig';
import { useInterviewSession } from '../../shared/hooks/useInterviewSession';
import InterviewScreen from '../../shared/components/session/InterviewScreen';
import InterviewLoadingScreen from '../../shared/components/layout/InterviewLoadingScreen';
import SkillPreviewPanel from './skill-preview/SkillPreviewPanel';

export default function SkillInterviewFlow() {
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const { notification, showNotification, hideNotification } = useNotification();

  const {
    interviewConfig, setInterviewConfig,
    skill, proficiency, category, duration, language,
    isReady,
  } = useSkillInterviewConfig();

  const [step, setStep] = useState<'preview' | 'interview'>('preview');

  const session = useInterviewSession({
    interviewConfig,
    setInterviewConfig,
    authUser,
    jobData: null,
    notify: showNotification,
  });

  const handleStartInterview = useCallback(() => {
    setStep('interview');
  }, []);

  if (!isReady || !skill) {
    return (
      <InterviewLoadingScreen
        title="Loading skill interview"
        subtitle="Preparing your assessment…"
      />
    );
  }

  if (step === 'preview') {
    return (
      <SkillPreviewPanel
        skill={skill}
        proficiency={proficiency}
        category={category}
        duration={duration}
        language={language}
        onStartInterview={authUser ? handleStartInterview : undefined}
      />
    );
  }

  return (
    <InterviewScreen
      session={session}
      configData={{ jobData: null, interviewConfig }}
      notification={notification}
      hideNotification={hideNotification}
      onBack={() => setStep('preview')}
    />
  );
}
