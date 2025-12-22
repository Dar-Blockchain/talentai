import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import SkillCard from './SkillCard';

interface Skill {
  _id: string;
  name: string;
  ScoreTest?: number;
  experienceLevel?: string;
  category?: string;
  createdAt?: string;
}

interface SkillsSectionProps {
  title: string;
  skills: Skill[];
  icon: SvgIconComponent;
  gradientColors: string;
  type: 'technical' | 'soft';
}

const SkillsSection: React.FC<SkillsSectionProps> = React.memo(({
  title,
  skills,
  icon: Icon,
  gradientColors,
  type,
}) => {
  if (!skills || skills.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 3,
        backgroundColor: '#fff',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
      }}
    >
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: gradientColors,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          <Icon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            {skills.length} skill{skills.length !== 1 ? 's' : ''} {type === 'technical' ? 'verified' : 'assessed'}
          </Typography>
        </Box>
      </Box>

      {/* Skills Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
        }}
      >
        {skills.map((skill) => (
          <SkillCard key={skill._id} skill={skill} type={type} />
        ))}
      </Box>
    </Paper>
  );
});

SkillsSection.displayName = 'SkillsSection';

export default SkillsSection;
