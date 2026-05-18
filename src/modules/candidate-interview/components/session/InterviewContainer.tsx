import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  onStartInterview: () => void;
}

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  interviewStatus,
  isHydrated,
  connectionStatus,
  cameraStatus,
  agentState,
  currentTranscript,
  onStartInterview,
}) => {
  const { t } = useTranslation('interview');
  const [waitDots, setWaitDots] = useState('');

  const allReady = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  const checks = useMemo(() => [
    { label: t('container.check_camera'),  ok: cameraStatus === 'granted' },
    { label: t('container.check_system'),  ok: connectionStatus === 'connected' },
    { label: t('container.check_loaded'),  ok: isHydrated },
  ], [cameraStatus, connectionStatus, isHydrated, t]);

  return (
    <Box sx={{ bgcolor: 'transparent', borderRadius: '16px', border: '1px solid #ede9f8', overflow: 'hidden' }}>

      {interviewStatus === 'active' && <AgentHeader agentState={agentState} />}

      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        {interviewStatus === 'idle' && (
          <ReadinessChecklist
            checks={checks}
            allReady={allReady}
            cameraStatus={cameraStatus}
            onStartInterview={onStartInterview}
          />
        )}

        {interviewStatus === 'connecting' && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={48} sx={{ color: '#8310FF', mb: 2 }} />
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 0.5 }}>{t('container.starting_title')}</Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280' }}>{t('container.starting_subtitle')}</Typography>
          </Box>
        )}

        {interviewStatus === 'active'  && <LiveTranscript currentTranscript={currentTranscript} />}
        {interviewStatus === 'ended'   && <AnalyzingSpinner waitDots={waitDots} />}
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
    <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #ede9f8', px: 2.5, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        bgcolor: isProcessing ? 'rgba(245,158,11,0.1)' : 'rgba(131,16,255,0.08)',
        border: `1px solid ${isProcessing ? 'rgba(245,158,11,0.2)' : 'rgba(131,16,255,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isProcessing
          ? <AutorenewIcon sx={{ fontSize: 20, color: '#d97706', animation: 'spin 1.2s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
          : <KeyboardVoiceIcon sx={{ fontSize: 20, color: '#8310FF' }} />
        }
      </Box>
      <Box>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: '#111827', lineHeight: 1.2 }}>
          {agentState === 'thinking' ? t('container.thinking') : agentState === 'processing' ? t('container.processing') : t('container.recording')}
        </Typography>
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af', mt: 0.2 }}>
          {isProcessing ? t('container.wait') : t('container.listening')}
        </Typography>
      </Box>
    </Box>
  );
};

interface ReadinessChecklistProps {
  checks: { label: string; ok: boolean }[];
  allReady: boolean;
  cameraStatus: CameraStatus;
  onStartInterview: () => void;
}

/** Pre-flight checklist shown before the interview starts, with the start button. */
const ReadinessChecklist: React.FC<ReadinessChecklistProps> = ({ checks, allReady, cameraStatus, onStartInterview }) => {
  const { t } = useTranslation('interview');

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(131,16,255,0.08)', border: '2px solid rgba(131,16,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <PlayArrowIcon sx={{ fontSize: 36, color: '#8310FF' }} />
      </Box>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#111827', mb: 0.5 }}>{t('container.ready_title')}</Typography>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280', mb: 3, lineHeight: 1.6 }}>{t('container.ready_subtitle')}</Typography>

      <Box sx={{ mb: 3 }}>
        {checks.map(({ label, ok }) => (
          <Box key={label} display="flex" alignItems="center" gap={1.25} sx={{ py: 0.6, borderBottom: '1px solid #f3f4f6', '&:last-child': { borderBottom: 'none' } }}>
            {ok
              ? <CheckCircleIcon sx={{ fontSize: 17, color: '#22c55e', flexShrink: 0 }} />
              : <RadioButtonUncheckedIcon sx={{ fontSize: 17, color: '#d1d5db', flexShrink: 0 }} />}
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: ok ? '#374151' : '#9ca3af', flex: 1, textAlign: 'left' }}>{label}</Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 600, color: ok ? '#22c55e' : '#f59e0b' }}>
              {ok ? t('container.check_ok') : t('container.check_waiting')}
            </Typography>
          </Box>
        ))}
      </Box>

      <Button variant="contained" fullWidth onClick={onStartInterview} disabled={!allReady} startIcon={<PlayArrowIcon />}
        sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.92rem', py: 1.5, borderRadius: '12px', bgcolor: allReady ? '#8310FF' : '#e5e7eb', color: '#fff', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: allReady ? '#6d0ee0' : '#e5e7eb', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: '#f3f4f6', color: '#9ca3af', boxShadow: 'none' } }}>
        {t('start.btn_start')}
      </Button>

      {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} sx={{ mt: 1.5 }}>
          <VideocamIcon sx={{ fontSize: 15, color: '#f59e0b' }} />
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#f59e0b' }}>{t('container.camera_warning')}</Typography>
        </Box>
      )}
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
        sx={{ maxHeight: 200, overflowY: 'auto', mb: 2, pr: 0.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(131,16,255,0.2)', borderRadius: 2 } }}
        ref={(el: HTMLDivElement | null) => { if (el) el.scrollTop = el.scrollHeight; }}
      >
        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: currentTranscript ? '#374151' : '#9ca3af', fontStyle: currentTranscript ? 'normal' : 'italic', lineHeight: 1.7, minHeight: 80 }}>
          {currentTranscript || t('container.speech_placeholder')}
        </Typography>
      </Box>
    </Box>
  );
};

/** Spinner + animated dots shown while the backend generates the interview report. */
const AnalyzingSpinner: React.FC<{ waitDots: string }> = ({ waitDots }) => {
  const { t } = useTranslation('interview');

  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <CircularProgress size={48} sx={{ color: '#8310FF', mb: 2 }} />
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 0.5 }}>{t('container.analyzing_title')}{waitDots}</Typography>
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280' }}>{t('container.analyzing_subtitle')}</Typography>
    </Box>
  );
};