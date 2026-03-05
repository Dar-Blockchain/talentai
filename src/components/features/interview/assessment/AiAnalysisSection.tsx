import React from 'react';
import { Box, Typography } from '@mui/material';
import { sectionStyle, sectionTitleStyle, formatAreaName } from './helpers';

interface AiAnalysisSectionProps {
  aiAnalysis: {
    strongestAreas?: string[];
    weakestAreas?: string[];
    recommendedFocus?: string[];
  };
}

const AiAnalysisSection: React.FC<AiAnalysisSectionProps> = ({ aiAnalysis }) => {
  const hasData = aiAnalysis.strongestAreas?.length || aiAnalysis.weakestAreas?.length || aiAnalysis.recommendedFocus?.length;
  if (!hasData) return null;

  return (
    <Box sx={sectionStyle}>
      <Typography variant="h5" sx={sectionTitleStyle('rgba(131, 16, 255, 0.83)')}>AI Analysis</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {aiAnalysis.strongestAreas && aiAnalysis.strongestAreas.length > 0 && (
          <AnalysisCard
            title="Strongest Areas"
            items={aiAnalysis.strongestAreas}
            bg="rgba(16, 185, 129, 0.06)" border="rgba(16, 185, 129, 0.15)"
            titleColor="#065f46" itemColor="#047857"
          />
        )}
        {aiAnalysis.weakestAreas && aiAnalysis.weakestAreas.length > 0 && (
          <AnalysisCard
            title="Areas for Improvement"
            items={aiAnalysis.weakestAreas}
            bg="rgba(239, 68, 68, 0.06)" border="rgba(239, 68, 68, 0.15)"
            titleColor="#991b1b" itemColor="#b91c1c"
          />
        )}
        {aiAnalysis.recommendedFocus && aiAnalysis.recommendedFocus.length > 0 && (
          <AnalysisCard
            title="Recommended Focus"
            items={aiAnalysis.recommendedFocus}
            bg="rgba(245, 158, 11, 0.06)" border="rgba(245, 158, 11, 0.15)"
            titleColor="#92400e" itemColor="#a16207"
          />
        )}
      </Box>
    </Box>
  );
};

const AnalysisCard: React.FC<{
  title: string; items: string[]; bg: string; border: string; titleColor: string; itemColor: string;
}> = ({ title, items, bg, border, titleColor, itemColor }) => (
  <Box sx={{ backgroundColor: bg, borderRadius: '10px', padding: '14px', border: `1px solid ${border}` }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: titleColor, mb: 1, fontSize: '13px' }}>{title}</Typography>
    {items.map((item, idx) => (
      <Typography key={idx} variant="body2" sx={{ color: itemColor, fontSize: '12px', mb: 0.5 }}>{formatAreaName(item)}</Typography>
    ))}
  </Box>
);

export default React.memo(AiAnalysisSection);
