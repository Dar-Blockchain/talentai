import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { InterviewMessage } from '@/types/interview';
import { useTranslation } from 'react-i18next';

interface QuestionPanelProps {
  currentMessage: InterviewMessage;
  isInReadingTime: boolean;
  readingTimeLeft: number;
  questionHighlight: boolean;
  questionNumber?: number;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentMessage,
  isInReadingTime,
  readingTimeLeft,
  questionHighlight,
  questionNumber,
}) => {
  const { t } = useTranslation('interview');

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 64,
        zIndex: 1000,
        bgcolor: '#fff',
        px: { xs: 2.5, md: 4 },
        py: { xs: 2.5, md: 3 },
        mb: 0,
        borderBottom: '1px solid #f0edf8',
        transform: questionHighlight ? 'translateY(1px)' : 'none',
        transition: 'transform 0.3s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
        {/* Left: label + question */}
        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                background: 'linear-gradient(135deg,#8310FF,#a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 13, color: '#fff' }} />
            </Box>
            <Typography sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '0.65rem',
              color: '#8310FF',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              {questionNumber ? t('question.label_numbered', { number: questionNumber }) : t('question.label')}
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: 'Poppins',
            fontWeight: 600,
            fontSize: { xs: '1rem', md: '1.15rem' },
            lineHeight: 1.7,
            color: '#111827',
          }}>
            {currentMessage.content || t('question.getting_next')}
          </Typography>

          {currentMessage.reasoning && (
            <Typography sx={{
              fontFamily: 'Poppins',
              fontSize: '0.78rem',
              color: '#6b7280',
              fontStyle: 'italic',
              mt: 1.5,
              pl: 1.5,
              borderLeft: '2px solid rgba(131,16,255,0.3)',
              lineHeight: 1.6,
            }}>
              {currentMessage.reasoning}
            </Typography>
          )}
        </Box>

        {/* Right: reading timer */}
        {isInReadingTime && (
          <Box sx={{ flexShrink: 0 }}>
            <Chip
              icon={<TimerIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
              label={`${Math.ceil(readingTimeLeft / 1000)}s`}
              size="small"
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '0.78rem',
                bgcolor: 'rgba(245,158,11,0.1)',
                color: '#d97706',
                border: '1px solid rgba(245,158,11,0.25)',
                height: 28,
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default QuestionPanel;
