import React from 'react';
import { Card, Box, Typography, LinearProgress } from '@mui/material';
import { Verified as VerifiedIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { formatTimeAgo } from '@/utils/timeAgo';

interface SkillCardProps {
  skill: {
    _id: string;
    name: string;
    ScoreTest?: number;
    experienceLevel?: string;
    category?: string;
    createdAt?: string;
  };
  type: 'technical' | 'soft';
}

const SkillCard: React.FC<SkillCardProps> = React.memo(({ skill, type }) => {
  const score = skill.ScoreTest || 0;

  // Color schemes based on type and score
  const getColors = () => {
    if (type === 'technical') {
      return {
        high: '#10B981',
        medium: '#3B82F6',
        low: '#F59E0B',
      };
    }
    return {
      high: '#EC4899',
      medium: '#F472B6',
      low: '#FBBF24',
    };
  };

  const colors = getColors();
  const barColor = score > 80 ? colors.high : score > 50 ? colors.medium : colors.low;

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '12px',
        background: '#fff',
        border: '1px solid #E5E7EB',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
          borderColor: barColor,
        },
      }}
    >
      {/* Skill Info */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#1F2937',
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {skill?.name || 'N/A'}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1F2937',
              fontSize: '1.1rem',
              ml: 2,
            }}
          >
            {score}%
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
          {score > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VerifiedIcon sx={{ fontSize: 14, color: '#10B981' }} />
              <Typography
                variant="caption"
                sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.7rem' }}
              >
                Verified
              </Typography>
            </Box>
          )}

          {skill.createdAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: '#6B7280' }} />
              <Typography
                variant="caption"
                sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.7rem' }}
              >
                {formatTimeAgo(skill.createdAt)}
              </Typography>
            </Box>
          )}
        </Box>

        {skill.experienceLevel && !skill.category && (
          <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem', display: 'block', mb: 1 }}>
            {skill.experienceLevel}
          </Typography>
        )}

        {skill.category && (
          <Typography
            variant="caption"
            sx={{ color: '#6B7280', fontSize: '0.7rem', display: 'block', mb: 1 }}
          >
            {skill.category}
          </Typography>
        )}
      </Box>

      {/* Linear Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#F3F4F6',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: barColor,
            transition: 'transform 0.8s ease',
          },
        }}
      />
    </Card>
  );
});

SkillCard.displayName = 'SkillCard';

export default SkillCard;
