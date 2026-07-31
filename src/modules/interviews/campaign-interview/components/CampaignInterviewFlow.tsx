import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type RootState } from '@/store/store';
import { useCampaignInterviewConfig, type CampaignModuleType } from '../hooks/useCampaignInterviewConfig';
import type { InterviewConfig } from '../../shared/types/interview';
import { useInterviewSession } from '../../shared/hooks/useInterviewSession';
import InterviewScreen from '../../shared/components/session/InterviewScreen';
import InterviewLoadingScreen from '../../shared/components/layout/InterviewLoadingScreen';
import { CampaignInterviewCompletedScreen } from './CampaignInterviewCompletedScreen';

interface CampaignInterviewFlowProps {
  campaignId?: string;
  moduleType?: CampaignModuleType;
  campaignTitle?: string;
  participantId?: string;
  onBack?: () => void;
  onComplete?: () => void;
}

export default function CampaignInterviewFlow({
  campaignId: propCampaignId,
  moduleType: propModuleType,
  campaignTitle,
  participantId,
  onBack,
  onComplete,
}: CampaignInterviewFlowProps = {}) {
  const { t } = useTranslation('modules/interview/campaign-interview');
  const { t: td } = useTranslation('dashboard');
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
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

  const session = useInterviewSession({
    interviewConfig,
    setInterviewConfig: setInterviewConfig as (config: InterviewConfig) => void,
    authUser,
    jobData: null,
    namespace: '/campaign-interview',
    candidateIdOverride: participantId || undefined,
  });

  if (!isReady || !campaignId || !moduleType) {
    return (
      <InterviewLoadingScreen
        title={t('loading.title')}
        subtitle={t('loading.subtitle')}
      />
    );
  }

  if (session.resultsReady) {
    return (
      <CampaignInterviewCompletedScreen
        campaignId={campaignId}
        campaignTitle={campaignTitle}
        participantId={participantId}
        isLoggedIn={!!authUser?._id}
        onDone={onComplete ?? onBack ?? (() => {})}
      />
    );
  }

  const moduleLabel = td(`pages.campaigns.module.${moduleType}`);
  const sessionTitle = campaignTitle ? `${campaignTitle} — ${moduleLabel}` : moduleLabel;

  return (
    <InterviewScreen
      session={session}
      configData={{ jobData: null, interviewConfig }}
      titleOverride={sessionTitle}
      backLabel={t('back_to_campaign')}
      onBack={onBack}
    />
  );
}
