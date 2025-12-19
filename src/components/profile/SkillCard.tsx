import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';

interface SkillCardProps {
  skill: {
    _id: string;
    name: string;
    ScoreTest?: number;
    experienceLevel?: string;
    category?: string;
  };
  type: 'technical' | 'soft';
}

const SkillCard: React.FC<SkillCardProps> = React.memo(({ skill, type }) => {
  const score = skill.ScoreTest || 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

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
  const strokeColor = score > 80 ? colors.high : score > 50 ? colors.medium : colors.low;

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
          borderColor: strokeColor,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Circular Progress */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <svg width="80" height="80">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="#F3F4F6"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke={strokeColor}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                lineHeight: 1,
                fontSize: '1.25rem',
              }}
            >
              {score}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#9CA3AF',
                fontWeight: 500,
                fontSize: '0.65rem',
              }}
            >
              %
            </Typography>
          </Box>
        </Box>

        {/* Skill Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: '#1F2937',
              mb: 0.5,
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {skill?.name || 'N/A'}
          </Typography>

          {score > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <VerifiedIcon sx={{ fontSize: 14, color: '#10B981' }} />
              <Typography
                variant="caption"
                sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.7rem' }}
              >
                Verified
              </Typography>
            </Box>
          )}

          {skill.experienceLevel && !skill.category && (
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.7rem' }}>
              {skill.experienceLevel}
            </Typography>
          )}

          {skill.category && (
            <Typography
              variant="caption"
              sx={{ color: '#6B7280', fontSize: '0.7rem', display: 'block' }}
            >
              {skill.category}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
});

SkillCard.displayName = 'SkillCard';

export default SkillCard;
