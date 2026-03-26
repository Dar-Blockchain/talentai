import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ArrowBackOutlined          from '@mui/icons-material/ArrowBackOutlined';
import StopOutlined               from '@mui/icons-material/Stop';
import AccessTimeIcon             from '@mui/icons-material/AccessTime';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import { Campaign }               from '@/types/campaign';
import { Coverage }               from '@/types/interview';
import { getModuleMeta }          from './interviewMeta';

interface Props {
  campaign:        Campaign;
  moduleType:      string;
  interviewStatus: string;
  isVoiceActive:   boolean;
  agentState:      string;
  coverage:        Coverage | null;
  elapsedTime?:    number;
  timeWarning?:    boolean;
  onBack:          () => void;
  onEnd:           () => void;
}

const InterviewPageHeader: React.FC<Props> = ({
  campaign, moduleType, interviewStatus, isVoiceActive, agentState,
  coverage, elapsedTime, timeWarning, onBack, onEnd,
}) => {
  const meta    = getModuleMeta(moduleType);
  const ModIcon = meta.icon;
  const isActive = interviewStatus === 'active';
  const overall  = Math.round(coverage?.overall ?? 0);
  const mins = Math.floor((elapsedTime ?? 0) / 60);
  const secs = String((elapsedTime ?? 0) % 60).padStart(2, '0');

  const statusDot = (
    isActive ? '#10B981' :
    interviewStatus === 'connecting' ? '#F59E0B' :
    interviewStatus === 'ended' ? '#6B7280' : '#6B7280'
  );

  return (
    <Box sx={{
      flexShrink: 0,
      bgcolor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #E2E8F0',
      px: { xs: 2, md: 3 },
      height: 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      zIndex: 100,
      position: 'relative',
    }}>
      {/* Accent line at very top */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: meta.gradient }} />

      {/* Left */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconButton
          size="small"
          onClick={onBack}
          disabled={isActive}
          sx={{
            color: '#94A3B8',
            '&:hover': { color: '#0F172A', bgcolor: 'rgba(0,0,0,0.04)' },
            '&.Mui-disabled': { color: '#CBD5E1' },
          }}
        >
          <ArrowBackOutlined sx={{ fontSize: 18 }} />
        </IconButton>

        <Box sx={{ p: 1, borderRadius: 2, background: meta.gradient, display: 'flex', alignItems: 'center' }}>
          <ModIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
            {campaign.title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.25 }}>
            {meta.label}
            {moduleType === 'SKILL_TEST' && (campaign.module as any)?.config?.skill
              ? ` · ${(campaign.module as any).config.skill}` : ''}
          </Typography>
        </Box>
      </Box>

      {/* Center — status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: '50%', bgcolor: statusDot,
            ...(isActive ? {
              animation: 'headerPulse 1.4s infinite',
              '@keyframes headerPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
            } : {}),
          }} />
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {isActive ? 'Live' : interviewStatus === 'connecting' ? 'Connecting…' : interviewStatus === 'ended' ? 'Completed' : 'Ready'}
          </Typography>
        </Box>

        {isActive && coverage && coverage.overall > 0 && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            px: 1.25, py: 0.4, borderRadius: 5,
            bgcolor: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
          }}>
            <AssignmentTurnedInOutlined sx={{ fontSize: 11, color: '#A78BFA' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#A78BFA' }}>{overall}%</Typography>
          </Box>
        )}

        {isVoiceActive && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            px: 1.25, py: 0.4, borderRadius: 5,
            bgcolor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)',
            animation: 'speakPulse 0.8s infinite',
            '@keyframes speakPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
          }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10B981' }} />
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#065F46' }}>Speaking</Typography>
          </Box>
        )}
      </Box>

      {/* Right */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {isActive && elapsedTime !== undefined && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            px: 1.5, py: 0.5, borderRadius: 5,
            bgcolor: timeWarning ? 'rgba(239,68,68,0.15)' : '#F1F5F9',
            border: `1px solid ${timeWarning ? 'rgba(239,68,68,0.3)' : '#E2E8F0'}`,
          }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: timeWarning ? '#EF4444' : '#94A3B8' }} />
            <Typography sx={{
              fontSize: 12, fontWeight: 700,
              color: timeWarning ? '#EF4444' : '#0F172A',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {mins}:{secs}
            </Typography>
          </Box>
        )}

        {isActive && (
          <Button
            size="small"
            startIcon={<StopOutlined sx={{ fontSize: 13 }} />}
            onClick={onEnd}
            sx={{
              bgcolor: 'rgba(239,68,68,0.08)', color: '#DC2626',
              border: '1px solid rgba(239,68,68,0.2)',
              fontWeight: 700, fontSize: 12, textTransform: 'none',
              borderRadius: 1.5, px: 1.75, py: 0.5, minWidth: 0,
              '&:hover': { bgcolor: 'rgba(239,68,68,0.15)', color: '#B91C1C' },
            }}
          >
            End
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default InterviewPageHeader;
