import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VideocamIcon from '@mui/icons-material/Videocam';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useTranslation } from 'react-i18next';
import { type InterviewStatus, type ConnectionStatus, type CameraStatus, type AgentState } from '../../types/interview';

// ─── Main component ────────────────────────────────────────────────────────────

interface InterviewContainerProps {
  interviewStatus: InterviewStatus;
  isHydrated: boolean;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  agentState: AgentState;
  currentTranscript?: string;
  resultsReady: boolean;
  noBorder?: boolean;
  onStartInterview: () => void;
  onBack?: () => void;
  jobTitle?: string;
  companyName?: string;
}

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  interviewStatus,
  isHydrated,
  connectionStatus,
  cameraStatus,
  agentState,
  currentTranscript,
  resultsReady,
  noBorder = false,
  onStartInterview,
  onBack,
  jobTitle,
  companyName,
}) => {
  const { t } = useTranslation('interview');
  const [waitDots] = useState('');

  const allReady = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  const checks = useMemo(() => [
    { label: t('container.check_camera'),  ok: cameraStatus === 'granted' },
    { label: t('container.check_system'),  ok: connectionStatus === 'connected' },
    { label: t('container.check_loaded'),  ok: isHydrated },
  ], [cameraStatus, connectionStatus, isHydrated, t]);

  return (
    <Box sx={{ bgcolor: noBorder ? 'transparent' : '#fff', borderRadius: noBorder ? 0 : '16px', border: noBorder ? 'none' : '1px solid rgba(106,211,156,0.18)', boxShadow: noBorder ? 'none' : '0 2px 16px rgba(16,69,63,0.06)', overflow: 'hidden', height: noBorder ? 'auto' : '100%', display: 'flex', flexDirection: 'column' }}>

      {interviewStatus === 'active' && <AgentHeader agentState={agentState} />}

      <Box sx={{ p: { xs: 1.5, md: 2 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {interviewStatus === 'idle' && (
          <ReadinessChecklist
            checks={checks}
            allReady={allReady}
            cameraStatus={cameraStatus}
            onStartInterview={onStartInterview}
            onBack={onBack}
            jobTitle={jobTitle}
            companyName={companyName}
          />
        )}

        {interviewStatus === 'connecting' && (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <CircularProgress size={36} sx={{ color: '#6AD39C', mb: 1.25 }} />
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: '#111827', mb: 0.35 }}>{t('container.starting_title')}</Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#6b7280' }}>{t('container.starting_subtitle')}</Typography>
          </Box>
        )}

        {interviewStatus === 'active'  && <LiveTranscript currentTranscript={currentTranscript} />}
        {interviewStatus === 'ended'   && (resultsReady ? <CompletionCard /> : <AnalyzingSpinner waitDots={waitDots} />)}
      </Box>

    </Box>
  );
};

export default InterviewContainer;

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Top strip shown during an active interview — displays the current AI agent state. */
const AgentHeader: React.FC<{ agentState: AgentState }> = ({ agentState }) => {
  const { t } = useTranslation('interview');
  const isProcessing = agentState === 'thinking' || agentState === 'processing';

  return (
    <Box sx={{
      background: isProcessing
        ? 'linear-gradient(90deg, rgba(251,191,36,0.07) 0%, rgba(245,158,11,0.04) 100%)'
        : 'linear-gradient(90deg, rgba(106,211,156,0.07) 0%, rgba(16,69,63,0.04) 100%)',
      borderBottom: `1px solid ${isProcessing ? 'rgba(245,158,11,0.18)' : 'rgba(106,211,156,0.18)'}`,
      px: 1.75, py: 1.1,
      display: 'flex', alignItems: 'center', gap: 1.25,
    }}>
      {/* Pulsing status dot */}
      <Box sx={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        bgcolor: isProcessing ? '#f59e0b' : '#22c55e',
        animation: 'statusPulse 1.8s ease-in-out infinite',
        '@keyframes statusPulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.45, transform: 'scale(0.8)' } },
      }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.8rem', color: '#111827', lineHeight: 1.2 }}>
          {agentState === 'thinking' ? t('container.thinking') : agentState === 'processing' ? t('container.processing') : t('container.recording')}
        </Typography>
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.63rem', color: '#9ca3af', mt: 0.1 }}>
          {isProcessing ? t('container.wait') : t('container.listening')}
        </Typography>
      </Box>

      {isProcessing
        ? <AutorenewIcon sx={{ fontSize: 15, color: '#f59e0b', flexShrink: 0, animation: 'spin 1.2s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
        : <KeyboardVoiceIcon sx={{ fontSize: 15, color: '#6AD39C', flexShrink: 0 }} />
      }
    </Box>
  );
};

interface ReadinessChecklistProps {
  checks: { label: string; ok: boolean }[];
  allReady: boolean;
  cameraStatus: CameraStatus;
  onStartInterview: () => void;
  onBack?: () => void;
  jobTitle?: string;
  companyName?: string;
}

/** Pre-flight checklist shown before the interview starts, with the start button. */
const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({
  checks, allReady, cameraStatus, onStartInterview, onBack, jobTitle, companyName,
}) => {
  const { t } = useTranslation('interview');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* ── Job context header ──────────────────────────────────────────── */}
      {(jobTitle || companyName) && (
        <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f1f3' }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: '#111827', mb: 0.25, lineHeight: 1.3 }}>
            {jobTitle}
          </Typography>
          {companyName && (
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af' }}>
              {companyName} · AI Interview
            </Typography>
          )}
        </Box>
      )}

      {/* ── Status grid ────────────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.875, mb: 2.25 }}>
        {checks.map(({ label, ok }) => (
          <Box key={label} sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
            py: 1.25, px: 0.5, borderRadius: '12px', textAlign: 'center',
            bgcolor: ok ? 'rgba(34,197,94,0.05)' : '#f9fafb',
            border: `1px solid ${ok ? 'rgba(34,197,94,0.18)' : '#f0f1f3'}`,
          }}>
            {ok
              ? <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e' }} />
              : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#d1d5db' }} />}
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.6rem', fontWeight: 600, color: ok ? '#374151' : '#b0b7c3', lineHeight: 1.3 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Title + subtitle ───────────────────────────────────────────── */}
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 0.4 }}>
        {t('container.ready_title')}
      </Typography>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.65, mb: 1 }}>
        {t('container.ready_subtitle')}
      </Typography>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem', color: '#b0b7c3', lineHeight: 1.6, mb: 2.5 }}>
        {t('container.ready_description')}
      </Typography>

      {/* ── Buttons — pushed to bottom ─────────────────────────────────── */}
      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.875 }}>
        {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, borderRadius: '10px', bgcolor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)' }}>
            <VideocamIcon sx={{ fontSize: 14, color: '#f59e0b', flexShrink: 0 }} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#d97706' }}>
              {t('container.camera_warning')}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={onStartInterview}
          disabled={!allReady}
          startIcon={<PlayArrowIcon />}
          sx={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', py: 1.25,
            borderRadius: '14px', textTransform: 'none',
            background: allReady ? 'linear-gradient(135deg, #6AD39C 0%, #10b981 100%)' : undefined,
            color: allReady ? '#fff' : undefined,
            boxShadow: allReady ? '0 4px 16px rgba(106,211,156,0.35)' : 'none',
            '&:hover': { background: allReady ? 'linear-gradient(135deg, #10b981 0%, #0d9265 100%)' : undefined, boxShadow: allReady ? '0 6px 20px rgba(106,211,156,0.28)' : 'none' },
            '&.Mui-disabled': { background: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' },
          }}
        >
          {t('start.btn_start')}
        </Button>

        {onBack && (
          <Button
            variant="text"
            fullWidth
            onClick={onBack}
            startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem',
              color: '#9ca3af', textTransform: 'none', py: 0.75,
              '&:hover': { color: '#6b7280', bgcolor: '#f9fafb' },
            }}
          >
            {t('container.back_to_post')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

/** Scrollable live transcript panel shown while the interview is active. */
const LiveTranscript: React.FC<{ currentTranscript?: string }> = ({ currentTranscript }) => {
  const { t } = useTranslation('interview');

  return (
    <Box sx={{ py: 1 }}>
      <Box
        id="transcript-scroll"
        sx={{ maxHeight: 140, overflowY: 'auto', mb: 1, pr: 0.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(106,211,156,0.2)', borderRadius: 2 } }}
        ref={(el: HTMLDivElement | null) => { if (el) el.scrollTop = el.scrollHeight; }}
      >
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: currentTranscript ? '#374151' : '#9ca3af', fontStyle: currentTranscript ? 'normal' : 'italic', lineHeight: 1.6, minHeight: 60 }}>
          {currentTranscript || t('container.speech_placeholder')}
        </Typography>
      </Box>
    </Box>
  );
};

/** Spinner shown while the backend generates the interview report. */
const AnalyzingSpinner: React.FC<{ waitDots: string }> = ({ waitDots }) => {
  const { t } = useTranslation('interview');

  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <CircularProgress size={36} sx={{ color: '#6AD39C', mb: 1.25 }} />
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: '#111827', mb: 0.35 }}>{t('container.analyzing_title')}{waitDots}</Typography>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#6b7280' }}>{t('container.analyzing_subtitle')}</Typography>
    </Box>
  );
};

/** Success card shown once the interview results have been saved. */
const CompletionCard: React.FC = () => {
  const { t } = useTranslation('interview');

  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Box sx={{
        width: 48, height: 48, borderRadius: '50%', mx: 'auto', mb: 1.25,
        bgcolor: 'rgba(106,211,156,0.1)',
        border: '2px solid rgba(106,211,156,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 28, color: '#6AD39C' }} />
      </Box>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', color: '#111827', mb: 0.35 }}>
        {t('ended.title')}
      </Typography>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>
        {t('ended.subtitle')}
      </Typography>
      <Box sx={{
        mt: 1.25, px: 1.5, py: 0.875, borderRadius: '10px',
        bgcolor: 'rgba(106,211,156,0.06)', border: '1px solid rgba(106,211,156,0.2)',
      }}>
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.7rem', color: '#10453F' }}>
          {t('ended.redirect')}
        </Typography>
      </Box>
    </Box>
  );
};
