import React from 'react';
import { Box, Typography } from '@mui/material';
import { sectionStyle } from './helpers';

interface SummarySectionProps {
  summary: string;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <Box sx={sectionStyle}>
      <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500, mb: 1 }}>
        Summary
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 1)', fontSize: '12px', fontWeight: 400, lineHeight: 1.6 }}>
        {summary}
      </Typography>
    </Box>
  );
};

export default React.memo(SummarySection);
