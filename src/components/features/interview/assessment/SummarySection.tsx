import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NotesOutlined from '@mui/icons-material/NotesOutlined';
import { NAVY, GRAY, GRAY2, BORDER, T, TL } from './helpers';

interface SummarySectionProps {
  summary: string;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  if (!summary) return null;

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: `linear-gradient(90deg, ${T}, ${TL})` }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: '9px', bgcolor: '#F0FDFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NotesOutlined sx={{ fontSize: 16, color: T }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: NAVY }}>{s('summary_section.title')}</Typography>
        </Box>
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: '0.82rem', color: GRAY, lineHeight: 1.75 }}>{summary}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(SummarySection);
