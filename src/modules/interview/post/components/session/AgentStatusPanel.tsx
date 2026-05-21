import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useTranslation } from 'react-i18next';
import { type InterviewStatus, type AgentState } from '../../types/interview';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState: AgentState;
  isVoiceActive?: boolean;
  currentTranscript?: string;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  interviewStatus,
  agentState,
  isVoiceActive,
  currentTranscript,
  onSubmitAnswer,
  onSkipQuestion,
}) => {
  const { t } = useTranslation('interview');
  if (interviewStatus !== 'active') return null;

  const isProcessing  = agentState === 'thinking' || agentState === 'processing';
  const isSpeaking    = !!isVoiceActive;
  const hasTranscript = currentTranscript !== undefined ? Boolean(currentTranscript.trim()) : true;
  const isDisabled    = isProcessing || isSpeaking || !hasTranscript;

  return (
    <Box sx={{ p: { xs: 0.75, md: 1 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>

      {/* ── Submit button ── */}
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
          : isSpeaking
          ? t('agent.listening')
          : !hasTranscript
          ? t('agent.waiting', { defaultValue: 'Waiting…' })
          : t('agent.submit')}
      </Button>

      {/* ── Skip button ── */}
      <Button
        variant="outlined"
        fullWidth
        onClick={onSkipQuestion}
        disabled={isProcessing}
        startIcon={<SkipNextIcon sx={{ fontSize: '15px !important' }} />}
        sx={{
          fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem',
          py: 0.6, borderRadius: '10px', textTransform: 'none',
          color: isProcessing ? '#d1d5db' : '#9ca3af',
          borderColor: isProcessing ? 'rgba(209,213,219,0.4)' : 'rgba(209,213,219,0.7)',
          background: 'transparent',
          '&:hover': {
            color: '#6b7280',
            borderColor: 'rgba(156,163,175,0.8)',
            background: 'rgba(243,244,246,0.6)',
          },
          '&.Mui-disabled': {
            color: '#d1d5db',
            borderColor: 'rgba(209,213,219,0.3)',
          },
        }}
      >
        {t('agent.skip_question', { defaultValue: 'Skip question' })}
      </Button>
    </Box>
  );
};

export default AgentStatusPanel;
