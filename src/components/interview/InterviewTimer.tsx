import React from 'react';
import { Box, Chip } from '@mui/material';
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
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}
    >
      <Chip
        icon={timeWarning ? <WarningIcon /> : <AccessTimeIcon />}
        label={`${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`}
        color={timeWarning ? 'warning' : 'default'}
        variant="filled"
        sx={{
          color: 'white',
          bgcolor: timeWarning ? 'rgba(255, 152, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          px: 3,
          py: 2.5,
          fontWeight: 600,
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      />
    </Box>
  );
};

export default InterviewTimer;
