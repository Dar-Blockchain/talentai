import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { InterviewStatus, ConnectionStatus, CameraStatus, AgentState } from '@/types/interview';

interface InterviewContainerProps {
  interviewStatus: InterviewStatus;
  isHydrated: boolean;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  agentState: AgentState;
  currentTranscript?: string;
  onStartInterview: () => void;
  onEndInterview?: () => void;
  onViewResults: () => void;
}

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  interviewStatus,
  isHydrated,
  connectionStatus,
  cameraStatus,
  agentState,
  currentTranscript,
  onStartInterview,
  onViewResults,
}) => {

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

      {/* ── Active header strip ── */}
      {interviewStatus === 'active' && (
        <Box sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #ede9f8',
          px: 2.5, py: 1.75,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            bgcolor: agentState === 'thinking' || agentState === 'processing'
              ? 'rgba(245,158,11,0.1)' : 'rgba(131,16,255,0.08)',
            border: `1px solid ${agentState === 'thinking' || agentState === 'processing'
              ? 'rgba(245,158,11,0.2)' : 'rgba(131,16,255,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {agentState === 'thinking' || agentState === 'processing' ? (
              <AutorenewIcon sx={{
                fontSize: 20, color: '#d97706',
                animation: 'spin 1.2s linear infinite',
                '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
              }} />
            ) : (
              <KeyboardVoiceIcon sx={{ fontSize: 20, color: '#8310FF' }} />
            )}
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: '#111827', lineHeight: 1.2 }}>
              {agentState === 'thinking' ? 'AI is thinking…'
                : agentState === 'processing' ? 'Processing your answer…'
                : 'Recording your response'}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af', mt: 0.2 }}>
              {agentState === 'thinking' || agentState === 'processing'
                ? 'Please wait…' : 'Listening to your answer…'}
            </Typography>
          </Box>
        </Box>
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
              <PlayArrowIcon sx={{ fontSize: 36, color: '#8310FF' }} />
            </Box>

            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#111827', mb: 0.5 }}>
              Ready to begin?
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280', mb: 3, lineHeight: 1.6 }}>
              Your AI interviewer is ready and waiting.
            </Typography>

            {/* Pre-flight checks */}
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
            <CircularProgress size={48} sx={{ color: '#8310FF', mb: 2 }} />
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
          <Box sx={{ py: 1 }}>

            {/* Live transcript */}
            <Typography sx={{
              fontFamily: 'Poppins', fontSize: '0.82rem',
              color: currentTranscript ? '#374151' : '#9ca3af',
              fontStyle: currentTranscript ? 'normal' : 'italic',
              lineHeight: 1.7,
              mb: 2,
              minHeight: 80,
            }}>
              {currentTranscript
                ? currentTranscript.slice(-400) + (currentTranscript.length > 400 ? '…' : '')
                : 'Waiting for speech…'}
            </Typography>

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
