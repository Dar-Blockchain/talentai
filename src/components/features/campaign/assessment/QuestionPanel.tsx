import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimerIcon       from '@mui/icons-material/Timer';
import { InterviewMessage } from '@/types/interview';

interface QuestionPanelProps {
  currentMessage:    InterviewMessage;
  isInReadingTime:   boolean;
  readingTimeLeft:   number;
  questionHighlight: boolean;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentMessage, isInReadingTime, readingTimeLeft, questionHighlight,
}) => {
  const isFollowUp = currentMessage.type === 'follow_up';

  return (
    <Box sx={{
      p: { xs: 3, md: 4 },
      transition: 'all 0.25s ease',
      transform: questionHighlight ? 'scale(1.005)' : 'none',
    }}>

      {/* Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 26, height: 26, borderRadius: '8px',
            background: isFollowUp
              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
              : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 13, color: '#fff' }} />
          </Box>
          <Typography sx={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: isFollowUp ? '#FCD34D' : '#A78BFA',
          }}>
            {isFollowUp ? 'Follow-up' : 'Question'}
          </Typography>
        </Box>

        {isInReadingTime && (
          <Chip
            icon={<TimerIcon sx={{ fontSize: '13px !important', color: '#FCD34D !important' }} />}
            label={`${Math.ceil(readingTimeLeft / 1000)}s`}
            size="small"
            sx={{
              fontWeight: 700, fontSize: 11,
              bgcolor: 'rgba(245,158,11,0.15)',
              color: '#FCD34D',
              border: '1px solid rgba(245,158,11,0.25)',
              height: 24,
            }}
          />
        )}
      </Box>

      {/* Question text */}
      <Typography sx={{
        fontSize: { xs: '1.05rem', md: '1.2rem' },
        fontWeight: 500,
        lineHeight: 1.75,
        color: '#0F172A',
        letterSpacing: '0.01em',
      }}>
        {currentMessage.content || 'Getting next question…'}
      </Typography>

      {currentMessage.reasoning && (
        <Typography sx={{
          fontSize: '0.78rem',
          color: '#94A3B8',
          fontStyle: 'italic',
          mt: 2,
          pl: 1.5,
          borderLeft: '2px solid rgba(139,92,246,0.3)',
          lineHeight: 1.6,
        }}>
          {currentMessage.reasoning}
        </Typography>
      )}
    </Box>
  );
};

export default QuestionPanel;
