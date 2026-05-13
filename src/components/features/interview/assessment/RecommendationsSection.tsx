import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TipsAndUpdatesOutlined from '@mui/icons-material/TipsAndUpdatesOutlined';
import ArrowRightOutlined from '@mui/icons-material/ArrowRightOutlined';
import { NAVY, NAVY2, GRAY, GRAY2, BORDER } from './helpers';

interface RecommendationsSectionProps {
  recommendations: string[];
}

const REC_COLORS = [
  { num: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { num: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { num: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { num: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { num: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
];

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ recommendations }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  if (recommendations.length === 0) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #D97706, #F59E0B)' }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TipsAndUpdatesOutlined sx={{ fontSize: 16, color: '#D97706' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>
            {s('recommendations.title', { count: recommendations.length })}
          </Typography>
          <Box sx={{ ml: 'auto', px: 1, py: 0.25, borderRadius: '99px', bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#D97706' }}>{recommendations.length}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {recommendations.map((rec, index) => {
            const c = REC_COLORS[index % REC_COLORS.length];
            return (
              <Box key={index} sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.25,
                p: '12px 14px', borderRadius: '12px',
                bgcolor: '#FAFAFA', border: `1px solid ${BORDER}`,
                transition: 'background 0.15s',
                '&:hover': { bgcolor: c.bg, borderColor: c.border },
              }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '8px',
                  bgcolor: c.bg, border: `1px solid ${c.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: '1px',
                }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: c.num }}>{index + 1}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, flex: 1 }}>
                  <ArrowRightOutlined sx={{ fontSize: 16, color: GRAY2, mt: '1px', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.82rem', color: NAVY2, lineHeight: 1.6, fontWeight: 500 }}>{rec}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(RecommendationsSection);
