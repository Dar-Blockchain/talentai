import React, { useState } from 'react';
import { Box, Typography, LinearProgress, Collapse, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { InterviewStatus, Coverage, RealTimeReport } from '@/types/interview';
import { useTranslation } from 'react-i18next';

const PURPLE = '#8310FF';

const scoreColor = (pct: number) =>
  pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

interface CoverageDashboardProps {
  interviewStatus: InterviewStatus;
  coverage: Coverage | null;
  realTimeReport: RealTimeReport | null;
  agentMessage: string;
  coverageDashboardExpanded: boolean;
  onToggleExpand: () => void;
}

const CoverageDashboard: React.FC<CoverageDashboardProps> = ({ coverage }) => {
  const { t } = useTranslation('interview');
  const [open, setOpen] = useState(true);

  if (!coverage) return null;

  const overall = Math.round(coverage.overall || 0);
  const areas = coverage.areas ? Object.entries(coverage.areas) : [];

  const scoreLabel = (pct: number) =>
    pct >= 80 ? t('coverage_dashboard.strong') : pct >= 50 ? t('coverage_dashboard.moderate') : t('coverage_dashboard.needs_work');

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid #ede9f8',
        overflow: 'hidden',
        mt: 2,
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #ede9f8',
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '50%',
              bgcolor: 'rgba(131,16,255,0.08)',
              border: '1px solid rgba(131,16,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AssessmentIcon sx={{ fontSize: 20, color: PURPLE }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: '#111827', lineHeight: 1.2 }}>
              {t('coverage_dashboard.title')}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af', mt: 0.2 }}>
              {t('coverage_dashboard.subtitle')}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
        {/* Overall score pill */}
        <Box
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            bgcolor: overall >= 80 ? 'rgba(34,197,94,0.07)' : overall >= 50 ? 'rgba(245,158,11,0.07)' : 'rgba(239,68,68,0.07)',
            border: `1px solid ${overall >= 80 ? 'rgba(34,197,94,0.2)' : overall >= 50 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '12px', px: 2, py: 0.75,
          }}
        >
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: scoreColor(overall), lineHeight: 1 }}>
            {overall}%
          </Typography>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.65rem', color: scoreColor(overall), mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {scoreLabel(overall)}
          </Typography>
        </Box>

          <IconButton size="small" onClick={() => setOpen(o => !o)} sx={{ color: '#9ca3af' }}>
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Collapse in={open}>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Overall progress bar */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: '#374151' }}>
              {t('coverage_dashboard.overall')}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.78rem', color: scoreColor(overall) }}>
              {overall}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(overall, 100)}
            sx={{
              height: 8, borderRadius: 4,
              bgcolor: 'rgba(131,16,255,0.07)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${PURPLE}, #a855f7)`,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Divider */}
        {areas.length > 0 && (
          <Box sx={{ borderTop: '1px solid #f3f4f6' }} />
        )}

        {/* Competency area rows */}
        {areas.length > 0 && (
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: '#111827', mb: 1.5 }}>
              {t('coverage_dashboard.breakdown')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {areas.map(([areaName, areaData]: [string, any], idx) => {
                const pct = Math.round(areaData.percentage || 0);
                const ok = pct >= 50;
                return (
                  <Box
                    key={areaName}
                    display="flex"
                    alignItems="center"
                    gap={1.25}
                    sx={{
                      py: 1,
                      borderBottom: idx < areas.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                  >
                    {ok
                      ? <CheckCircleIcon sx={{ fontSize: 17, color: '#22c55e', flexShrink: 0 }} />
                      : <RadioButtonUncheckedIcon sx={{ fontSize: 17, color: '#d1d5db', flexShrink: 0 }} />
                    }

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.4}>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {areaName}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 700, color: scoreColor(pct), flexShrink: 0, ml: 1 }}>
                          {pct}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(pct, 100)}
                        sx={{
                          height: 4, borderRadius: 2,
                          bgcolor: '#f3f4f6',
                          '& .MuiLinearProgress-bar': { bgcolor: scoreColor(pct), borderRadius: 2 },
                        }}
                      />
                    </Box>

                    <Typography sx={{
                      fontFamily: 'Poppins', fontSize: '0.65rem', fontWeight: 600,
                      color: scoreColor(pct), flexShrink: 0,
                      textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 60, textAlign: 'right',
                    }}>
                      {scoreLabel(pct)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

      </Box>
      </Collapse>
    </Box>
  );
};

export default CoverageDashboard;
