import React from 'react';
import { Box, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
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
    <Box sx={{ p: { xs: 0.75, md: 1 } }}>
      <Button
        variant="contained"
        fullWidth
        onClick={onSubmitAnswer}
        disabled={isDisabled}
        endIcon={!isDisabled && <SendIcon sx={{ fontSize: '14px !important' }} />}
        sx={{
          fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', py: 1,
          borderRadius: '12px', textTransform: 'none',
          bgcolor: isDisabled ? '#f3f4f6' : '#6AD39C',
          color: isDisabled ? '#9ca3af' : '#fff',
          boxShadow: 'none',
          '&:hover': { bgcolor: isDisabled ? '#f3f4f6' : '#10453F', boxShadow: 'none' },
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
      <Button
        variant="text"
        fullWidth
        onClick={onSkipQuestion}
        disabled={isProcessing}
        sx={{
          fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', mt: 0.25,
          color: isProcessing ? '#d1d5db' : '#9ca3af',
          textTransform: 'none',
          '&:hover': { color: '#6b7280', bgcolor: 'transparent' },
          '&.Mui-disabled': { color: '#d1d5db' },
        }}
      >
        {t('agent.skip_question', { defaultValue: 'Skip question' })}
      </Button>
    </Box>
  );
};

export default AgentStatusPanel;
