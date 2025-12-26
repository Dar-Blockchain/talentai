import React, { useState } from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
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

const SKILLS_PER_PAGE = 8;

const SkillsSection: React.FC<SkillsSectionProps> = React.memo(({
  title,
  skills,
  icon: Icon,
  gradientColors,
  type,
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!skills || skills.length === 0) return null;

  const displayedSkills = showAll ? skills : skills.slice(0, SKILLS_PER_PAGE);
  const hasMore = skills.length > SKILLS_PER_PAGE;

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
              {skills.length} skill{skills.length !== 1 ? 's' : ''} {type === 'technical' ? 'verified' : 'assessed'}
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
            {showAll ? `Show Less` : `Show All (${skills.length})`}
          </Button>
        )}
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
        {displayedSkills.map((skill) => (
          <SkillCard key={skill._id} skill={skill} type={type} />
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
            {showAll ? `Show Less` : `Show All ${skills.length} Skills`}
          </Button>
        </Box>
      )}
    </Paper>
  );
});

SkillsSection.displayName = 'SkillsSection';

export default SkillsSection;
