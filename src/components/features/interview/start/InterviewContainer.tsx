import React from 'react';
import { Box, Typography, Button, LinearProgress, Chip, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { InterviewStatus, InterviewConfig, ConnectionStatus, CameraStatus, AgentState } from '@/types/interview';

interface InterviewContainerProps {
  interviewStatus: InterviewStatus;
  interviewConfig: InterviewConfig;
  isHydrated: boolean;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  agentState: AgentState;
  onStartInterview: () => void;
  onEndInterview: () => void;
  onViewResults: () => void;
  routerQuery: any;
}

const PURPLE = '#8310FF';

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  interviewStatus,
  interviewConfig,
  isHydrated,
  connectionStatus,
  cameraStatus,
  agentState,
  onStartInterview,
  onEndInterview,
  onViewResults,
  routerQuery,
}) => {
  const interviewLabel =
    interviewConfig.interviewType === 'TECHNICAL_INTERVIEW'
      ? `${interviewConfig.context.targetRole} Technical Interview`
      : interviewConfig.interviewType === 'ASSESSMENT'
      ? 'Soft Skills Assessment'
      : interviewConfig.interviewType === 'EVALUATION'
      ? 'Psychotechnic Assessment'
      : 'HR Interview';

  const interviewSub =
    interviewConfig.interviewType === 'TECHNICAL_INTERVIEW'
      ? `${routerQuery.skill || 'Technical'} · ${interviewConfig.context.experienceLevel}`
      : interviewConfig.interviewType === 'ASSESSMENT'
      ? `${routerQuery.skill || 'Soft Skills'} · ${interviewConfig.context.experienceLevel}`
      : 'AI-powered conversational interview';

  const isActive = interviewStatus === 'active';
  const allReady = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  const checks = [
    { label: 'Camera access', ok: cameraStatus === 'granted' },
    { label: 'System connected', ok: connectionStatus === 'connected' },
    { label: 'Page loaded', ok: isHydrated },
  ];

  return (
    <Box
      sx={{
        bgcolor: 'transparent',
        borderRadius: '16px',
        border: '1px solid #ede9f8',
        overflow: 'hidden',
      }}
    >
      {/* ── Purple header stripe ── */}
      <Box
        sx={{
          bgcolor: '#8310FF',
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Poppins', lineHeight: 1.2 }}>
            {interviewLabel}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.72rem', fontFamily: 'Poppins', mt: 0.2 }}>
            {interviewSub}
          </Typography>
        </Box>

        {/* Status pill */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            px: 1.5,
            py: 0.5,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: isActive ? '#4ade80' : interviewStatus === 'ended' ? '#e9d5ff' : '#fff',
              boxShadow: isActive ? '0 0 0 3px rgba(74,222,128,0.4)' : 'none',
            }}
          />
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.72rem', color: '#fff' }}>
            {interviewStatus === 'idle' ? 'Ready' : interviewStatus === 'connecting' ? 'Connecting…' : isActive ? 'Live' : 'Completed'}
          </Typography>
        </Box>
      </Box>

      {/* ── Progress bar (active only) ── */}
      {isActive && (
        <LinearProgress
          variant="indeterminate"
          sx={{
            height: 3,
            bgcolor: 'rgba(131,16,255,0.12)',
            '& .MuiLinearProgress-bar': { bgcolor: '#8310FF' },
          }}
        />
      )}

      {/* ── Body ── */}
      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>

        {/* ── IDLE ── */}
        {interviewStatus === 'idle' && (
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon */}
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'rgba(131,16,255,0.08)',
                border: '2px solid rgba(131,16,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 36, color: PURPLE }} />
            </Box>

            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#111827', mb: 0.5 }}>
              Ready to begin?
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280', mb: 3, lineHeight: 1.6 }}>
              Your AI interviewer is ready and waiting.
            </Typography>

            {/* Pre-flight checks — inline, no box wrapper */}
            <Box sx={{ mb: 3 }}>
              {checks.map(({ label, ok }) => (
                <Box
                  key={label}
                  display="flex"
                  alignItems="center"
                  gap={1.25}
                  sx={{ py: 0.6, borderBottom: '1px solid #f3f4f6', '&:last-child': { borderBottom: 'none' } }}
                >
                  {ok
                    ? <CheckCircleIcon sx={{ fontSize: 17, color: '#22c55e', flexShrink: 0 }} />
                    : <RadioButtonUncheckedIcon sx={{ fontSize: 17, color: '#d1d5db', flexShrink: 0 }} />
                  }
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: ok ? '#374151' : '#9ca3af', flex: 1, textAlign: 'left' }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 600, color: ok ? '#22c55e' : '#f59e0b' }}>
                    {ok ? 'OK' : 'Waiting'}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={onStartInterview}
              disabled={!allReady}
              startIcon={<PlayArrowIcon />}
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '0.92rem',
                py: 1.5,
                borderRadius: '12px',
                bgcolor: allReady ? '#8310FF' : '#e5e7eb',
                color: '#fff',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: allReady ? '#6d0ee0' : '#e5e7eb', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' },
              }}
            >
              Start Interview
            </Button>

            {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} sx={{ mt: 1.5 }}>
                <VideocamIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#f59e0b' }}>
                  Camera permission required
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* ── CONNECTING ── */}
        {interviewStatus === 'connecting' && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={48} sx={{ color: PURPLE, mb: 2 }} />
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 0.5 }}>
              Starting interview…
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280' }}>
              Please wait while we connect you to your AI interviewer.
            </Typography>
          </Box>
        )}

        {/* ── ACTIVE ── */}
        {interviewStatus === 'active' && (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Chip
              label={
                agentState === 'thinking' ? 'AI is thinking…'
                : agentState === 'processing' ? 'Processing your answer…'
                : agentState === 'waiting' ? 'Listening to you…'
                : 'Ready'
              }
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '0.8rem',
                mb: 3,
                height: 32,
                bgcolor:
                  agentState === 'thinking' || agentState === 'processing'
                    ? 'rgba(245,158,11,0.1)'
                    : agentState === 'waiting'
                    ? 'rgba(34,197,94,0.1)'
                    : 'rgba(131,16,255,0.08)',
                color:
                  agentState === 'thinking' || agentState === 'processing'
                    ? '#d97706'
                    : agentState === 'waiting'
                    ? '#16a34a'
                    : PURPLE,
                border: '1px solid',
                borderColor:
                  agentState === 'thinking' || agentState === 'processing'
                    ? 'rgba(245,158,11,0.25)'
                    : agentState === 'waiting'
                    ? 'rgba(34,197,94,0.25)'
                    : 'rgba(131,16,255,0.2)',
              }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={onEndInterview}
              startIcon={<StopIcon />}
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '0.9rem',
                py: 1.5,
                borderRadius: '12px',
                bgcolor: '#ef4444',
                color: '#fff',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#dc2626', boxShadow: 'none' },
              }}
            >
              End Interview
            </Button>
          </Box>
        )}

        {/* ── ENDED ── */}
        {interviewStatus === 'ended' && (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.08) 100%)',
                border: '2px solid rgba(34,197,94,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 36, color: '#22c55e' }} />
            </Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#111827', mb: 0.5 }}>
              Interview complete!
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280', mb: 3, lineHeight: 1.6 }}>
              Your responses have been recorded and are being analyzed.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={onViewResults}
              startIcon={<AssessmentIcon />}
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                fontSize: '0.92rem',
                py: 1.5,
                borderRadius: '12px',
                bgcolor: '#8310FF',
                color: '#fff',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#6d0ee0', boxShadow: 'none' },
              }}
            >
              View Results
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InterviewContainer;
