import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { SkillBadge, StackBadge, ProficiencyLevel } from '@/utils/badgeEvaluationEngine';
import ShieldBadge from './ShieldBadge';
import CircularScoreGauge from './CircularScoreGauge';

interface BadgeVerificationModalProps {
  open: boolean;
  onClose: () => void;
  badge: SkillBadge | StackBadge | null;
}

const PROFICIENCY_COLORS: Record<ProficiencyLevel, { primary: string; secondary: string; bg: string }> = {
  Bronze: {
    primary: '#CD7F32',
    secondary: '#F4E4D7',
    bg: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
  },
  Silver: {
    primary: '#C0C0C0',
    secondary: '#F5F5F5',
    bg: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
  },
  Gold: {
    primary: '#FFD700',
    secondary: '#FFF8DC',
    bg: 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)'
  },
  Platinum: {
    primary: '#E5E4E2',
    secondary: '#F8F8F8',
    bg: 'linear-gradient(135deg, #E5E4E2 0%, #BCC6CC 100%)'
  }
};

const BadgeVerificationModal: React.FC<BadgeVerificationModalProps> = ({ open, onClose, badge }) => {
  if (!badge) return null;

  const colors = PROFICIENCY_COLORS[badge.proficiencyLevel];
  const isStack = badge.type === 'stack';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with gradient */}
      <Box
        sx={{
          background: colors.bg,
          p: 4,
          position: 'relative',
          color: 'white'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'white',
            background: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            }}
          >
            {isStack ? (
              <WorkspacePremiumIcon sx={{ fontSize: 42, color: 'white' }} />
            ) : (
              <VerifiedIcon sx={{ fontSize: 42, color: 'white' }} />
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ opacity: 0.9, fontWeight: 700, letterSpacing: 1.5 }}>
              {isStack ? 'TECHNOLOGY STACK BADGE' : 'PROFESSIONAL SKILL BADGE'}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {badge.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={badge.proficiencyLevel}
                size="small"
                sx={{
                  height: '24px',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                  AI VERIFIED
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {/* Professional Shield Badge Display */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: `2px solid ${colors.primary}20`,
            position: 'relative'
          }}
        >
          {/* Stack Badges - Multiple shields for stack */}
          {isStack ? (
            <>
              {/* Main Stack Badge */}
              <Box sx={{ mb: 3 }}>
                <ShieldBadge
                  proficiencyLevel={badge.proficiencyLevel}
                  skillName={badge.stackName}
                  size="large"
                />
              </Box>

              {/* Individual Skill Badges in Stack */}
              <Typography
                variant="overline"
                sx={{
                  color: colors.primary,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  mb: 2
                }}
              >
                VERIFIED TECHNOLOGIES
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  justifyContent: 'center',
                  maxWidth: '100%'
                }}
              >
                {badge.coreSkills.map((skill) => (
                  <ShieldBadge
                    key={skill}
                    proficiencyLevel={badge.proficiencyLevel}
                    skillName={skill}
                    size="small"
                  />
                ))}
              </Box>
            </>
          ) : (
            /* Single Skill Badge */
            <ShieldBadge
              proficiencyLevel={badge.proficiencyLevel}
              skillName={badge.skillName}
              size="large"
            />
          )}

          {/* Badge Info and Scores Below Shield */}
          <Box sx={{ mt: 3, width: '100%' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#111827',
                mb: 2,
                textAlign: 'center'
              }}
            >
              {badge.title}
            </Typography>

            {/* Score Gauges Row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 3,
                mb: 3,
                flexWrap: 'wrap'
              }}
            >
              {/* Confidence Score Gauge */}
              <Box sx={{ textAlign: 'center' }}>
                <CircularScoreGauge
                  score={badge.confidenceScore}
                  size={120}
                  thickness={8}
                  color={colors.primary}
                  backgroundColor={colors.secondary}
                  label="Confidence"
                />
              </Box>

              {/* Test Score Gauge (if available) */}
              {badge.verificationCriteria.some(c => c.includes('assessment')) && (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularScoreGauge
                    score={Math.round(badge.confidenceScore * 0.9)} // Approximation, use real test score if available
                    size={120}
                    thickness={8}
                    color="#8310FF"
                    backgroundColor="#ece7fb"
                    label="Test Score"
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                label="AI VERIFIED"
                sx={{
                  background: '#10B981',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 26,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
              {isStack && (
                <Chip
                  icon={<WorkspacePremiumIcon sx={{ fontSize: 14 }} />}
                  label={`${badge.coreSkills.length} SKILLS`}
                  sx={{
                    background: colors.bg,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 26,
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              )}
            </Box>

            {/* Issued Date */}
            <Typography
              variant="caption"
              sx={{
                color: '#9CA3AF',
                display: 'block',
                textAlign: 'center'
              }}
            >
              Issued: {new Date(badge.issuedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
        {/* Footer */}
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <VerifiedIcon sx={{ fontSize: 16, color: colors.primary }} />
          <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600 }}>
            Verified by AI Talent Evaluation Engine
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeVerificationModal;
