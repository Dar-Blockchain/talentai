import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Header from '@/components/layout/Header';

export interface BlockedScreenAction {
  label: string;
  onClick: () => void;
  variant?: 'contained' | 'outlined';
  /** Solid hex color or CSS gradient string */
  color?: string;
  hoverColor?: string;
}

export interface BlockedScreenProps {
  /**
   * card     — elevated white card with optional gradient accent bar (default)
   * bordered — flat white card with a colored border
   * plain    — no card, content centered directly on the background
   */
  variant?: 'card' | 'bordered' | 'plain';
  /** CSS gradient for the thin top strip shown on card variant */
  accentGradient?: string;

  /** Emoji string OR React element (e.g. MUI icon) */
  icon: React.ReactNode;
  iconBg?: string;
  iconBorderColor?: string;
  iconShadow?: string;

  /** Small status pill above the title */
  badge?: {
    label: string;
    /** Text and dot color */
    color: string;
    bgColor: string;
    borderColor: string;
  };

  title: string;
  /** Optional colored line between title and description (e.g. company name) */
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  /** Extra content rendered between description and action buttons */
  children?: React.ReactNode;

  actions?: BlockedScreenAction[];

  showHeader?: boolean;
  maxWidth?: number;
  bgColor?: string;
  /** Border color for the 'bordered' variant */
  borderColor?: string;
}

const BlockedScreen: React.FC<BlockedScreenProps> = ({
  variant = 'card',
  accentGradient,
  icon,
  iconBg = 'rgba(0,0,0,0.05)',
  iconBorderColor = 'rgba(0,0,0,0.1)',
  iconShadow,
  badge,
  title,
  subtitle,
  description,
  children,
  actions = [],
  showHeader = true,
  maxWidth = 460,
  bgColor,
  borderColor = '#E5E7EB',
}) => {
  const resolvedBg = bgColor ?? (variant === 'card' ? '#F1F5F9' : '#F8F9FA');
  const iconSize = variant === 'card' ? 80 : 72;

  const iconNode = (
    <Box sx={{
      width: iconSize, height: iconSize, borderRadius: '50%',
      background: iconBg,
      border: `2px solid ${iconBorderColor}`,
      ...(iconShadow && { boxShadow: iconShadow }),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      mx: 'auto', mb: 2.5,
    }}>
      {typeof icon === 'string'
        ? <Typography sx={{ fontSize: '2rem', lineHeight: 1, userSelect: 'none' }}>{icon}</Typography>
        : icon}
    </Box>
  );

  const badgeNode = badge && (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.8,
      bgcolor: badge.bgColor, border: `1px solid ${badge.borderColor}`,
      borderRadius: '20px', px: 1.8, py: 0.5, mb: 2.5,
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: badge.color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: badge.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {badge.label}
      </Typography>
    </Box>
  );

  const actionsNode = actions.length > 0 && (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mt: children || description ? 3.5 : 2 }}>
      {actions.map((action, i) => {
        const isGradient = action.color?.includes('gradient');
        return (
          <Button
            key={i}
            variant={action.variant ?? (i === 0 ? 'contained' : 'outlined')}
            onClick={action.onClick}
            disableElevation
            fullWidth={actions.length === 1}
            sx={{
              fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem',
              textTransform: 'none', borderRadius: '12px', py: 1.3,
              ...(action.color
                ? isGradient
                  ? {
                    background: action.color, color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': { background: action.hoverColor ?? action.color, boxShadow: '0 6px 16px rgba(0,0,0,0.2)', color: '#fff' },
                  }
                  : {
                    bgcolor: action.color, color: '#fff',
                    '&:hover': { bgcolor: action.hoverColor ?? action.color },
                  }
                : action.variant === 'outlined'
                  ? { borderColor: '#E2E8F0', color: '#475569', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }
                  : {}
              ),
            }}
          >
            {action.label}
          </Button>
        );
      })}
    </Box>
  );

  const body = (
    <Box sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
      {iconNode}
      {badgeNode}

      <Typography sx={{
        fontFamily: 'Poppins', fontWeight: 800,
        fontSize: variant === 'card' ? '1.4rem' : '1.3rem',
        color: '#0F172A', lineHeight: 1.25, letterSpacing: '-0.01em',
        mb: subtitle || description || children ? 1.5 : 0,
      }}>
        {title}
      </Typography>

      {subtitle && (
        <Box sx={{ mb: 1 }}>
          {subtitle}
        </Box>
      )}

      {description && (
        <Typography component="div" sx={{
          fontFamily: 'Poppins', fontSize: '0.88rem',
          color: '#475569', lineHeight: 1.8,
        }}>
          {description}
        </Typography>
      )}

      {children}

      {actionsNode}
    </Box>
  );

  const card =
    variant === 'plain' ? (
      <Box sx={{ width: '100%', maxWidth }}>{body}</Box>
    ) : variant === 'bordered' ? (
      <Box sx={{ width: '100%', maxWidth, bgcolor: '#fff', borderRadius: '16px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
        {body}
      </Box>
    ) : (
      <Box sx={{ width: '100%', maxWidth, bgcolor: '#fff', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {accentGradient && <Box sx={{ height: 5, background: accentGradient }} />}
        {body}
      </Box>
    );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: resolvedBg, display: 'flex', flexDirection: 'column' }}>
      {showHeader && <Header />}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: { xs: 5, md: 8 } }}>
        {card}
      </Box>
    </Box>
  );
};

export default BlockedScreen;
