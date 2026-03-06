import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { InterviewMessage } from '@/types/interview';

interface QuestionPanelProps {
  currentMessage: InterviewMessage;
  isInReadingTime: boolean;
  readingTimeLeft: number;
  questionHighlight: boolean;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentMessage,
  isInReadingTime,
  readingTimeLeft,
  questionHighlight,
}) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: '#fff',
        borderRadius: '0 0 16px 16px',
        border: '1px solid #e5e7eb',
        borderTop: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 2, md: 2.5 },
        mb: 2,
        transform: questionHighlight ? 'translateY(1px)' : 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        ...(questionHighlight && { boxShadow: '0 6px 24px rgba(131,16,255,0.12)' }),
      }}
    >
      {/* Label row */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              bgcolor: 'rgba(131,16,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HelpOutlineIcon sx={{ fontSize: 16, color: '#8310FF' }} />
          </Box>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem', color: '#8310FF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Question
          </Typography>
        </Box>
        {isInReadingTime && (
          <Chip
            icon={<TimerIcon sx={{ fontSize: '14px !important' }} />}
            label={`${Math.ceil(readingTimeLeft / 1000)}s`}
            size="small"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '0.75rem',
              bgcolor: 'rgba(245,158,11,0.1)',
              color: '#d97706',
              border: '1px solid rgba(245,158,11,0.3)',
              '& .MuiChip-icon': { color: '#d97706' },
            }}
          />
        )}
      </Box>

      {/* Question text */}
      <Typography
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 500,
          fontSize: { xs: '1rem', md: '1.1rem' },
          lineHeight: 1.65,
          color: '#111827',
        }}
      >
        {currentMessage.content || 'Getting next question…'}
      </Typography>

      {/* Reasoning hint */}
      {currentMessage.reasoning && (
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#6b7280', fontStyle: 'italic', mt: 1.5, pl: 1, borderLeft: '3px solid rgba(131,16,255,0.2)' }}>
          {currentMessage.reasoning}
        </Typography>
      )}
    </Box>
  );
};

export default QuestionPanel;
