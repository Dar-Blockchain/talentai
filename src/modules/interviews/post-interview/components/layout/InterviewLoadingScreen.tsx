import React from 'react';
import { Box, Typography } from '@mui/material';

interface InterviewLoadingScreenProps {
  title?: string;
  subtitle?: string;
}

const InterviewLoadingScreen: React.FC<InterviewLoadingScreenProps> = ({
  title    = 'Loading interview',
  subtitle = 'Please wait a moment…',
}) => (
  <Box sx={{
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 0, px: 2, minHeight: '60vh',
  }}>
    {/* Dual counter-rotating arcs */}
    <Box sx={{ position: 'relative', width: 72, height: 72, mb: 3, flexShrink: 0 }}>
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(106,211,156,0.12)' }} />
      <Box sx={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '2.5px solid transparent',
        borderTopColor: '#6AD39C',
        borderRightColor: 'rgba(106,211,156,0.25)',
        animation: 'ilsSpin 1s linear infinite',
        '@keyframes ilsSpin': { to: { transform: 'rotate(360deg)' } },
      }} />
      <Box sx={{
        position: 'absolute', inset: 12, borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: 'rgba(106,211,156,0.45)',
        animation: 'ilsSpinRev 1.6s linear infinite reverse',
        '@keyframes ilsSpinRev': { to: { transform: 'rotate(360deg)' } },
      }} />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          width: 10, height: 10, borderRadius: '50%', bgcolor: '#6AD39C',
          animation: 'ilsPulse 1.4s ease-in-out infinite',
          '@keyframes ilsPulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.35, transform: 'scale(0.55)' } },
        }} />
      </Box>
    </Box>

    <Typography sx={{
      fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem',
      color: '#0d1117', letterSpacing: '-0.01em', mb: 0.5, textAlign: 'center',
    }}>
      {title}
    </Typography>
    <Typography sx={{
      fontFamily: 'Poppins', fontSize: '0.74rem', color: '#6b7280',
      lineHeight: 1.65, textAlign: 'center', maxWidth: 240, mb: 3,
    }}>
      {subtitle}
    </Typography>

    <Box sx={{ display: 'flex', gap: 0.875 }}>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={{
          width: 6, height: 6, borderRadius: '50%', bgcolor: '#6AD39C',
          animation: `ilsDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          '@keyframes ilsDot': { '0%,100%': { opacity: 0.2, transform: 'scale(0.75)' }, '50%': { opacity: 1, transform: 'scale(1.2)' } },
        }} />
      ))}
    </Box>
  </Box>
);

export default InterviewLoadingScreen;
