import React from 'react';
import { Box, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { type InterviewMessage } from '../../types/interview';
import { type AgentState } from '../../types/interview';

interface QuestionPanelProps {
  currentMessage: InterviewMessage;
  isInReadingTime: boolean;
  readingTimeLeft: number;
  questionHighlight: boolean;
  questionNumber?: number;
  questionAnswerElapsed?: number;
  questionAnswerRemaining?: number;
  agentState?: AgentState;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentMessage,
  isInReadingTime,
  readingTimeLeft,
  questionHighlight,
  questionNumber,
  questionAnswerElapsed = 0,
  questionAnswerRemaining = 0,
  agentState,
}) => {
  const { t } = useTranslation('interview');
  const secondsLeft  = Math.ceil(readingTimeLeft / 1000);
  const progressPct  = Math.max(0, Math.min(100, (readingTimeLeft / 10000) * 100));

  const remainingSec = Math.ceil(questionAnswerRemaining / 1000);
  const answerPct    = Math.max(0, Math.min(100, (questionAnswerElapsed / 180000) * 100));
  const isAnswering  = !isInReadingTime && questionAnswerElapsed > 0;
  const isNearLimit  = remainingSec <= 30 && isAnswering;
  const isCritical   = remainingSec <= 10 && isAnswering;

  // Show "next question loading" overlay when AI is thinking after answering
  const isLoadingNext = agentState === 'thinking' && !isInReadingTime;

  const fmtSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const timerColor  = isCritical ? '#dc2626' : isNearLimit ? '#f97316' : '#10453F';
  const timerBg     = isCritical ? 'rgba(220,38,38,0.08)' : isNearLimit ? 'rgba(249,115,22,0.08)' : 'rgba(16,69,63,0.05)';
  const timerBorder = isCritical ? 'rgba(220,38,38,0.35)' : isNearLimit ? 'rgba(249,115,22,0.35)' : 'rgba(106,211,156,0.35)';
  const accentColor = isCritical ? '#dc2626' : isNearLimit ? '#f97316' : '#6AD39C';

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: questionHighlight ? 'linear-gradient(135deg, #f0fdf8 0%, #fff 100%)' : '#fff',
        borderRadius: '18px',
        border: '1px solid rgba(106,211,156,0.2)',
        borderLeft: isInReadingTime
          ? '4px solid #f59e0b'
          : isLoadingNext
          ? '4px solid #6AD39C'
          : isNearLimit
          ? `4px solid ${accentColor}`
          : '4px solid #6AD39C',
        boxShadow: isCritical
          ? '0 2px 20px rgba(220,38,38,0.12)'
          : isInReadingTime
          ? '0 2px 20px rgba(245,158,11,0.1)'
          : questionHighlight
          ? '0 6px 28px rgba(106,211,156,0.2)'
          : '0 2px 14px rgba(16,69,63,0.06)',
        px: { xs: 1.75, md: 2.25 },
        py: { xs: 1.5, md: 1.75 },
        mb: 1,
        transform: questionHighlight ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.4s ease',
        ...(isCritical && {
          '@keyframes criticalPulse': {
            '0%, 100%': { boxShadow: '0 2px 20px rgba(220,38,38,0.12)' },
            '50%':       { boxShadow: '0 2px 32px rgba(220,38,38,0.28)' },
          },
          animation: 'criticalPulse 1.1s ease-in-out infinite',
        }),
      }}
    >
      {/* ── Label row ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>

        {/* Left: question label */}
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

        {/* Right: timer badge */}
        {isInReadingTime ? (
          /* Reading phase */
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 1, py: 0.45, borderRadius: '9px',
            bgcolor: 'rgba(245,158,11,0.08)',
            border: '1.5px solid rgba(245,158,11,0.28)',
          }}>
            <Typography sx={{
              fontFamily: 'Poppins', fontWeight: 500, fontSize: '0.5rem',
              color: '#d97706', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Read in
            </Typography>
            <Typography sx={{
              fontFamily: 'Poppins', fontWeight: 800, fontSize: '1rem', lineHeight: 1, color: '#d97706',
            }}>
              {secondsLeft}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.52rem', color: '#d97706', opacity: 0.75 }}>
              s
            </Typography>
          </Box>
        ) : isAnswering ? (
          /* Answer countdown — remaining only */
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.6,
            px: 1.1, py: 0.55, borderRadius: '10px',
            bgcolor: timerBg,
            border: `1.5px solid ${timerBorder}`,
            transition: 'background 0.4s, border-color 0.4s',
          }}>
            <TimerOutlinedIcon sx={{
              fontSize: 14, color: accentColor,
              transition: 'color 0.4s',
              ...(isCritical && {
                '@keyframes timerPulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%':       { opacity: 0.4 },
                },
                animation: 'timerPulse 0.8s ease-in-out infinite',
              }),
            }} />
            <Box>
              <Typography sx={{
                fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.92rem',
                lineHeight: 1, color: timerColor, transition: 'color 0.4s',
              }}>
                {fmtSec(remainingSec)}
              </Typography>
              <Typography sx={{
                fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.4rem',
                color: accentColor, letterSpacing: '0.08em', textTransform: 'uppercase',
                lineHeight: 1.3, mt: 0.15, transition: 'color 0.4s',
              }}>
                remaining
              </Typography>
            </Box>
          </Box>
        ) : null}
      </Box>

      {/* ── Question text ── */}
      <Typography sx={{
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        fontSize: { xs: '1rem', md: '1.08rem' },
        lineHeight: 1.75, color: '#0d1117',
        letterSpacing: '-0.01em', wordBreak: 'break-word',
        textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased',
        opacity: isLoadingNext ? 0.4 : 1,
        transition: 'opacity 0.3s ease',
      }}>
        {currentMessage.content || t('question.getting_next')}
      </Typography>

      {currentMessage.reasoning && !isLoadingNext && (
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

      {/* ── "Next question loading" overlay ── */}
      {isLoadingNext && (
        <Box sx={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '18px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(3px)',
          '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
          animation: 'fadeIn 0.3s ease',
        }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.25,
            px: 2, py: 1,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f0fdf8, #fff)',
            border: '1.5px solid rgba(106,211,156,0.4)',
            boxShadow: '0 4px 16px rgba(106,211,156,0.15)',
          }}>
            {/* Animated dots */}
            <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <Box key={i} sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: '#6AD39C',
                  '@keyframes bounce': {
                    '0%, 80%, 100%': { transform: 'scale(0.7)', opacity: 0.5 },
                    '40%':            { transform: 'scale(1)',   opacity: 1   },
                  },
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </Box>
            <Typography sx={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.8rem',
              color: '#10453F', letterSpacing: '0.01em',
            }}>
              Preparing next question
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 15, color: '#6AD39C' }} />
          </Box>
        </Box>
      )}

      {/* ── Progress bar — reading (amber) | answering (green→orange→red) ── */}
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        bgcolor: isInReadingTime ? 'rgba(245,158,11,0.1)' : 'rgba(106,211,156,0.1)',
        opacity: isInReadingTime || isAnswering ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}>
        <Box sx={{
          height: '100%',
          width: isInReadingTime ? `${progressPct}%` : `${answerPct}%`,
          background: isInReadingTime
            ? 'linear-gradient(90deg,#fde68a,#f59e0b)'
            : isCritical
              ? 'linear-gradient(90deg,#fca5a5,#dc2626)'
              : isNearLimit
                ? 'linear-gradient(90deg,#fdba74,#f97316)'
                : 'linear-gradient(90deg,#6AD39C,#10453F)',
          transition: 'width 0.5s linear, background 0.5s ease',
          borderRadius: '0 2px 2px 0',
        }} />
      </Box>
    </Box>
  );
};

export default QuestionPanel;
