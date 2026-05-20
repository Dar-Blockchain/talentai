import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import { type InterviewMessage } from '../../types/interview';

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
        background: questionHighlight
          ? 'linear-gradient(135deg, #f0fdf8 0%, #fff 100%)'
          : '#fff',
        borderRadius: '18px',
        borderTop: '1px solid rgba(106,211,156,0.2)',
        borderRight: '1px solid rgba(106,211,156,0.2)',
        borderBottom: '1px solid rgba(106,211,156,0.2)',
        borderLeft: '4px solid #6AD39C',
        boxShadow: questionHighlight
          ? '0 6px 28px rgba(106,211,156,0.2)'
          : '0 2px 14px rgba(16,69,63,0.06)',
        px: { xs: 1.75, md: 2.25 },
        py: { xs: 1.5, md: 1.75 },
        mb: 1,
        transform: questionHighlight ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Box flex={1} minWidth={0}>
          {/* Label row */}
          <Box display="flex" alignItems="center" gap={0.75} mb={1}>
            <Box sx={{ width: 20, height: 20, borderRadius: '6px', background: 'linear-gradient(135deg,#6AD39C,#10453F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AutoAwesomeIcon sx={{ fontSize: 11, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.62rem', color: '#6AD39C', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {questionNumber ? t('question.label_numbered', { number: questionNumber }) : t('question.label')}
            </Typography>
          </Box>

          {/* Question text */}
          <Typography sx={{
            fontFamily: '"Inter", "Poppins", sans-serif',
            fontWeight: 500,
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.7,
            color: '#0f172a',
            letterSpacing: '0.01em',
            wordBreak: 'break-word',
          }}>
            {currentMessage.content || t('question.getting_next')}
          </Typography>

          {currentMessage.reasoning && (
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem', color: '#6b7280', fontStyle: 'italic', mt: 1, pl: 1.25, borderLeft: '2px solid rgba(106,211,156,0.35)', lineHeight: 1.6 }}>
              {currentMessage.reasoning}
            </Typography>
          )}
        </Box>

        {isInReadingTime && (
          <Box sx={{ flexShrink: 0 }}>
            <Chip
              icon={<TimerIcon sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
              label={`${Math.ceil(readingTimeLeft / 1000)}s`}
              size="small"
              sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', bgcolor: 'rgba(245,158,11,0.08)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)', height: 28 }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default QuestionPanel;
