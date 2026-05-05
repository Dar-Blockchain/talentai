import React from 'react';
import { Box, Typography, Chip, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WorkIcon from '@mui/icons-material/Work';
import { sectionStyle, sectionTitleStyle, formatAreaName, CHART_COLORS } from './helpers';

interface CoverageAreasProps {
  coverageAreas: Record<string, any>;
}

const CoverageAreas: React.FC<CoverageAreasProps> = ({ coverageAreas }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const entries = Object.entries(coverageAreas);
  if (entries.length === 0) return null;

  return (
    <Box sx={sectionStyle}>
      <Typography variant="h5" sx={sectionTitleStyle()}>{s('coverage_areas.title')}</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {entries.map(([areaKey, areaData]: [string, any], index) => (
          <Box key={areaKey} sx={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '16px', border: '1px solid rgba(238, 240, 242, 1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WorkIcon sx={{ fontSize: 18, color: CHART_COLORS[index % CHART_COLORS.length] }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '14px', textTransform: 'capitalize' }}>
                    {formatAreaName(areaKey)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '11px' }}>
                    {s('coverage_areas.meta', { depth: areaData.depth, count: areaData.questionsAsked || 0 })}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={areaData.completed ? s('coverage_areas.completed') : s('coverage_areas.in_progress')}
                  size="small"
                  sx={{
                    backgroundColor: areaData.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: areaData.completed ? '#10b981' : '#f59e0b',
                    fontWeight: 600, fontSize: '0.7rem', height: 22,
                    border: `1px solid ${areaData.completed ? '#10b981' : '#f59e0b'}`,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: CHART_COLORS[index % CHART_COLORS.length], fontSize: '16px' }}>
                  {Math.round(areaData.percentage || 0)}%
                </Typography>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={areaData.percentage || 0}
              sx={{
                height: 6, borderRadius: 3, backgroundColor: '#e5e7eb', mb: 1.5,
                '& .MuiLinearProgress-bar': { backgroundColor: CHART_COLORS[index % CHART_COLORS.length], borderRadius: 3 },
              }}
            />

            {areaData.indicators?.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {areaData.indicators.map((indicator: any, idx: number) => (
                  <Chip
                    key={idx}
                    label={indicator.name}
                    size="small"
                    sx={{
                      backgroundColor: indicator.covered ? 'rgba(16, 185, 129, 0.1)' : '#f3f4f6',
                      color: indicator.covered ? '#065f46' : '#6b7280',
                      fontWeight: 500, fontSize: '0.65rem', height: 20,
                      border: indicator.covered ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(CoverageAreas);
