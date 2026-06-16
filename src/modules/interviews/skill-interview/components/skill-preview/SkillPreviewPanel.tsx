import React from 'react';
import { Box } from '@mui/material';
import SkillHeaderCard from './SkillHeaderCard';
import SkillDetailsColumn from './SkillDetailsColumn';
import SkillStartPanel from './SkillStartPanel';

export interface SkillPreviewPanelProps {
  skill: string;
  proficiency: string | null;
  category: string | null;
  duration: number;
  language: string;
  onStartInterview?: () => void;
}

export default function SkillPreviewPanel({
  skill,
  proficiency,
  category,
  duration,
  language,
  onStartInterview,
}: SkillPreviewPanelProps) {
  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: 'calc(100vh - 60px)', py: { xs: 3, md: 5 } }}>
      <Box
        sx={{
          maxWidth: 1100,
          mx: 'auto',
          px: { xs: 2, md: 4 },
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-start' },
        }}
      >
        {/* Left column — header + details */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <SkillHeaderCard
            skill={skill}
            proficiency={proficiency}
            category={category}
            duration={duration}
            language={language}
          />
          <SkillDetailsColumn skill={skill} proficiency={proficiency} />
        </Box>

        {/* Right sticky panel — start button */}
        <SkillStartPanel
          skill={skill}
          proficiency={proficiency}
          duration={duration}
          onStartInterview={onStartInterview}
        />
      </Box>
    </Box>
  );
}
