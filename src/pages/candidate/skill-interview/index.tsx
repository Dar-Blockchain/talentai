'use client';

import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import InterviewHeader from '@/modules/interviews/shared/components/layout/InterviewHeader';
import { SkillInterviewFlow } from '@/modules/interviews/skill-interview';

const SkillInterviewPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
      <InterviewHeader />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <SkillInterviewFlow />
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(SkillInterviewPage), { ssr: false });
