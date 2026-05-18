import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InterviewTimer from './InterviewTimer';

interface Props {
  label: string;
  subtitle?: string;
  isActive: boolean;
  elapsedTime?: number;
  timeWarning?: boolean;
  onEndInterview: () => void;
  endInterviewLabel: string;
}

export default function InterviewSessionHeader({
  label,
  subtitle,
  isActive,
  elapsedTime,
  timeWarning,
  onEndInterview,
  endInterviewLabel,
}: Props) {
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '20px', border: '1px solid #e8e2f5', px: { xs: 2.5, md: 3.5 }, py: { xs: 2, md: 2.5 }, mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.2 }}>
            {label}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#6B7280', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          {isActive && elapsedTime !== undefined && (
            <InterviewTimer elapsedTime={elapsedTime} timeWarning={timeWarning ?? false} />
          )}
          {isActive && (
            <Button
              variant="contained"
              onClick={onEndInterview}
              sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', textTransform: 'none', bgcolor: '#fef2f2', color: '#ef4444', borderRadius: '12px', px: 3, py: 1.25, boxShadow: 'none', border: '1px solid rgba(239,68,68,0.2)', '&:hover': { bgcolor: '#fee2e2', boxShadow: 'none' } }}
            >
              {endInterviewLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
