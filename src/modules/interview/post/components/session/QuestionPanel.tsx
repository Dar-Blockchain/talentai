import React from 'react';
import { Box, Typography } from '@mui/material';
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
  const secondsLeft = Math.ceil(readingTimeLeft / 1000);
  const progressPct = Math.max(0, Math.min(100, (readingTimeLeft / 10000) * 100));

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: questionHighlight ? 'linear-gradient(135deg, #f0fdf8 0%, #fff 100%)' : '#fff',
        borderRadius: '18px',
        border: '1px solid rgba(106,211,156,0.2)',
        borderLeft: isInReadingTime ? '4px solid #f59e0b' : '4px solid #6AD39C',
        boxShadow: questionHighlight
          ? '0 6px 28px rgba(106,211,156,0.2)'
          : isInReadingTime
          ? '0 2px 20px rgba(245,158,11,0.1)'
          : '0 2px 14px rgba(16,69,63,0.06)',
        px: { xs: 1.75, md: 2.25 },
        py: { xs: 1.5, md: 1.75 },
        mb: 1,
        transform: questionHighlight ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.4s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Label row — icon + title on left, countdown badge on right */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={0.75}>
          <Box sx={{
            width: 20, height: 20, borderRadius: '6px',
            background: isInReadingTime
              ? 'linear-gradient(135deg,#fbbf24,#d97706)'
              : 'linear-gradient(135deg,#6AD39C,#10453F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'background 0.4s ease',
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 11, color: '#fff' }} />
          </Box>
          <Typography sx={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.62rem',
            color: isInReadingTime ? '#d97706' : '#6AD39C',
            letterSpacing: '0.14em', textTransform: 'uppercase',
            transition: 'color 0.4s ease',
          }}>
            {questionNumber ? t('question.label_numbered', { number: questionNumber }) : t('question.label')}
          </Typography>
        </Box>

        {/* Countdown badge */}
        {isInReadingTime && (
          <Box sx={{
            display: 'flex', alignItems: 'baseline', gap: 0.2,
            px: 0.9, py: 0.35,
            borderRadius: '8px',
            bgcolor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.22)',
          }}>
            <Typography sx={{
              fontFamily: 'Poppins', fontWeight: 800,
              fontSize: '1rem', lineHeight: 1, color: '#d97706',
            }}>
              {secondsLeft}
            </Typography>
            <Typography sx={{
              fontFamily: 'Poppins', fontWeight: 600,
              fontSize: '0.55rem', color: '#d97706', opacity: 0.7,
            }}>
              s
            </Typography>
          </Box>
        )}
      </Box>

      {/* Question text */}
      <Typography sx={{
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        fontSize: { xs: '1rem', md: '1.08rem' },
        lineHeight: 1.75,
        color: '#0d1117',
        letterSpacing: '-0.01em',
        wordBreak: 'break-word',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {currentMessage.content || t('question.getting_next')}
      </Typography>

      {currentMessage.reasoning && (
        <Typography sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.72rem', fontWeight: 400, color: '#6b7280',
          fontStyle: 'italic', mt: 1.25, pl: 1.25,
          borderLeft: '2px solid rgba(106,211,156,0.4)',
          lineHeight: 1.65, letterSpacing: '0.01em',
        }}>
          {currentMessage.reasoning}
        </Typography>
      )}

      {/* ── Progress bar — full-bleed, bottom edge ── */}
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3,
        bgcolor: 'rgba(245,158,11,0.1)',
        opacity: isInReadingTime ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}>
        <Box sx={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'linear-gradient(90deg, #fde68a, #f59e0b)',
          transition: 'width 0.1s linear',
        }} />
      </Box>
    </Box>
  );
};

export default QuestionPanel;
