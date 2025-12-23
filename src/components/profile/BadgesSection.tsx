import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import BadgeCard from './BadgeCard';
import { ProficiencyLevel } from '@/types/badge';

interface Badge {
  type: 'individual' | 'stack';
  skillName?: string;
  stackName?: string;
  proficiencyLevel: ProficiencyLevel;
  confidenceScore?: number;
  coreSkills?: string[];
}

interface BadgesSectionProps {
  title: string;
  badges: Badge[];
  icon: SvgIconComponent;
  gradientColors: string;
  type: 'technical' | 'soft';
}

const BadgesSection: React.FC<BadgesSectionProps> = React.memo(({
  title,
  badges,
  icon: Icon,
  gradientColors,
  type,
}) => {
  if (!badges || badges.length === 0) return null;

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
            {badges.length} badge{badges.length !== 1 ? 's' : ''} earned
          </Typography>
        </Box>
      </Box>

      {/* Badges Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
        }}
      >
        {badges.map((badge, index) => (
          <BadgeCard
            key={`${badge.type}-${badge.skillName || badge.stackName}-${index}`}
            badge={badge}
            type={type}
          />
        ))}
      </Box>
    </Paper>
  );
});

BadgesSection.displayName = 'BadgesSection';

export default BadgesSection;
