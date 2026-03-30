import React, { useEffect, useRef, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset submitting state when AI takes over or when no turns were accumulated
  useEffect(() => {
    if (agentState === 'thinking' || agentState === 'processing') {
      // Submission went through — clear the safety timeout
      if (safetyTimer.current) {
        clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }
    }
    if (agentState === 'waiting') {
      setIsSubmitting(false);
    }
  }, [agentState]);

  if (interviewStatus !== 'active') return null;

  const isProcessing = agentState === 'thinking' || agentState === 'processing';
  const isDisabled = isProcessing || isSubmitting;

  const handleClick = () => {
    setIsSubmitting(true);
    onSubmitAnswer();
    // Safety reset: if agentState doesn't transition to thinking within 1 s
    // (e.g. no accumulated turns), re-enable the button
    safetyTimer.current = setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <Button
      variant="contained"
      fullWidth
      onClick={handleClick}
      disabled={isDisabled}
      endIcon={
        isSubmitting && !isProcessing
          ? <CircularProgress size={14} sx={{ color: 'rgba(241,245,249,0.5)' }} />
          : !isDisabled
          ? <SendIcon sx={{ fontSize: '15px !important' }} />
          : undefined
      }
      sx={{
        fontWeight: 700,
        fontSize: '0.875rem',
        py: 1.35,
        borderRadius: '10px',
        textTransform: 'none',
        background: isDisabled
          ? 'rgba(255,255,255,0.06)'
          : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        color: isDisabled ? 'rgba(241,245,249,0.3)' : '#fff',
        boxShadow: isDisabled ? 'none' : '0 4px 20px rgba(139,92,246,0.35)',
        border: `1px solid ${isDisabled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
        transition: 'all 0.2s',
        '&:hover': {
          background: isDisabled
            ? 'rgba(255,255,255,0.06)'
            : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
          boxShadow: isDisabled ? 'none' : '0 6px 24px rgba(139,92,246,0.45)',
          transform: isDisabled ? 'none' : 'translateY(-1px)',
        },
        '&.Mui-disabled': {
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(241,245,249,0.25)',
          boxShadow: 'none',
        },
      }}
    >
      {isSubmitting && !isProcessing
        ? 'Submitting…'
        : isProcessing
        ? 'AI is processing…'
        : 'Submit Answer'
      }
    </Button>
  );
};

export default AgentStatusPanel;
