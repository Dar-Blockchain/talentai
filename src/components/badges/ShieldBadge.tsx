import React from 'react';
import { Box, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { ProficiencyLevel } from '@/utils/badgeEvaluationEngine';

interface ShieldBadgeProps {
  proficiencyLevel: ProficiencyLevel;
  skillName: string;
  size?: 'small' | 'medium' | 'large';
}

const BADGE_COLORS: Record<ProficiencyLevel, { top: string; bottom: string; ribbon: string }> = {
  Bronze: {
    top: '#CD7F32', // Bronze medal color
    bottom: '#1e293b',
    ribbon: '#B87333'
  },
  Silver: {
    top: '#C0C0C0', // Silver medal color
    bottom: '#1e293b',
    ribbon: '#A8A8A8'
  },
  Gold: {
    top: '#FFD700', // Gold medal color
    bottom: '#1e293b',
    ribbon: '#FFC700'
  },
  Platinum: {
    top: '#E5E4E2', // Platinum medal color
    bottom: '#1e293b',
    ribbon: '#BCC6CC'
  }
};

const SIZE_CONFIG = {
  small: {
    width: 80,
    height: 100,
    topHeight: 30,
    fontSize: '0.65rem',
    levelFontSize: '0.6rem',
    iconSize: 12
  },
  medium: {
    width: 120,
    height: 150,
    topHeight: 45,
    fontSize: '0.75rem',
    levelFontSize: '0.7rem',
    iconSize: 16
  },
  large: {
    width: 160,
    height: 200,
    topHeight: 60,
    fontSize: '0.875rem',
    levelFontSize: '0.8rem',
    iconSize: 20
  }
};

const ShieldBadge: React.FC<ShieldBadgeProps> = ({
  proficiencyLevel,
  skillName,
  size = 'medium'
}) => {
  const colors = BADGE_COLORS[proficiencyLevel];
  const config = SIZE_CONFIG[size];

  return (
    <Box
      sx={{
        position: 'relative',
        width: config.width,
        height: config.height,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))'
      }}
    >
      {/* Top Ribbon */}
      <Box
        sx={{
          width: '100%',
          height: config.topHeight,
          background: colors.top,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Typography
          sx={{
            color: 'white',
            fontWeight: 800,
            fontSize: config.fontSize,
            letterSpacing: 1,
            textTransform: 'uppercase',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 1
          }}
        >
          Certified
        </Typography>
      </Box>

      {/* Shield Body */}
      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          background: colors.bottom,
          clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 2,
          pb: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
            pointerEvents: 'none'
          }
        }}
      >
        {/* Verified Icon */}
        <Box
          sx={{
            width: config.iconSize * 2,
            height: config.iconSize * 2,
            borderRadius: '50%',
            background: colors.ribbon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          <VerifiedIcon sx={{ fontSize: config.iconSize, color: 'white' }} />
        </Box>

        {/* Proficiency Level */}
        <Typography
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: config.levelFontSize,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 0.5,
            opacity: 0.9,
            textAlign: 'center',
            px: 1
          }}
        >
          {proficiencyLevel}
        </Typography>

        {/* Skill Name */}
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 600,
            fontSize: size === 'small' ? '0.55rem' : size === 'medium' ? '0.65rem' : '0.75rem',
            textAlign: 'center',
            px: 1,
            lineHeight: 1.2,
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {skillName}
        </Typography>

        {/* Decorative Lines */}
        <Box
          sx={{
            position: 'absolute',
            bottom: size === 'small' ? 15 : size === 'medium' ? 25 : 35,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
          }}
        />
      </Box>

      {/* Ribbon Fold Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: config.topHeight - 5,
          left: -2,
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `8px solid ${colors.ribbon}`,
          transform: 'rotate(-15deg)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: config.topHeight - 5,
          right: -2,
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `8px solid ${colors.ribbon}`,
          transform: 'rotate(15deg)'
        }}
      />
    </Box>
  );
};

export default ShieldBadge;
