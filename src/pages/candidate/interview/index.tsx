'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import InterviewHeader from '@/modules/candidate-interview/components/layout/InterviewHeader';
import { useEligibilityCheck, EligibilityGate, InterviewFlow } from '@/modules/candidate-interview';

const CandidateInterview = () => {
  const { eligibilityStatus, eligibilityMeta } = useEligibilityCheck();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
      <InterviewHeader />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {eligibilityStatus !== 'eligible'
          ? <EligibilityGate status={eligibilityStatus} meta={eligibilityMeta} />
          : <InterviewFlow />}
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterview), { ssr: false });
