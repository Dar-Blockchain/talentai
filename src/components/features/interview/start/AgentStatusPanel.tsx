import React from 'react';
import { Box, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { InterviewStatus, AgentState } from '@/types/interview';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState: AgentState;
  onSubmitAnswer: () => void;
  agentMessage?: string;
  isInReadingTime?: boolean;
  readingTimeLeft?: number;
  accumulatedTurns?: string[];
  isVoiceActive?: boolean;
  currentTranscript?: string;
  debugMode?: boolean;
  setDebugMode?: (v: boolean) => void;
  silenceDebugLog?: string[];
  transcriptDebugLog?: string[];
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  interviewStatus,
  agentState,
  onSubmitAnswer,
}) => {
  if (interviewStatus !== 'active') return null;

  const isProcessing = agentState === 'thinking' || agentState === 'processing';

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 } }}>
      <Button
        variant="contained"
        fullWidth
        onClick={onSubmitAnswer}
        disabled={isProcessing}
        endIcon={!isProcessing && <SendIcon sx={{ fontSize: '16px !important' }} />}
        sx={{
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: '0.88rem',
          py: 1.4,
          borderRadius: '12px',
          textTransform: 'none',
          bgcolor: isProcessing ? '#f3f4f6' : '#8310FF',
          color: isProcessing ? '#9ca3af' : '#fff',
          boxShadow: 'none',
          '&:hover': { bgcolor: isProcessing ? '#f3f4f6' : '#6d0ee0', boxShadow: 'none' },
          '&.Mui-disabled': { bgcolor: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' },
        }}
      >
        {isProcessing ? 'Processing…' : 'Submit & Continue'}
      </Button>
    </Box>
  );
};

export default AgentStatusPanel;
