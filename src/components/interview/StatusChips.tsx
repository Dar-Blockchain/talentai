import React from 'react';
import { Box, Chip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ErrorIcon from '@mui/icons-material/Error';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ProcessingIcon from '@mui/icons-material/Autorenew';
import ReadyIcon from '@mui/icons-material/CheckCircle';
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
    <Box display="flex" justifyContent="center" gap={2} mt={3} flexWrap="wrap">
      <Chip
        icon={interviewStatus === 'active' ? <RecordVoiceOverIcon /> : <MicOffIcon />}
        label={interviewStatus === 'active' ? 'Active' : 'Inactive'}
        color={interviewStatus === 'active' ? 'success' : 'default'}
        variant="filled"
        sx={{
          color: 'white',
          bgcolor: interviewStatus === 'active' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          px: 2,
          fontWeight: 500
        }}
      />
      <Chip
        icon={isVoiceActive ? <MicIcon /> : <MicOffIcon />}
        label={isVoiceActive ? 'Speaking' : 'Listening'}
        color={isVoiceActive ? 'success' : 'default'}
        variant="filled"
        sx={{
          color: 'white',
          bgcolor: isVoiceActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          px: 2,
          fontWeight: 500
        }}
      />
      <Chip
        icon={
          cameraStatus === 'granted' ? <VideocamIcon /> :
          cameraStatus === 'requesting' ? <VideocamOffIcon /> :
          <ErrorIcon />
        }
        label={
          cameraStatus === 'granted' ? 'Camera Ready' :
          cameraStatus === 'requesting' ? 'Camera Loading' :
          cameraStatus === 'denied' ? 'Camera Denied' :
          'Camera Error'
        }
        color={cameraStatus === 'granted' ? 'success' : cameraStatus === 'requesting' ? 'warning' : 'error'}
        variant="filled"
        sx={{
          color: 'white',
          bgcolor: cameraStatus === 'granted' ? 'rgba(76, 175, 80, 0.3)' :
                  cameraStatus === 'requesting' ? 'rgba(255, 152, 0, 0.3)' :
                  'rgba(244, 67, 54, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          px: 2,
          fontWeight: 500
        }}
      />

      {interviewStatus === 'active' && (
        <Chip
          icon={
            agentState === 'thinking' ? <PsychologyIcon /> :
            agentState === 'waiting' ? <HourglassEmptyIcon /> :
            agentState === 'processing' ? <ProcessingIcon /> :
            agentState === 'ready' ? <ReadyIcon /> :
            <MicOffIcon />
          }
          label={
            agentState === 'thinking' ? 'AI Thinking' :
            agentState === 'waiting' ? 'Waiting' :
            agentState === 'processing' ? 'Processing' :
            agentState === 'ready' ? 'Ready' :
            'Idle'
          }
          color={
            agentState === 'thinking' ? 'info' :
            agentState === 'waiting' ? 'warning' :
            agentState === 'processing' ? 'info' :
            agentState === 'ready' ? 'success' :
            'default'
          }
          variant="filled"
          sx={{
            color: 'white',
            bgcolor: agentState === 'thinking' ? 'rgba(33, 150, 243, 0.3)' :
                    agentState === 'waiting' ? 'rgba(255, 152, 0, 0.3)' :
                    agentState === 'processing' ? 'rgba(33, 150, 243, 0.3)' :
                    agentState === 'ready' ? 'rgba(76, 175, 80, 0.3)' :
                    'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            px: 2,
            fontWeight: 500
          }}
        />
      )}
    </Box>
  );
};

export default StatusChips;
