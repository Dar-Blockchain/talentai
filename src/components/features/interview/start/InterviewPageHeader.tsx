import React from 'react';
import { Box, Typography, Chip, Button, LinearProgress, IconButton } from '@mui/material';
import ArrowBackOutlined          from '@mui/icons-material/ArrowBackOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import StopOutlined               from '@mui/icons-material/Stop';
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
  onBack:          () => void;
  onEnd:           () => void;
}

const InterviewPageHeader: React.FC<Props> = ({
  campaign, moduleType, interviewStatus, isVoiceActive, agentState, coverage, onBack, onEnd,
}) => {
  const meta     = getModuleMeta(moduleType);
  const ModIcon  = meta.icon;
  const isActive = interviewStatus === 'active';

  const statusLabel =
    interviewStatus === 'idle'       ? 'Ready'       :
    interviewStatus === 'connecting' ? 'Connecting…' :
    isActive                         ? '● Live'      :
    interviewStatus === 'ended'      ? 'Completed'   : interviewStatus;

  return (
    <Box sx={{
      bgcolor: '#fff', borderBottom: '1px solid #E5E7EB',
      px: { xs: 2, md: 4 }, py: 0,
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Module colour bar */}
      <Box sx={{ height: 3, background: meta.gradient, mx: -4 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, gap: 2, flexWrap: 'wrap' }}>
        {/* Left: back + title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            size="small" onClick={onBack} disabled={isActive}
            sx={{ color: '#6B7280', '&:hover': { color: '#111827' } }}
          >
            <ArrowBackOutlined sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ p: 1, borderRadius: 2, background: meta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ModIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {campaign.title}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#6B7280' }}>
              {meta.label}
              {moduleType === 'SKILL_TEST' && (campaign.module as any)?.config?.skill
                ? ` · ${(campaign.module as any).config.skill}`
                : ''}
            </Typography>
          </Box>
        </Box>

        {/* Right: live chips + end */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={statusLabel} size="small"
            sx={{
              fontWeight: 700, fontSize: 11, height: 22,
              bgcolor: isActive ? '#ECFDF5' : '#F3F4F6',
              color:   isActive ? '#059669' : '#6B7280',
              border:  isActive ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
            }}
          />

          {isVoiceActive && (
            <Chip size="small" label="🎤 Speaking" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontSize: 11, height: 22 }} />
          )}
          {agentState === 'thinking' && (
            <Chip size="small" label="🧠 AI Thinking" sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontSize: 11, height: 22 }} />
          )}

          {isActive && coverage && (
            <Chip
              icon={<AssignmentTurnedInOutlined sx={{ fontSize: '13px !important' }} />}
              label={`${Math.round(coverage.overall ?? 0)}%`}
              size="small"
              sx={{ bgcolor: '#F5F3FF', color: '#7C3AED', fontWeight: 700, fontSize: 11, height: 22, '& .MuiChip-icon': { color: '#7C3AED' } }}
            />
          )}

          {isActive && (
            <Button
              size="small"
              startIcon={<StopOutlined sx={{ fontSize: 14 }} />}
              onClick={onEnd}
              sx={{
                bgcolor: '#FEF2F2', color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.2)',
                fontWeight: 700, fontSize: 12, textTransform: 'none',
                borderRadius: 2, px: 2, py: 0.6,
                '&:hover': { bgcolor: '#FEE2E2' },
              }}
            >
              End
            </Button>
          )}
        </Box>
      </Box>

      {/* Coverage progress bar */}
      {isActive && (
        <LinearProgress
          variant="determinate"
          value={Math.min(coverage?.overall ?? 0, 100)}
          sx={{ height: 3, bgcolor: 'rgba(0,0,0,0.04)', '& .MuiLinearProgress-bar': { background: meta.gradient } }}
        />
      )}
    </Box>
  );
};

export default InterviewPageHeader;
