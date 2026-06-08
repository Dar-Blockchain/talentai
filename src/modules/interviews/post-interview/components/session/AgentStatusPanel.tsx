import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useTranslation } from 'react-i18next';
import { type InterviewStatus, type AgentState } from '../../types/interview';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState: AgentState;
  isVoiceActive?: boolean;
  currentTranscript?: string;
  canSubmit?: boolean;
  isInReadingTime?: boolean;
  readingTimeLeft?: number;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  interviewStatus,
  agentState,
  isVoiceActive,
  currentTranscript,
  canSubmit = false,
  isInReadingTime = false,
  readingTimeLeft = 0,
  onSubmitAnswer,
  onSkipQuestion,
}) => {
  const { t } = useTranslation('interview');
  if (interviewStatus !== 'active') return null;

  const secondsLeft  = Math.ceil(readingTimeLeft / 1000);
  const progressPct  = Math.max(0, Math.min(100, (readingTimeLeft / 10000) * 100));
  const isProcessing = agentState === 'thinking' || agentState === 'processing' || agentState === 'finishing';
  const isSpeaking   = !!isVoiceActive;
  const isDisabled   = isProcessing || isSpeaking || !canSubmit;

  return (
    <Box sx={{ p: { xs: 0.75, md: 1 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>

      {/* ── Reading-time card ── */}
      {isInReadingTime ? (
        <Box sx={{
          borderRadius: '14px',
          border: '1px solid rgba(245,158,11,0.18)',
          bgcolor: 'rgba(255,251,235,0.8)',
          overflow: 'hidden',
          p: 1.25,
        }}>
          {/* Top row: icon + label left, big number right */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
              <Box sx={{
                width: 30, height: 30, borderRadius: '9px',
                bgcolor: 'rgba(245,158,11,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <MicOffIcon sx={{ fontSize: 15, color: '#d97706' }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.72rem',
                  color: '#92400e', lineHeight: 1.2,
                }}>
                  Reading time
                </Typography>
                <Typography sx={{
                  fontFamily: 'Poppins', fontWeight: 400, fontSize: '0.6rem',
                  color: '#b45309', opacity: 0.8, lineHeight: 1.3,
                }}>
                  Mic opens automatically
                </Typography>
              </Box>
            </Box>

            {/* Countdown */}
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.2, justifyContent: 'flex-end' }}>
                <Typography sx={{
                  fontFamily: 'Poppins', fontWeight: 800,
                  fontSize: '2rem', lineHeight: 1, color: '#d97706',
                }}>
                  {secondsLeft}
                </Typography>
                <Typography sx={{
                  fontFamily: 'Poppins', fontWeight: 600,
                  fontSize: '0.7rem', color: '#d97706', opacity: 0.65, mb: 0.2,
                }}>
                  s
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Progress bar */}
          <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.15)', overflow: 'hidden' }}>
            <Box sx={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #fde68a, #f59e0b)',
              borderRadius: 2,
              transition: 'width 0.1s linear',
            }} />
          </Box>
        </Box>
      ) : (
        /* ── Normal submit button ── */
        <Button
          variant="contained"
          fullWidth
          onClick={onSubmitAnswer}
          disabled={isDisabled}
          endIcon={
            isSpeaking
              ? <GraphicEqIcon sx={{
                  fontSize: '17px !important',
                  color: '#22c55e !important',
                  animation: 'micPulse 0.5s ease-in-out infinite alternate',
                  '@keyframes micPulse': {
                    from: { transform: 'scaleY(0.55)', opacity: 0.75 },
                    to:   { transform: 'scaleY(1.3)',  opacity: 1 },
                  },
                }} />
              : !isDisabled
              ? <SendIcon sx={{ fontSize: '14px !important' }} />
              : undefined
          }
          sx={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', py: 1,
            borderRadius: '12px', textTransform: 'none',
            background: isDisabled ? '#f3f4f6' : 'linear-gradient(135deg, #6AD39C 0%, #10b981 100%)',
            color: isDisabled ? '#9ca3af' : '#fff',
            boxShadow: isDisabled ? 'none' : '0 4px 16px rgba(106,211,156,0.32)',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: isDisabled ? '#f3f4f6' : 'linear-gradient(135deg, #10b981 0%, #10453F 100%)',
              boxShadow: isDisabled ? 'none' : '0 6px 20px rgba(106,211,156,0.28)',
            },
            '&.Mui-disabled': {
              background: isSpeaking
                ? 'linear-gradient(135deg, rgba(106,211,156,0.1) 0%, rgba(34,197,94,0.07) 100%)'
                : '#f3f4f6',
              color: isSpeaking ? '#10453F' : '#9ca3af',
              boxShadow: isSpeaking ? '0 0 0 1.5px rgba(106,211,156,0.3)' : 'none',
            },
          }}
        >
          {isProcessing
            ? t('agent.processing')
            : (isSpeaking || !canSubmit)
            ? t('agent.listening')
            : t('agent.submit')}
        </Button>
      )}

      {/* ── Skip button ── */}
      <Button
        variant="outlined"
        fullWidth
        onClick={onSkipQuestion}
        disabled={isProcessing || isInReadingTime}
        startIcon={<SkipNextIcon sx={{ fontSize: '15px !important' }} />}
        sx={{
          fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem',
          py: 0.6, borderRadius: '10px', textTransform: 'none',
          color: (isProcessing || isInReadingTime) ? '#d1d5db' : '#9ca3af',
          borderColor: (isProcessing || isInReadingTime) ? 'rgba(209,213,219,0.4)' : 'rgba(209,213,219,0.7)',
          background: 'transparent',
          '&:hover': { color: '#6b7280', borderColor: 'rgba(156,163,175,0.8)', background: 'rgba(243,244,246,0.6)' },
          '&.Mui-disabled': { color: '#d1d5db', borderColor: 'rgba(209,213,219,0.3)' },
        }}
      >
        {t('agent.skip_question', { defaultValue: 'Skip question' })}
      </Button>
    </Box>
  );
};

export default AgentStatusPanel;
