import React from 'react';
import { Box, Typography, Button, CircularProgress, Divider } from '@mui/material';
import CheckCircleOutlined    from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleRounded     from '@mui/icons-material/CheckCircleRounded';
import CancelRounded          from '@mui/icons-material/CancelRounded';
import PlayArrowRounded       from '@mui/icons-material/PlayArrowRounded';
import VisibilityOutlined     from '@mui/icons-material/VisibilityOutlined';
import WifiRounded            from '@mui/icons-material/WifiRounded';
import VideocamRounded        from '@mui/icons-material/VideocamRounded';
import MicRounded             from '@mui/icons-material/MicRounded';
import { getModuleMeta }      from './interviewMeta';

interface Props {
  interviewStatus:  string;
  moduleType:       string;
  isHydrated:       boolean;
  connectionStatus: string;
  cameraStatus:     string;
  onStart:          () => void;
  onViewResults:    () => void;
}

const REQUIREMENTS = [
  { key: 'connection', label: 'Connection',  icon: WifiRounded    },
  { key: 'camera',     label: 'Camera',      icon: VideocamRounded },
  { key: 'mic',        label: 'Microphone',  icon: MicRounded     },
] as const;

// ─── Connecting / Initializing ────────────────────────────────────────────────

const INIT_STEPS = [
  { label: 'Secure connection',    desc: 'Establishing encrypted channel'   },
  { label: 'AI model',             desc: 'Loading interview intelligence'   },
  { label: 'Session environment',  desc: 'Configuring your workspace'       },
];

const ConnectingState: React.FC<{ accent: string; gradient: string; moduleType?: string }> = ({ accent, gradient, moduleType }) => {
  const meta = getModuleMeta(moduleType ?? 'AI_INTERVIEW');
  const ModIcon = meta.icon;
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState<number[]>([]);

  React.useEffect(() => {
    const t = setInterval(() => {
      setDone(d => d.includes(step) ? d : [...d, step]);
      setStep(s => Math.min(s + 1, INIT_STEPS.length - 1));
    }, 1600);
    return () => clearInterval(t);
  }, [step]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: 3.5 }}>

      {/* Header — same as ReadyState */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.6, borderRadius: 5, mb: 2.5,
          bgcolor: `${accent}12`,
          border: `1px solid ${accent}25`,
        }}>
          <ModIcon sx={{ fontSize: 15, color: accent }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {meta.label}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 38, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.03em', mb: 1.5 }}>
          Setting{' '}
          <Box component="span" sx={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Things Up
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 15, color: '#64748B', lineHeight: 1.75, maxWidth: 360 }}>
          Please wait while we initialize your AI session and verify all systems.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9', width: '100%' }} />

      {/* Step list — same card style as system checks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 400 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Initialization Steps
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {INIT_STEPS.map(({ label, desc }, i) => {
            const isDone   = done.includes(i);
            const isActive = step === i && !isDone;
            return (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 1.5, py: 1.1, borderRadius: 2,
                bgcolor: isDone
                  ? 'rgba(16,185,129,0.05)'
                  : isActive
                  ? `${accent}08`
                  : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isDone ? 'rgba(16,185,129,0.15)' : isActive ? `${accent}20` : '#E2E8F0'}`,
                transition: 'all 0.4s',
              }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                  bgcolor: isDone ? 'rgba(16,185,129,0.1)' : isActive ? `${accent}12` : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.4s',
                }}>
                  {isDone
                    ? <CheckCircleRounded sx={{ fontSize: 15, color: '#10B981' }} />
                    : isActive
                    ? <CircularProgress size={14} thickness={4} sx={{ color: accent }} />
                    : <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#CBD5E1' }} />
                  }
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{
                    fontSize: 13, fontWeight: 600,
                    color: isDone ? '#10B981' : isActive ? '#0F172A' : '#94A3B8',
                    transition: 'color 0.3s',
                  }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: isDone ? '#94A3B8' : isActive ? '#64748B' : '#CBD5E1', lineHeight: 1.3 }}>
                    {desc}
                  </Typography>
                </Box>
                {isDone && <CheckCircleRounded sx={{ fontSize: 16, color: '#10B981', flexShrink: 0 }} />}
                {isActive && (
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                    Active
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Footer note */}
      <Typography sx={{ fontSize: 12, color: '#CBD5E1' }}>
        This usually takes less than 5 seconds
      </Typography>
    </Box>
  );
};

// ─── Ended state ──────────────────────────────────────────────────────────────

