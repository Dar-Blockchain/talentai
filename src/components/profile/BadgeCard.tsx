import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { ShieldBadge } from '@/components/badges/ShieldBadge';
import { ProficiencyLevel } from '@/utils/badgeEvaluationEngine';

interface BadgeCardProps {
  badge: {
    type: 'individual' | 'stack';
    skillName?: string;
    stackName?: string;
    proficiencyLevel: ProficiencyLevel;
    confidenceScore?: number;
    coreSkills?: string[];
  };
  type: 'technical' | 'soft';
}

const BadgeCard: React.FC<BadgeCardProps> = React.memo(({ badge, type }) => {
  const isStackBadge = badge.type === 'stack';
  const badgeName = isStackBadge ? badge.stackName : badge.skillName;

  // Color schemes based on type
  const bgGradient = type === 'technical'
    ? 'linear-gradient(to bottom, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03))'
    : 'linear-gradient(to bottom, rgba(240, 147, 251, 0.03), rgba(245, 87, 108, 0.03))';

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        background: bgGradient,
        border: '1px solid #E5E7EB',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Badge Icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 2,
          mt: -1,
        }}
      >
        <ShieldBadge proficiency={badge.proficiencyLevel} size="medium" />
      </Box>

      {/* Badge Name */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#1F2937',
          mb: 1,
          textAlign: 'center',
          fontSize: '1rem',
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {badgeName}
      </Typography>

      {/* Proficiency Level */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#6B7280',
            fontSize: '0.85rem',
          }}
        >
          {badge.proficiencyLevel} Level
        </Typography>
      </Box>

      {/* Badge Type Indicator */}
      <Box
        sx={{
          textAlign: 'center',
          py: 0.75,
          px: 2,
          borderRadius: 1,
          background: type === 'technical'
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
            : 'linear-gradient(135deg, rgba(240, 147, 251, 0.1), rgba(245, 87, 108, 0.1))',
          border: `1px solid ${type === 'technical' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(240, 147, 251, 0.2)'}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: type === 'technical' ? '#667eea' : '#f093fb',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: 0.5,
          }}
        >
          {isStackBadge ? `${type} Stack` : `${type} Skill`}
        </Typography>
      </Box>

      {/* Core Skills (for stack badges) */}
      {isStackBadge && badge.coreSkills && badge.coreSkills.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#6B7280',
              fontSize: '0.7rem',
              display: 'block',
              mb: 0.75,
              textAlign: 'center',
            }}
          >
            Includes:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              justifyContent: 'center',
            }}
          >
            {badge.coreSkills.slice(0, 4).map((skill, idx) => (
              <Typography
                key={idx}
                variant="caption"
                sx={{
                  color: '#9CA3AF',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                }}
              >
                {skill}
                {idx < Math.min(badge.coreSkills!.length, 4) - 1 ? ' •' : ''}
              </Typography>
            ))}
            {badge.coreSkills.length > 4 && (
              <Typography
                variant="caption"
                sx={{
                  color: '#9CA3AF',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                }}
              >
                +{badge.coreSkills.length - 4} more
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Confidence Score (for individual badges) */}
      {!isStackBadge && badge.confidenceScore !== undefined && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: '#6B7280',
              fontSize: '0.7rem',
              display: 'block',
              mb: 0.5,
            }}
          >
            Confidence Score
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1F2937',
              fontSize: '1.25rem',
            }}
          >
            {badge.confidenceScore}%
          </Typography>
        </Box>
      )}
    </Card>
  );
});

BadgeCard.displayName = 'BadgeCard';

export default BadgeCard;
