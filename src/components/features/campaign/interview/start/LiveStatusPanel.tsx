import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import MicIcon           from '@mui/icons-material/Mic';
import MicOffIcon        from '@mui/icons-material/MicOff';
import VideocamIcon      from '@mui/icons-material/Videocam';
import VideocamOffIcon   from '@mui/icons-material/VideocamOff';
import WifiIcon          from '@mui/icons-material/Wifi';
import WifiOffIcon       from '@mui/icons-material/WifiOff';
import FiberManualRecord from '@mui/icons-material/FiberManualRecord';
import PsychologyIcon    from '@mui/icons-material/Psychology';
import VolumeUpIcon      from '@mui/icons-material/VolumeUp';
import VisibilityIcon    from '@mui/icons-material/Visibility';
import AssessmentIcon    from '@mui/icons-material/Assessment';
import { AgentState, CameraStatus, ConnectionStatus, Coverage } from '@/types/interview';

interface Props {
  agentState:       AgentState;
  isVoiceActive:    boolean;
  cameraStatus:     CameraStatus;
  connectionStatus: ConnectionStatus;
  coverage:         Coverage | null;
  elapsedTime:      number;
  isRecording:      boolean;
  moduleType:       string;
}

interface RowProps {
  icon:     React.ReactNode;
  label:    string;
  value:    string;
  dotColor: string;
  pulse?:   boolean;
}

const Row: React.FC<RowProps> = ({ icon, label, value, dotColor, pulse }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 1.25,
    py: 0.9, px: 1.5, borderRadius: 1.5,
    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
    transition: 'background 0.15s',
  }}>
    <Box sx={{
      width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
      bgcolor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 11, color: '#0F172A', fontWeight: 600, lineHeight: 1.3, mt: 0.3 }}>
        {value}
      </Typography>
    </Box>
    <Box sx={{
      width: 6, height: 6, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0,
      ...(pulse ? {
        animation: 'rowPulse 1.4s infinite',
        '@keyframes rowPulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.35, transform: 'scale(0.65)' } },
      } : {}),
    }} />
  </Box>
);

const LiveStatusPanel: React.FC<Props> = ({
  agentState, isVoiceActive, cameraStatus, connectionStatus,
  coverage, elapsedTime, isRecording, moduleType,
}) => {
  const mins = Math.floor(elapsedTime / 60);
  const secs = String(elapsedTime % 60).padStart(2, '0');
  const overall = Math.round(coverage?.overall ?? 0);
  const accent = moduleType === 'SKILL_TEST' ? '#7C3AED' : '#0D9488';

  const aiLabel =
    agentState === 'thinking'   ? 'Processing…' :
    agentState === 'processing' ? 'Analyzing…'  :
    agentState === 'waiting'    ? 'Listening…'  :
    agentState === 'ready'      ? 'Ready'        : 'Listening…';

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5, flexShrink: 0,
        borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%', bgcolor: '#EF4444',
            animation: 'recDot 1.2s infinite',
            '@keyframes recDot': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.25 } },
          }} />
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            AI Session
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
          {mins}:{secs}
        </Typography>
      </Box>

      {/* Rows */}
      <Box sx={{ flex: 1, py: 0.75, overflow: 'auto' }}>
        <Row
          icon={isVoiceActive
            ? <MicIcon sx={{ fontSize: 14, color: '#34D399' }} />
            : <MicOffIcon sx={{ fontSize: 14, color: '#94A3B8' }} />}
          label="Microphone"
          value={isVoiceActive ? 'Speaking' : 'Active'}
          dotColor={isVoiceActive ? '#34D399' : '#4B5563'}
          pulse={isVoiceActive}
        />
        <Row
          icon={cameraStatus === 'granted'
            ? <VideocamIcon sx={{ fontSize: 14, color: '#60A5FA' }} />
            : <VideocamOffIcon sx={{ fontSize: 14, color: '#94A3B8' }} />}
          label="Camera"
          value={cameraStatus === 'granted' ? 'Active' : 'Off'}
          dotColor={cameraStatus === 'granted' ? '#60A5FA' : '#4B5563'}
        />
        <Row
          icon={<VisibilityIcon sx={{ fontSize: 14, color: '#A78BFA' }} />}
          label="Eye Contact"
          value="Monitoring"
          dotColor="#A78BFA"
        />
        <Row
          icon={<VolumeUpIcon sx={{ fontSize: 14, color: isVoiceActive ? '#FCD34D' : 'rgba(241,245,249,0.3)' }} />}
          label="Noise Level"
          value={isVoiceActive ? 'Detected' : 'Low'}
          dotColor={isVoiceActive ? '#FCD34D' : '#22C55E'}
        />
        <Row
          icon={<PsychologyIcon sx={{ fontSize: 14, color: accent === '#0D9488' ? '#2DD4BF' : '#A78BFA' }} />}
          label="AI Status"
          value={aiLabel}
          dotColor={accent === '#0D9488' ? '#2DD4BF' : '#A78BFA'}
          pulse={agentState === 'thinking' || agentState === 'processing'}
        />
        <Row
          icon={connectionStatus === 'connected'
            ? <WifiIcon sx={{ fontSize: 14, color: '#34D399' }} />
            : <WifiOffIcon sx={{ fontSize: 14, color: '#EF4444' }} />}
          label="Connection"
          value={connectionStatus === 'connected' ? 'Stable' : connectionStatus}
          dotColor={connectionStatus === 'connected' ? '#34D399' : '#EF4444'}
        />
        <Row
          icon={<FiberManualRecord sx={{ fontSize: 14, color: isRecording ? '#EF4444' : 'rgba(241,245,249,0.3)' }} />}
          label="Recording"
          value={isRecording ? 'On' : 'Off'}
          dotColor={isRecording ? '#EF4444' : '#4B5563'}
          pulse={isRecording}
        />
      </Box>

      {/* Coverage */}
      <Box sx={{ px: 2, pb: 2, pt: 1, flexShrink: 0, borderTop: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AssessmentIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Coverage
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: accent === '#0D9488' ? '#2DD4BF' : '#A78BFA' }}>
            {overall}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={overall}
          sx={{
            height: 4, borderRadius: 2,
            bgcolor: '#E2E8F0',
            '& .MuiLinearProgress-bar': {
              bgcolor: accent === '#0D9488' ? '#2DD4BF' : '#A78BFA',
              borderRadius: 2,
            },
          }}
        />
        {coverage?.areas && Object.keys(coverage.areas).length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1.25 }}>
            {Object.entries(coverage.areas).map(([k, v]: [string, any]) => {
              const pct = v.percentage || 0;
              const lbl = (v.label || k).split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <Box key={k} title={v.label || k} sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.35 }}>
                  <Box sx={{ width: '100%', height: 3, borderRadius: 1, bgcolor: pct >= 70 ? '#34D399' : pct >= 40 ? '#FCD34D' : '#E2E8F0' }} />
                  <Typography sx={{ fontSize: 8, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em' }}>{lbl}</Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LiveStatusPanel;
