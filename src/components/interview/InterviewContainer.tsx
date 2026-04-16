import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { InterviewStatus, InterviewConfig, ConnectionStatus, CameraStatus, AgentState } from '@/types/interview';
import StatusChips from './StatusChips';

interface InterviewContainerProps {
  interviewStatus: InterviewStatus;
  interviewConfig: InterviewConfig;
  isHydrated: boolean;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  isVoiceActive: boolean;
  agentState: AgentState;
  onStartInterview: () => void;
  onEndInterview: () => void;
  onViewResults: () => void;
  routerQuery: any;
}

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  interviewStatus,
  interviewConfig,
  isHydrated,
  connectionStatus,
  cameraStatus,
  isVoiceActive,
  agentState,
  onStartInterview,
  onEndInterview,
  onViewResults,
  routerQuery,
}) => {
  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 4,
        textAlign: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.5px',
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {interviewConfig.interviewType === 'TECHNICAL_SKILL'
              ? `${interviewConfig.context.targetRole} Technical Interview`
              : interviewConfig.interviewType === 'SOFT_SKILL'
              ? 'Soft Skills Assessment'
              : interviewConfig.interviewType === 'SALARY_INTERVIEW'
              ? 'Salary Negotiation Interview'
              : interviewConfig.interviewType === 'PSYCHOTECHNIC'
              ? 'Psychotechnic Assessment'
              : 'HR Interview Simulation'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              opacity: 0.95,
              fontSize: '1.1rem',
              fontWeight: 300
            }}
          >
            {interviewConfig.interviewType === 'TECHNICAL_SKILL'
              ? `${interviewConfig.context.targetCompany} • ${routerQuery.skill || 'technical'} expertise • ${interviewConfig.context.experienceLevel}`
              : interviewConfig.interviewType === 'SOFT_SKILL'
              ? `${interviewConfig.context.targetCompany} • ${routerQuery.skill || 'soft skill'} in ${routerQuery.category || 'general'} context • ${interviewConfig.context.experienceLevel}`
              : `${interviewConfig.context.targetCompany} • Intelligent Real-time Interview with AI`}
          </Typography>

          {/* Status Indicators */}
          <StatusChips
            interviewStatus={interviewStatus}
            isVoiceActive={isVoiceActive}
            cameraStatus={cameraStatus}
            agentState={agentState}
          />
        </Box>
      </Box>

      {/* Interview Content */}
      <Box sx={{ p: 5 }}>
        {interviewStatus === 'idle' && (
          <Box
            textAlign="center"
            py={6}
            sx={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
              borderRadius: 3,
              border: '2px dashed rgba(102, 126, 234, 0.2)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <PlayArrowIcon sx={{ fontSize: 60, color: '#667eea', opacity: 0.8 }} />
            </Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2
              }}
            >
              Ready to Start Your Interview?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 4,
                fontSize: '1.1rem',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.7
              }}
            >
              This is an AI-powered interview simulation that adapts to your responses and provides real-time feedback.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onStartInterview}
              disabled={!isHydrated || connectionStatus !== 'connected' || cameraStatus !== 'granted'}
              startIcon={<PlayArrowIcon />}
              sx={{
                px: 5,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                },
                '&:disabled': {
                  background: '#bdbdbd',
                  boxShadow: 'none'
                }
              }}
            >
              Start Interview
            </Button>
            {(cameraStatus !== 'granted' && cameraStatus !== 'requesting') && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{
                  mt: 2,
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                ⚠️ Camera access required to start interview
              </Typography>
            )}
          </Box>
        )}

        {interviewStatus === 'active' && (
          <Box
            textAlign="center"
            py={8}
            sx={{
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.03) 0%, rgba(229, 57, 53, 0.03) 100%)',
              borderRadius: 3,
              border: '2px solid rgba(244, 67, 54, 0.15)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <StopIcon sx={{ fontSize: 60, color: '#f44336', opacity: 0.8 }} />
            </Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 4
              }}
            >
              Interview in Progress
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onEndInterview}
              startIcon={<StopIcon />}
              color="error"
              sx={{
                px: 5,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                }
              }}
            >
              End Interview
            </Button>
          </Box>
        )}

        {interviewStatus === 'ended' && (
          <Box
            textAlign="center"
            py={8}
            sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(67, 160, 71, 0.03) 100%)',
              borderRadius: 3,
              border: '2px solid rgba(76, 175, 80, 0.15)'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <AssessmentIcon sx={{ fontSize: 60, color: '#4caf50', opacity: 0.8 }} />
            </Box>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#2c3e50',
                mb: 2
              }}
            >
              Interview Completed!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4} sx={{ fontSize: '1.1rem' }}>
              Thank you for participating. Your responses have been recorded and analyzed.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onViewResults}
              startIcon={<AssessmentIcon />}
              sx={{
                px: 5,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                }
              }}
            >
              View Results
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default InterviewContainer;
