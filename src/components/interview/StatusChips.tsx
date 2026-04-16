import React from 'react';
import { Box, Chip } from '@mui/material';
import { InterviewStatus, CameraStatus, AgentState } from '@/types/interview';

interface StatusChipsProps {
  interviewStatus: InterviewStatus;
  isVoiceActive: boolean;
  cameraStatus: CameraStatus;
  agentState: AgentState;
}

const StatusChips: React.FC<StatusChipsProps> = ({
  interviewStatus,
  isVoiceActive,
  cameraStatus,
  agentState,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
      <Chip
        size="small"
        label={interviewStatus}
        color={interviewStatus === 'active' ? 'success' : interviewStatus === 'ended' ? 'default' : 'warning'}
      />
      {isVoiceActive && (
        <Chip size="small" label="Voice Active" color="info" />
      )}
      {cameraStatus && (
        <Chip
          size="small"
          label={`Camera: ${cameraStatus}`}
          color={cameraStatus === 'granted' ? 'success' : 'default'}
        />
      )}
      {agentState && (
        <Chip size="small" label={`Agent: ${agentState}`} variant="outlined" />
      )}
    </Box>
  );
};

export default StatusChips;
