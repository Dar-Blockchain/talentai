'use client';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { EligibilityGate, InterviewFlow, useEligibilityCheck } from '@/modules/interviews/post-interview';
import InterviewHeader from '@/modules/interviews/shared/components/layout/InterviewHeader';
import InterviewLoadingScreen from '@/modules/interviews/shared/components/layout/InterviewLoadingScreen';

const CandidateInterview = () => {
  const { t } = useTranslation('modules/interview/interview');
  const { eligibilityStatus, eligibilityMeta } = useEligibilityCheck();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <InterviewHeader />
      <div className="flex-1 flex flex-col">

        {eligibilityStatus === 'checking' && (
          <InterviewLoadingScreen
            title={t('checking.title')}
            subtitle={t('checking.subtitle')}
          />
        )}

        {eligibilityStatus !== 'eligible' && eligibilityStatus !== 'checking' && (
          <EligibilityGate status={eligibilityStatus} meta={eligibilityMeta} />
        )}

        {eligibilityStatus === 'eligible' && <InterviewFlow />}

      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterview), { ssr: false });
