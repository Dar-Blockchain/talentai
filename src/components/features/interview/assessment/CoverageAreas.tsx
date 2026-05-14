import React from 'react';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LayersOutlined from '@mui/icons-material/LayersOutlined';
import { NAVY, NAVY2, GRAY2, BORDER, T, TL, formatAreaName, CHART_COLORS } from './helpers';

interface CoverageAreasProps {
  coverageAreas: Record<string, any>;
}

const CoverageAreas: React.FC<CoverageAreasProps> = ({ coverageAreas }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const entries = Object.entries(coverageAreas);
  if (entries.length === 0) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, #6366f1, #8b5cf6)` }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayersOutlined sx={{ fontSize: 16, color: '#6366f1' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('coverage_areas.title')}</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {entries.map(([areaKey, areaData]: [string, any], index) => {
            const color = CHART_COLORS[index % CHART_COLORS.length];
            const pct   = Math.round(areaData.percentage || 0);
            return (
              <Box key={areaKey} sx={{
                borderRadius: '14px', p: '14px 16px',
                bgcolor: '#FAFAFA', border: `1px solid ${BORDER}`,
              }}>
                {/* Header row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color }}>{formatAreaName(areaKey).charAt(0)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: NAVY2, fontSize: '0.82rem', textTransform: 'capitalize' }}>
                        {formatAreaName(areaKey)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: GRAY2 }}>
                        {s('coverage_areas.meta', { depth: areaData.depth, count: areaData.questionsAsked || 0 })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={areaData.completed ? s('coverage_areas.completed') : s('coverage_areas.in_progress')}
                      size="small"
                      sx={{
                        height: 20, fontSize: '0.62rem', fontWeight: 700,
                        bgcolor: areaData.completed ? '#F0FDF4' : '#FFFBEB',
                        color:   areaData.completed ? '#059669' : '#D97706',
                        border:  `1px solid ${areaData.completed ? '#BBF7D0' : '#FDE68A'}`,
                      }}
                    />
                    <Typography sx={{ fontWeight: 800, color, fontSize: '0.88rem', minWidth: 34, textAlign: 'right' }}>
                      {pct}%
                    </Typography>
                  </Box>
                </Box>

                {/* Progress bar */}
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 5, borderRadius: '99px', bgcolor: '#F1F5F9', mb: areaData.indicators?.length > 0 ? 1.25 : 0,
                    '& .MuiLinearProgress-bar': { borderRadius: '99px', bgcolor: color },
                  }}
                />

                {/* Indicator chips */}
                {areaData.indicators?.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {areaData.indicators.map((indicator: any, idx: number) => (
                      <Chip
                        key={idx}
                        label={indicator.name}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.62rem', fontWeight: 500,
                          bgcolor: indicator.covered ? '#F0FDF4' : '#F8FAFC',
                          color:   indicator.covered ? '#059669' : GRAY2,
                          border:  indicator.covered ? '1px solid #BBF7D0' : `1px solid ${BORDER}`,
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(CoverageAreas);
