import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/hooks/useNotification';
import { type RootState } from '@/store/store';
import { useCampaignInterviewConfig, type CampaignModuleType } from '../hooks/useCampaignInterviewConfig';
import { useInterviewSession } from '../../shared/hooks/useInterviewSession';
import InterviewScreen from '../../shared/components/session/InterviewScreen';
import InterviewLoadingScreen from '../../shared/components/layout/InterviewLoadingScreen';
import CampaignPreviewPanel from './CampaignPreviewPanel';

interface CampaignInterviewFlowProps {
  campaignId?: string;
  moduleType?: CampaignModuleType;
}

export default function CampaignInterviewFlow({
  campaignId: propCampaignId,
  moduleType: propModuleType,
}: CampaignInterviewFlowProps = {}) {
  const { t } = useTranslation('modules/interview/campaign-interview');
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const { notification, showNotification, hideNotification } = useNotification();

  const overrides = propCampaignId !== undefined
    ? { campaignId: propCampaignId, moduleType: propModuleType }
    : undefined;

  const {
    interviewConfig,
    setInterviewConfig,
    campaignId,
    moduleType,
    isReady,
  } = useCampaignInterviewConfig(overrides);

  const [step, setStep] = useState<'preview' | 'interview'>('preview');

  const session = useInterviewSession({
    interviewConfig: interviewConfig as any,
    setInterviewConfig: setInterviewConfig as any,
    authUser,
    jobData: null,
    notify: showNotification,
    namespace: '/campaign-interview',
  });

  const handleStartInterview = useCallback(() => {
    setStep('interview');
  }, []);

  if (!isReady || !campaignId || !moduleType) {
    return (
      <InterviewLoadingScreen
        title={t('loading.title')}
        subtitle={t('loading.subtitle')}
      />
    );
  }

  if (step === 'preview') {
    return (
      <CampaignPreviewPanel
        moduleType={moduleType}
        onStartInterview={authUser ? handleStartInterview : undefined}
      />
    );
  }

  return (
    <InterviewScreen
      session={session}
      configData={{ jobData: null, interviewConfig: interviewConfig as any }}
      notification={notification}
      hideNotification={hideNotification}
      onBack={() => {
        console.log('[Campaign] Interview ended', { campaignId, moduleType });
        setStep('preview');
      }}
    />
  );
}