const EndedState: React.FC<{ onViewResults: () => void }> = ({ onViewResults }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 4 }}>
    <Box sx={{
      width: 72, height: 72, borderRadius: '50%', mb: 3,
      background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CheckCircleOutlined sx={{ fontSize: 36, color: '#10B981' }} />
    </Box>
    <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#0F172A', mb: 1.5, letterSpacing: '-0.02em' }}>
      Interview Complete
    </Typography>
    <Typography sx={{ fontSize: 14, color: '#64748B', mb: 5, lineHeight: 1.7, maxWidth: 340 }}>
      Your responses have been recorded and are being analyzed. Results are ready below.
    </Typography>
    <Button
      variant="contained"
      startIcon={<VisibilityOutlined />}
      onClick={onViewResults}
      sx={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
        fontWeight: 700, fontSize: 14, textTransform: 'none',
        borderRadius: 2.5, px: 5, py: 1.5,
        '&:hover': { boxShadow: '0 8px 28px rgba(16,185,129,0.4)', transform: 'translateY(-1px)' },
        transition: 'all 0.2s',
      }}
    >
      View Results
    </Button>
  </Box>
);

// ─── Ready state ──────────────────────────────────────────────────────────────

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
  const allReady = canStart;

  const checks = {
    connection: connectionStatus === 'connected',
    camera:     cameraStatus === 'granted',
    mic:        isHydrated,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: "flex-start", width: '100%',  gap: 3.5 }}>

      {/* Header */}
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.6, borderRadius: 5, mb: 2.5,
          bgcolor: `${meta.accent}12`,
          border: `1px solid ${meta.accent}25`,
        }}>
          <ModIcon sx={{ fontSize: 15, color: meta.accent }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: meta.accent, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {meta.label}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 38, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.03em', mb: 1.5 }}>
          Ready to{' '}
          <Box component="span" sx={{ background: meta.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Begin?
          </Box>
        </Typography>
        <Typography sx={{ fontSize: 15, color: '#64748B', lineHeight: 1.75, maxWidth: 360 }}>
          {moduleType === 'SKILL_TEST'
            ? 'AI-powered skill assessment. Answer each question clearly — the AI adapts to your level in real time.'
            : 'AI-powered interview session. Answer openly — the AI listens, adapts, and evaluates in real time.'}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* System checks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 400 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
          System Check
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {REQUIREMENTS.map(({ key, label, icon: Icon }) => {
            const ok = checks[key];
            return (
              <Box key={key} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 1.5, py: 1.1, borderRadius: 2,
                bgcolor: ok ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
              }}>
                <Box sx={{
                  width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                  bgcolor: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon sx={{ fontSize: 15, color: ok ? '#10B981' : '#EF4444' }} />
                </Box>
                <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                  {label}
                </Typography>
                {ok
                  ? <CheckCircleRounded sx={{ fontSize: 16, color: '#10B981' }} />
                  : <CancelRounded     sx={{ fontSize: 16, color: '#EF4444' }} />
                }
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Start button */}
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        {canStart ? (
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
            {/* Glow layer behind button */}
            <Box sx={{
              position: 'absolute', inset: 0, borderRadius: '14px',
              background: meta.gradient,
              filter: 'blur(14px)',
              opacity: 0.35,
              transform: 'translateY(4px) scaleX(0.92)',
            }} />
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={onStart}
              sx={{
                position: 'relative',
                background: meta.gradient,
                boxShadow: `0 4px 20px ${meta.shadow}`,
                fontWeight: 800, fontSize: 15, textTransform: 'none',
                borderRadius: '14px', py: 1.75, px: 2, letterSpacing: '-0.01em',
                border: '1px solid rgba(255,255,255,0.2)',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
                  pointerEvents: 'none',
                },
                '&:hover': {
                  boxShadow: `0 8px 32px ${meta.shadow}`,
                  transform: 'translateY(-2px)',
                },
                '&:active': { transform: 'translateY(0px)' },
                transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {/* Animated play icon wrapper */}
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <PlayArrowRounded sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                    Start Interview
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', lineHeight: 1, fontWeight: 500 }}>
                    All systems ready
                  </Typography>
                </Box>
              </Box>
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled
            sx={{
              bgcolor: '#F1F5F9', color: '#94A3B8',
              fontWeight: 700, fontSize: 14, textTransform: 'none',
              borderRadius: '14px', py: 1.75, boxShadow: 'none',
              border: '1px solid #E2E8F0',
              '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#94A3B8' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={14} thickness={4} sx={{ color: '#CBD5E1' }} />
              Waiting for system checks…
            </Box>
          </Button>
        )}

        {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#F59E0B', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: '#92400E' }}>
              Camera access required to start the session
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const InterviewStatusPanel: React.FC<Props> = (props) => {
  const { interviewStatus, moduleType, isHydrated, connectionStatus, cameraStatus, onStart, onViewResults } = props;
  const meta     = getModuleMeta(moduleType);
  const canStart = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  if (interviewStatus === 'connecting') return <ConnectingState accent={meta.accent} gradient={meta.gradient} moduleType={moduleType} />;
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
