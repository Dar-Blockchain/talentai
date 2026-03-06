import React from 'react';
import { Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface InterviewTimerProps {
  elapsedTime: number;
  timeWarning: boolean;
}

const InterviewTimer: React.FC<InterviewTimerProps> = ({
  elapsedTime,
  timeWarning,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: timeWarning ? 'rgba(239,68,68,0.92)' : 'rgba(11,11,15,0.88)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${timeWarning ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '40px',
          px: 2.5,
          py: 1,
          boxShadow: timeWarning ? '0 4px 20px rgba(239,68,68,0.35)' : '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {timeWarning
          ? <WarningIcon sx={{ fontSize: 16, color: '#fff' }} />
          : <AccessTimeIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />}
        <Typography
          sx={{
            fontFamily: 'Poppins',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#fff',
            letterSpacing: '0.04em',
          }}
        >
          {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
        </Typography>
      </Box>
    </Box>
  );
};

export default InterviewTimer;
