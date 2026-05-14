import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChanges';
import { NAVY, NAVY2, GRAY2, BORDER, formatAreaName } from './helpers';

interface AiAnalysisSectionProps {
  aiAnalysis: {
    strongestAreas?: string[];
    weakestAreas?: string[];
    recommendedFocus?: string[];
  };
}

const ANALYSIS_CONFIGS = [
  {
    key: 'strongestAreas' as const,
    icon: CheckCircleOutlined,
    iconBg: '#F0FDF4', iconColor: '#059669',
    titleColor: '#065f46', itemColor: '#047857',
    cardBg: '#F0FDF4', cardBorder: '#BBF7D0',
    barColor: '#059669',
    labelKey: 'ai_analysis.strongest_areas',
  },
  {
    key: 'weakestAreas' as const,
    icon: WarningAmberOutlined,
    iconBg: '#FEF2F2', iconColor: '#DC2626',
    titleColor: '#991b1b', itemColor: '#b91c1c',
    cardBg: '#FEF2F2', cardBorder: '#FECACA',
    barColor: '#DC2626',
    labelKey: 'ai_analysis.areas_for_improvement',
  },
  {
    key: 'recommendedFocus' as const,
    icon: TrackChangesOutlined,
    iconBg: '#FFFBEB', iconColor: '#D97706',
    titleColor: '#92400e', itemColor: '#a16207',
    cardBg: '#FFFBEB', cardBorder: '#FDE68A',
    barColor: '#D97706',
    labelKey: 'ai_analysis.recommended_focus',
  },
];

const AiAnalysisSection: React.FC<AiAnalysisSectionProps> = ({ aiAnalysis }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const hasData = aiAnalysis.strongestAreas?.length || aiAnalysis.weakestAreas?.length || aiAnalysis.recommendedFocus?.length;
  if (!hasData) return null;

  const activeConfigs = ANALYSIS_CONFIGS.filter(c => (aiAnalysis[c.key]?.length ?? 0) > 0);

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #7C3AED, #8b5cf6)' }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AutoAwesomeOutlined sx={{ fontSize: 16, color: '#7C3AED' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('ai_analysis.title')}</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${activeConfigs.length}, 1fr)` }, gap: 1.5 }}>
          {activeConfigs.map((cfg) => {
            const items = aiAnalysis[cfg.key] ?? [];
            const Icon = cfg.icon;
            return (
              <Box key={cfg.key} sx={{
                borderRadius: '14px', p: 2,
                bgcolor: cfg.cardBg, border: `1px solid ${cfg.cardBorder}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                  <Icon sx={{ fontSize: 14, color: cfg.iconColor }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: cfg.titleColor }}>{s(cfg.labelKey)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                  {items.map((item: string, idx: number) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: cfg.barColor, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.75rem', color: cfg.itemColor, fontWeight: 500 }}>
                        {formatAreaName(item)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(AiAnalysisSection);
