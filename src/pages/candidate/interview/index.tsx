'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';
import { EligibilityGate, InterviewFlow, useEligibilityCheck } from '@/modules/interview/post';
import InterviewHeader from '@/modules/interview/post/components/layout/InterviewHeader';

const CandidateInterview = () => {
  const { eligibilityStatus, eligibilityMeta } = useEligibilityCheck();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
      <InterviewHeader />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* 1. Still verifying — hold until the eligibility result is known */}
        {eligibilityStatus === 'checking' && <EligibilityLoadingScreen />}

        {/* 2. Not eligible — gate blocks entry */}
        {eligibilityStatus !== 'eligible' && eligibilityStatus !== 'checking' && (
          <EligibilityGate status={eligibilityStatus} meta={eligibilityMeta} />
        )}

        {/* 3. Confirmed eligible — now fetch job post and start interview */}
        {eligibilityStatus === 'eligible' && <InterviewFlow />}

      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterview), { ssr: false });


// ─── Loading screen ────────────────────────────────────────────────────────────

const EligibilityLoadingScreen: React.FC = () => (
  <Box sx={{
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 0, px: 2,
  }}>
    <Box sx={{ position: 'relative', width: 72, height: 72, mb: 3, flexShrink: 0 }}>
      {/* Static track */}
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(106,211,156,0.12)' }} />
      {/* Outer spinning arc */}
      <Box sx={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '2.5px solid transparent',
        borderTopColor: '#6AD39C',
        borderRightColor: 'rgba(106,211,156,0.25)',
        animation: 'elSpin 1s linear infinite',
        '@keyframes elSpin': { to: { transform: 'rotate(360deg)' } },
      }} />
      {/* Inner reverse arc */}
      <Box sx={{
        position: 'absolute', inset: 12, borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: 'rgba(106,211,156,0.45)',
        animation: 'elSpinRev 1.6s linear infinite reverse',
        '@keyframes elSpinRev': { to: { transform: 'rotate(360deg)' } },
      }} />
      {/* Center dot */}
      <Box sx={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{
          width: 10, height: 10, borderRadius: '50%', bgcolor: '#6AD39C',
          animation: 'elPulse 1.4s ease-in-out infinite',
          '@keyframes elPulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.35, transform: 'scale(0.55)' } },
        }} />
      </Box>
    </Box>

    <Typography sx={{
      fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem',
      color: '#0d1117', letterSpacing: '-0.01em', mb: 0.5, textAlign: 'center',
    }}>
      Verifying your access
    </Typography>
    <Typography sx={{
      fontFamily: 'Poppins', fontSize: '0.74rem', color: '#6b7280',
      lineHeight: 1.65, textAlign: 'center', maxWidth: 240, mb: 3,
    }}>
      Checking your eligibility before loading the interview.
    </Typography>

    {/* Staggered dots */}
    <Box sx={{ display: 'flex', gap: 0.875 }}>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={{
          width: 6, height: 6, borderRadius: '50%', bgcolor: '#6AD39C',
          animation: `elDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          '@keyframes elDot': { '0%,100%': { opacity: 0.2, transform: 'scale(0.75)' }, '50%': { opacity: 1, transform: 'scale(1.2)' } },
        }} />
      ))}
    </Box>
  </Box>
);
