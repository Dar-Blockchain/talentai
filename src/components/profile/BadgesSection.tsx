import React, { useState } from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import BadgeCard from './BadgeCard';
import { ProficiencyLevel } from '@/utils/badgeEvaluationEngine';

interface Badge {
  type: 'individual' | 'stack' | 'progress';
  skillName?: string;
  stackName?: string;
  proficiencyLevel: ProficiencyLevel;
  confidenceScore?: number;
  coreSkills?: string[];
  category?: string;
  progress?: number;
  completedSkills?: string[];
  missingSkills?: string[];
}

interface BadgesSectionProps {
  title: string;
  badges: Badge[];
  icon: SvgIconComponent;
  gradientColors: string;
  type: 'technical' | 'soft';
}

const BADGES_PER_PAGE = 8;

const BadgesSection: React.FC<BadgesSectionProps> = React.memo(({
  title,
  badges,
  icon: Icon,
  gradientColors,
  type,
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!badges || badges.length === 0) return null;

  const displayedBadges = showAll ? badges : badges.slice(0, BADGES_PER_PAGE);
  const hasMore = badges.length > BADGES_PER_PAGE;

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

        {/* Show More/Less Button (Desktop) */}
        {hasMore && (
          <Button
            variant="outlined"
            size="small"
            endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowAll(!showAll)}
            sx={{
              display: { xs: 'none', md: 'flex' },
              textTransform: 'none',
              borderColor: '#E5E7EB',
              color: '#6B7280',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: 'rgba(107, 114, 128, 0.05)',
              },
            }}
          >
            {showAll ? `Show Less` : `Show All (${badges.length})`}
          </Button>
        )}
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
        {displayedBadges.map((badge, index) => (
          <BadgeCard
            key={`${badge.type}-${badge.skillName || badge.stackName}-${index}`}
            badge={badge}
            type={type}
          />
        ))}
      </Box>

      {/* Show More/Less Button (Mobile) */}
      {hasMore && (
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowAll(!showAll)}
            sx={{
              textTransform: 'none',
              borderColor: '#E5E7EB',
              color: '#6B7280',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: 'rgba(107, 114, 128, 0.05)',
              },
            }}
          >
            {showAll ? `Show Less` : `Show All ${badges.length} Badges`}
          </Button>
        </Box>
      )}
    </Paper>
  );
});

BadgesSection.displayName = 'BadgesSection';

export default BadgesSection;
