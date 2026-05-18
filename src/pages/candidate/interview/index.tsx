'use client';

import dynamic from 'next/dynamic';
import { useEligibilityCheck, EligibilityGate, InterviewFlow } from '@/modules/candidate-interview';

const CandidateInterview = () => {
  const { eligibilityStatus, eligibilityMeta } = useEligibilityCheck();

  if (eligibilityStatus !== 'eligible') {
    return <EligibilityGate status={eligibilityStatus} meta={eligibilityMeta} />;
  }

  return <InterviewFlow />;
};

export default dynamic(() => Promise.resolve(CandidateInterview), { ssr: false });
