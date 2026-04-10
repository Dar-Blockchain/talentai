import React from 'react';
import { Box, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { InterviewStatus, AgentState } from '@/types/interview';

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
  onSubmitAnswer,
}) => {
  if (interviewStatus !== 'active') return null;

  const isProcessing = agentState === 'thinking' || agentState === 'processing';
  const isSpeaking = !!isVoiceActive;

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 } }}>
      <Button
        variant="contained"
        fullWidth
        onClick={onSubmitAnswer}
        disabled={isProcessing || isSpeaking}
        endIcon={!isProcessing && !isSpeaking && <SendIcon sx={{ fontSize: '16px !important' }} />}
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: '0.88rem',
          py: 1.4,
          borderRadius: '12px',
          textTransform: 'none',
          bgcolor: isProcessing || isSpeaking ? '#f3f4f6' : '#8310FF',
          color: isProcessing || isSpeaking ? '#9ca3af' : '#fff',
          boxShadow: 'none',
          '&:hover': { bgcolor: isProcessing || isSpeaking ? '#f3f4f6' : '#6d0ee0', boxShadow: 'none' },
          '&.Mui-disabled': { bgcolor: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' },
        }}
      >
        {isProcessing ? 'Processing…' : isSpeaking ? 'Listening…' : 'Submit & Continue'}
      </Button>
    </Box>
  );
};

export default AgentStatusPanel;
