import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { InterviewStatus, ConnectionStatus, CameraStatus, AgentState } from '@/types/interview';
import { useTranslation } from 'react-i18next';

const REPORT_POLL_INTERVAL = 1500; // ms between checks
const REPORT_MAX_WAIT = 20000;     // max 20 s wait before navigating anyway

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
  const { t } = useTranslation('interview');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number>(0);
  const [waitDots, setWaitDots] = useState('');

  useEffect(() => {
    if (interviewStatus !== 'ended') return;

    deadlineRef.current = Date.now() + REPORT_MAX_WAIT;

    // Animate dots while waiting
    const dotsInterval = setInterval(() => {
      setWaitDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);

    // Poll localStorage until finalReport has a real score
    pollRef.current = setInterval(() => {
      const raw = localStorage.getItem('last_interview_analysis');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const score =
            parsed?.finalReport?.scores?.overall ??
            parsed?.finalReport?.overallScore ??
            parsed?.analytics?.overallScore ??
            parsed?.analytics?.totalScore ??
            null;
          if (score !== null && score !== undefined) {
            clearInterval(pollRef.current!);
            clearInterval(dotsInterval);
            onViewResults();
            return;
          }
        } catch { /* ignore parse errors */ }
      }
      // Safety timeout — navigate anyway after max wait
      if (Date.now() >= deadlineRef.current) {
        clearInterval(pollRef.current!);
        clearInterval(dotsInterval);
        onViewResults();
      }
    }, REPORT_POLL_INTERVAL);

    return () => {
      clearInterval(pollRef.current!);
      clearInterval(dotsInterval);
    };
  }, [interviewStatus]);

  const allReady = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  const checks = [
    { label: t('container.check_camera'), ok: cameraStatus === 'granted' },
    { label: t('container.check_system'), ok: connectionStatus === 'connected' },
    { label: t('container.check_loaded'), ok: isHydrated },
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
              {agentState === 'thinking' ? t('container.thinking')
                : agentState === 'processing' ? t('container.processing')
                : t('container.recording')}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af', mt: 0.2 }}>
              {agentState === 'thinking' || agentState === 'processing'
                ? t('container.wait') : t('container.listening')}
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
              {t('container.ready_title')}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280', mb: 3, lineHeight: 1.6 }}>
              {t('container.ready_subtitle')}
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
                    {ok ? t('container.check_ok') : t('container.check_waiting')}
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
              {t('start.btn_start')}
            </Button>

            {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} sx={{ mt: 1.5 }}>
                <VideocamIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#f59e0b' }}>
                  {t('container.camera_warning')}
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
              {t('container.starting_title')}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280' }}>
              {t('container.starting_subtitle')}
            </Typography>
          </Box>
        )}

        {/* ── ACTIVE ── */}
        {interviewStatus === 'active' && (
          <Box sx={{ py: 1 }}>

            {/* Live transcript */}
            <Box
              id="transcript-scroll"
              sx={{
                maxHeight: 200,
                overflowY: 'auto',
                mb: 2,
                pr: 0.5,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(131,16,255,0.2)', borderRadius: 2 },
              }}
              ref={(el: HTMLDivElement | null) => { if (el) el.scrollTop = el.scrollHeight; }}
            >
              <Typography sx={{
                fontFamily: 'Poppins', fontSize: '0.82rem',
                color: currentTranscript ? '#374151' : '#9ca3af',
                fontStyle: currentTranscript ? 'normal' : 'italic',
                lineHeight: 1.7,
                minHeight: 80,
              }}>
                {currentTranscript || t('container.speech_placeholder')}
              </Typography>
            </Box>

          </Box>
        )}

        {/* ── ENDED ── wait for finalReport then auto-redirect */}
        {interviewStatus === 'ended' && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={48} sx={{ color: '#8310FF', mb: 2 }} />
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 0.5 }}>
              {t('container.analyzing_title')}{waitDots}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280' }}>
              {t('container.analyzing_subtitle')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InterviewContainer;
