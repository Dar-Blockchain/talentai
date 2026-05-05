import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { sectionStyle } from './helpers';

interface SummarySectionProps {
  summary: string;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  if (!summary) return null;

  return (
    <Box sx={sectionStyle}>
      <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500, mb: 1 }}>
        {s('summary_section.title')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 1)', fontSize: '12px', fontWeight: 400, lineHeight: 1.6 }}>
        {summary}
      </Typography>
    </Box>
  );
};

export default React.memo(SummarySection);
