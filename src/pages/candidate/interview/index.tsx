'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { EligibilityGate, InterviewFlow, useEligibilityCheck } from '@/modules/interview/post';
import InterviewHeader from '@/modules/interview/post/components/layout/InterviewHeader';

const CandidateInterview = () => {
  const { eligibilityStatus, eligibilityMeta } = useEligibilityCheck();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
      <InterviewHeader />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {eligibilityStatus !== 'eligible' && eligibilityStatus !== 'checking'
          ? <EligibilityGate status={eligibilityStatus} meta={eligibilityMeta} />
          : <InterviewFlow />}
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterview), { ssr: false });
