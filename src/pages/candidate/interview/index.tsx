'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { EligibilityGate, InterviewFlow, useEligibilityCheck } from '@/modules/interview/post';
import InterviewHeader from '@/modules/interview/post/components/layout/InterviewHeader';
import InterviewLoadingScreen from '@/modules/interview/post/components/layout/InterviewLoadingScreen';

const CandidateInterview = () => {
  const { eligibilityStatus, eligibilityMeta } = useEligibilityCheck();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
      <InterviewHeader />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* 1. Verifying eligibility */}
        {eligibilityStatus === 'checking' && (
          <InterviewLoadingScreen
            title="Verifying your access"
            subtitle="Checking your eligibility before loading the interview."
          />
        )}

        {/* 2. Not eligible — gate blocks entry */}
        {eligibilityStatus !== 'eligible' && eligibilityStatus !== 'checking' && (
          <EligibilityGate status={eligibilityStatus} meta={eligibilityMeta} />
        )}

        {/* 3. Confirmed eligible — fetch job post and start interview */}
        {eligibilityStatus === 'eligible' && <InterviewFlow />}

      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterview), { ssr: false });
