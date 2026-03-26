import React from 'react';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { InterviewStatus, AgentState } from '@/types/interview';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState:      AgentState;
  onSubmitAnswer:  () => void;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  interviewStatus, agentState, onSubmitAnswer,
}) => {
  if (interviewStatus !== 'active') return null;
  const isProcessing = agentState === 'thinking' || agentState === 'processing';

  return (
    <Button
      variant="contained"
      fullWidth
      onClick={onSubmitAnswer}
      disabled={isProcessing}
      endIcon={!isProcessing ? <SendIcon sx={{ fontSize: '15px !important' }} /> : undefined}
      sx={{
        fontWeight: 700,
        fontSize: '0.875rem',
        py: 1.35,
        borderRadius: '10px',
        textTransform: 'none',
        background: isProcessing
          ? 'rgba(255,255,255,0.06)'
          : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        color: isProcessing ? 'rgba(241,245,249,0.3)' : '#fff',
        boxShadow: isProcessing ? 'none' : '0 4px 20px rgba(139,92,246,0.35)',
        border: `1px solid ${isProcessing ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
        transition: 'all 0.2s',
        '&:hover': {
          background: isProcessing
            ? 'rgba(255,255,255,0.06)'
            : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          boxShadow: isProcessing ? 'none' : '0 6px 24px rgba(139,92,246,0.45)',
          transform: isProcessing ? 'none' : 'translateY(-1px)',
        },
        '&.Mui-disabled': {
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(241,245,249,0.25)',
          boxShadow: 'none',
        },
      }}
    >
      {isProcessing ? 'AI is processing…' : 'Submit Answer'}
    </Button>
  );
};

export default AgentStatusPanel;
