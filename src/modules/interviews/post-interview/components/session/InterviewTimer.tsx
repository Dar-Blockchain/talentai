import React from 'react';
import { Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface InterviewTimerProps {
  elapsedTime: number;
  timeWarning: boolean;
}

const InterviewTimer: React.FC<InterviewTimerProps> = ({ elapsedTime, timeWarning }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
      bgcolor: timeWarning ? 'rgba(239,68,68,0.1)' : 'rgba(11,11,15,0.06)',
      border: `1px solid ${timeWarning ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: '40px',
      px: 1.25,
      py: 0.4,
    }}
  >
    {timeWarning
      ? <WarningIcon sx={{ fontSize: 12, color: '#ef4444' }} />
      : <AccessTimeIcon sx={{ fontSize: 12, color: '#6B7280' }} />}
    <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: timeWarning ? '#ef4444' : '#374151', letterSpacing: '0.04em' }}>
      {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
    </Typography>
  </Box>
);

export default InterviewTimer;
