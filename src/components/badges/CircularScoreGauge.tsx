import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface CircularScoreGaugeProps {
  score: number;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
}

const CircularScoreGauge: React.FC<CircularScoreGaugeProps> = ({
  score,
  size = 120,
  thickness = 8,
  color = '#10B981',
  backgroundColor = '#E5E7EB',
  label = 'Score'
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background Circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={thickness}
          sx={{
            color: backgroundColor,
            position: 'absolute'
          }}
        />
        {/* Progress Circle */}
        <CircularProgress
          variant="determinate"
          value={score}
          size={size}
          thickness={thickness}
          sx={{
            color: color,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }}
        />
        {/* Score Text */}
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              color: '#111827',
              fontSize: size > 100 ? '1.5rem' : '1.25rem'
            }}
          >
            {Math.round(score)}%
          </Typography>
        </Box>
      </Box>
      {/* Label */}
      <Typography
        variant="caption"
        sx={{
          mt: 1,
          color: '#6B7280',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default CircularScoreGauge;
