import React from 'react';
import { useTranslation } from 'react-i18next';
import InterviewLoadingScreen from '../../shared/components/layout/InterviewLoadingScreen';
import EligibilityGate from './eligibility/EligibilityGate';
import InterviewFlow from './InterviewFlow';
import { useEligibilityCheck } from '../hooks/useEligibilityCheck';

interface PostInterviewFlowProps {
  jobId: string;
  /** Called whenever the flow moves between the job preview and the live interview (e.g. to hide the site nav during the interview). */
  onPhaseChange?: (phase: 'preview' | 'interview') => void;
}

export default function PostInterviewFlow({ jobId, onPhaseChange }: PostInterviewFlowProps) {
  const { t } = useTranslation('modules/interview/interview');
  const { eligibilityStatus, eligibilityMeta } = useEligibilityCheck(jobId);

  if (eligibilityStatus === 'checking')
    return (
      <InterviewLoadingScreen
        title={t('checking.title')}
        subtitle={t('checking.subtitle')}
      />
    );

  if (eligibilityStatus !== 'eligible')
    return <EligibilityGate status={eligibilityStatus} meta={eligibilityMeta} />;

  return <InterviewFlow jobId={jobId} onPhaseChange={onPhaseChange} />;
}
