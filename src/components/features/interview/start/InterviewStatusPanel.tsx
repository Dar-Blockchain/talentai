import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import PlayArrowOutlined   from '@mui/icons-material/PlayArrow';
import VisibilityOutlined  from '@mui/icons-material/VisibilityOutlined';
import { getModuleMeta }   from './interviewMeta';

interface Props {
  interviewStatus:  string;
  moduleType:       string;
  isHydrated:       boolean;
  connectionStatus: string;
  cameraStatus:     string;
  onStart:          () => void;
  onViewResults:    () => void;
}

// ─── Connecting ───────────────────────────────────────────────────────────────

const ConnectingState: React.FC<{ accent: string }> = ({ accent }) => (
  <Box sx={{ textAlign: 'center', py: 10 }}>
    <CircularProgress size={44} sx={{ color: accent, mb: 3 }} />
    <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
      Initializing Assessment…
    </Typography>
    <Typography sx={{ fontSize: 13, color: '#6B7280', mt: 1 }}>
      Setting up your AI session
    </Typography>
  </Box>
);

// ─── Ended ────────────────────────────────────────────────────────────────────

const EndedState: React.FC<{ onViewResults: () => void }> = ({ onViewResults }) => (
  <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#ECFDF5', borderRadius: 3, border: '1.5px solid #A7F3D0' }}>
    <CheckCircleOutlined sx={{ fontSize: 56, color: '#10B981', mb: 2, opacity: 0.9 }} />
    <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827', mb: 1 }}>
      Assessment Complete!
    </Typography>
    <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 4, maxWidth: 460, mx: 'auto', lineHeight: 1.7 }}>
      Your responses have been recorded and are being analyzed. Results will be available shortly.
    </Typography>
    <Button
      variant="contained"
      startIcon={<VisibilityOutlined />}
      onClick={onViewResults}
      sx={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
        fontWeight: 700, fontSize: 14, textTransform: 'none',
        borderRadius: 2.5, px: 4, py: 1.4,
        '&:hover': { boxShadow: '0 6px 20px rgba(16,185,129,0.45)', transform: 'translateY(-1px)' },
        transition: 'all 0.25s',
      }}
    >
      View Results
    </Button>
  </Box>
);

// ─── Ready (idle) ─────────────────────────────────────────────────────────────

const REQUIREMENTS = [
  { key: 'connection', label: 'Connection' },
  { key: 'camera',     label: 'Camera'     },
  { key: 'mic',        label: 'Microphone' },
] as const;

const ReadyState: React.FC<{
  moduleType:       string;
  isHydrated:       boolean;
  connectionStatus: string;
  cameraStatus:     string;
  canStart:         boolean;
  onStart:          () => void;
}> = ({ moduleType, isHydrated, connectionStatus, cameraStatus, canStart, onStart }) => {
  const meta    = getModuleMeta(moduleType);
  const ModIcon = meta.icon;

  const checks = {
    connection: connectionStatus === 'connected',
    camera:     cameraStatus === 'granted',
    mic:        isHydrated,
  };

  return (
    <Box sx={{
      textAlign: 'center', py: 7, px: 3,
      background: 'linear-gradient(135deg, rgba(102,126,234,0.04) 0%, rgba(118,75,162,0.04) 100%)',
      borderRadius: 3, border: '2px dashed rgba(102,126,234,0.2)',
    }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: 3, background: meta.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        mx: 'auto', mb: 3, boxShadow: `0 8px 24px ${meta.shadow}`,
      }}>
        <ModIcon sx={{ fontSize: 36, color: '#fff' }} />
      </Box>

      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827', mb: 1 }}>
        Ready to Begin?
      </Typography>
      <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.75 }}>
        {moduleType === 'SKILL_TEST'
          ? 'This is an AI-powered skill assessment. Answer each question clearly — the AI adapts to your technical level in real time.'
          : 'This is an AI-powered interview. Answer openly and take your time — the AI adapts to your responses in real time.'}
      </Typography>

      {/* Requirements checklist */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
        {REQUIREMENTS.map(({ key, label }) => {
          const ok = checks[key];
          return (
            <Box key={key} sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.6, borderRadius: 5,
              bgcolor: ok ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`,
            }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ok ? '#22C55E' : '#EF4444' }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: ok ? '#16A34A' : '#DC2626' }}>
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Button
        variant="contained" size="large"
        startIcon={<PlayArrowOutlined />}
        onClick={onStart}
        disabled={!canStart}
        sx={{
          background: canStart ? meta.gradient : undefined,
          boxShadow: canStart ? `0 4px 18px ${meta.shadow}` : 'none',
          fontWeight: 700, fontSize: 15, textTransform: 'none',
          borderRadius: 2.5, px: 5, py: 1.5,
          '&:hover': { boxShadow: `0 8px 24px ${meta.shadow}`, transform: 'translateY(-1px)' },
          '&:disabled': { bgcolor: '#D1D5DB', color: '#9CA3AF' },
          transition: 'all 0.25s',
        }}
      >
        Start Assessment
      </Button>

      {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
        <Typography sx={{ mt: 2, fontSize: 12, fontWeight: 500, color: '#F59E0B' }}>
          ⚠️ Camera access is required to start
        </Typography>
      )}
    </Box>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

const InterviewStatusPanel: React.FC<Props> = (props) => {
  const { interviewStatus, moduleType, isHydrated, connectionStatus, cameraStatus, onStart, onViewResults } = props;
  const meta     = getModuleMeta(moduleType);
  const canStart = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  if (interviewStatus === 'connecting') return <ConnectingState accent={meta.accent} />;
  if (interviewStatus === 'ended')      return <EndedState onViewResults={onViewResults} />;

  return (
    <ReadyState
      moduleType={moduleType}
      isHydrated={isHydrated}
      connectionStatus={connectionStatus}
      cameraStatus={cameraStatus}
      canStart={canStart}
      onStart={onStart}
    />
  );
};

export default InterviewStatusPanel;
