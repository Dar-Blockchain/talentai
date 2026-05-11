import React from 'react';
import { Box, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { InterviewStatus, AgentState } from '@/types/interview';
import { useTranslation } from 'react-i18next';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState: AgentState;
  isVoiceActive?: boolean;
  agentMessage?: string;
  isInReadingTime?: boolean;
  readingTimeLeft?: number;
  accumulatedTurns?: string[];
  currentTranscript?: string;
  debugMode?: boolean;
  setDebugMode?: (v: boolean) => void;
  silenceDebugLog?: string[];
  transcriptDebugLog?: string[];
  onSubmitAnswer: () => void;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  interviewStatus,
  agentState,
  isVoiceActive,
  currentTranscript,
  onSubmitAnswer,
}) => {
  const { t } = useTranslation('interview');
  if (interviewStatus !== 'active') return null;

  const isProcessing = agentState === 'thinking' || agentState === 'processing';
  const isSpeaking   = !!isVoiceActive;
  // When a transcript is wired up, require non-empty content before enabling submit.
  // When currentTranscript is undefined (e.g. hr.tsx doesn't pass it), behave as before.
  const hasTranscript = currentTranscript !== undefined ? Boolean(currentTranscript.trim()) : true;
  const isDisabled = isProcessing || isSpeaking || !hasTranscript;

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 } }}>
      <Button
        variant="contained"
        fullWidth
        onClick={onSubmitAnswer}
        disabled={isDisabled}
        endIcon={!isDisabled && <SendIcon sx={{ fontSize: '16px !important' }} />}
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: '0.88rem',
          py: 1.4,
          borderRadius: '12px',
          textTransform: 'none',
          bgcolor: isDisabled ? '#f3f4f6' : '#8310FF',
          color: isDisabled ? '#9ca3af' : '#fff',
          boxShadow: 'none',
          '&:hover': { bgcolor: isDisabled ? '#f3f4f6' : '#6d0ee0', boxShadow: 'none' },
          '&.Mui-disabled': { bgcolor: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' },
        }}
      >
        {isProcessing
          ? t('agent.processing')
          : isSpeaking
          ? t('agent.listening')
          : !hasTranscript
          ? t('agent.waiting_for_speech', { defaultValue: 'Speak your answer…' })
          : t('agent.submit')}
      </Button>
    </Box>
  );
};

export default AgentStatusPanel;
