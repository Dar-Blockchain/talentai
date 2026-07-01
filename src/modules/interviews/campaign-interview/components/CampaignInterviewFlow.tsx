import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { type RootState } from '@/store/store';
import { useCampaignInterviewConfig, type CampaignModuleType } from '../hooks/useCampaignInterviewConfig';
import { useInterviewSession } from '../../shared/hooks/useInterviewSession';
import InterviewScreen from '../../shared/components/session/InterviewScreen';
import InterviewLoadingScreen from '../../shared/components/layout/InterviewLoadingScreen';

interface CampaignInterviewFlowProps {
  campaignId?: string;
  moduleType?: CampaignModuleType;
  onBack?: () => void;
}

export default function CampaignInterviewFlow({
  campaignId: propCampaignId,
  moduleType: propModuleType,
  onBack,
}: CampaignInterviewFlowProps = {}) {
  const { t } = useTranslation('modules/interview/campaign-interview');
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const overrides = propCampaignId !== undefined
    ? { campaignId: propCampaignId, moduleType: propModuleType }
    : undefined;

  const { interviewConfig, setInterviewConfig, campaignId, moduleType, isReady } =
    useCampaignInterviewConfig(overrides);

  const session = useInterviewSession({
    interviewConfig: interviewConfig as any,
    setInterviewConfig: setInterviewConfig as any,
    authUser,
    jobData: null,
    namespace: '/campaign-interview',
  });

  if (!isReady || !campaignId || !moduleType) {
    return (
      <InterviewLoadingScreen
        title={t('loading.title')}
        subtitle={t('loading.subtitle')}
      />
    );
  }

  return (
    <InterviewScreen
      session={session}
      configData={{ jobData: null, interviewConfig: interviewConfig as any }}
      onBack={onBack}
    />
  );
}
