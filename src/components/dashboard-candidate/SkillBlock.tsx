import React, { useState, useMemo } from "react";
import { Box, Button, Chip, IconButton, Typography, Paper, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifiedIcon from "@mui/icons-material/Verified";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { SkillEvidence, evaluateSkillBadge, ProficiencyLevel, getAllStackProgressionsForSkill } from "@/utils/badgeEvaluationEngine";
import BadgeVerificationModal from "@/components/badges/BadgeVerificationModal";

export type SkillBlockProps = {
  skill: any;
  type: "technical" | "soft";
  onStartTest: () => void;
  onDelete?: () => void;
  profile: any;
  allSkills?: any[]; // All skills for stack progression calculation
};

function SkillBlockComponent({ profile, skill, type, onStartTest, onDelete, allSkills = [] }: SkillBlockProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const proficiencyMap: { [key: string]: number} = {
    "Entry Level": 1,
    Junior: 2,
    "Mid Level": 3,
    Senior: 4,
    Expert: 5,
  };
  const getLevelFromNumber = (level: number): string => {
    const levelMap: { [key: number]: string } = {
      1: "Entry Level",
      2: "Junior",
      3: "Mid Level",
      4: "Senior",
      5: "Expert",
    };
    return levelMap[level] || "Entry Level";
  };

  // Use ScoreTest if available, otherwise fallback to proficiency level
  const scoreTest = skill.ScoreTest || 0;
  const percentage = scoreTest; // ScoreTest is already a percentage

  // Build evidence map for all skills
  const allSkillEvidences = useMemo(() => {
    const evidenceMap = new Map<string, SkillEvidence>();

    allSkills.forEach(s => {
      evidenceMap.set(s.name, {
        skillName: s.name,
        testScore: s.ScoreTest || 0,
        experienceYears: 0,
        projectCount: 0,
        realWorldUsage: (s.ScoreTest || 0) > 0,
        certifications: [],
        endorsements: 0
      });
    });

    return evidenceMap;
  }, [allSkills]);

  // Get stack progressions for this skill
  const stackProgressions = useMemo(() => {
    return getAllStackProgressionsForSkill(skill.name, allSkillEvidences, type);
  }, [skill.name, allSkillEvidences, type]);

  // Get the best stack progression (highest progress)
  const bestStackProgression = useMemo(() => {
    if (stackProgressions.length === 0) return null;
    return stackProgressions.reduce((best, current) =>
      current.progressPercentage > best.progressPercentage ? current : best
    );
  }, [stackProgressions]);

  const PROFICIENCY_COLORS: Record<ProficiencyLevel, string> = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#E5E4E2'
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteModalOpen(false);
    if (onDelete) {
      onDelete();
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
  };

  return (
    <>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: '#ffffff',
        border: '1px solid #E0E0E0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              color: '#000000',
              fontWeight: 600,
              fontSize: '1.125rem',
            }}
          >
            {skill.name}
          </Typography>
          <Tooltip
            title={scoreTest > 0 ? `Test Score: ${percentage.toFixed(1)}%` : 'No test score yet'}
            arrow
            placement="top"
          >
            <Chip
              label={`${percentage.toFixed(1)}%`}
              size="small"
              sx={{
                backgroundColor: scoreTest > 0 ? '#8310FF' : '#CCCCCC',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 22,
                borderRadius: 1,
                cursor: 'help',
              }}
            />
          </Tooltip>

          {/* Stack Progression Badge */}
          {bestStackProgression && (
            <Tooltip
              title={bestStackProgression.message}
              arrow
            >
              <Chip
                icon={bestStackProgression.canEarnBadge ? <EmojiEventsIcon sx={{ fontSize: 14 }} /> : <TrendingUpIcon sx={{ fontSize: 14 }} />}
                label={bestStackProgression.canEarnBadge ? `${bestStackProgression.stackName} ✓` : `${Math.round(bestStackProgression.progressPercentage)}% ${bestStackProgression.stackName}`}
                size="small"
                sx={{
                  backgroundColor: bestStackProgression.canEarnBadge ? '#10B981' : '#8310FF',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 24,
                  borderRadius: 1,
                  cursor: 'help',
                  '& .MuiChip-icon': {
                    color: '#ffffff'
                  },
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: bestStackProgression.canEarnBadge ? '0 4px 8px #10B98140' : '0 4px 8px #8310FF40'
                  },
                  transition: 'all 0.2s ease'
                }}
              />
            </Tooltip>
          )}
        </Box>
        
        {type === "soft" && (
          <Typography
            variant="body2"
            sx={{
              color: '#666666',
              fontSize: '0.875rem',
              mb: 1,
            }}
          >
            {skill.category}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {type === "technical" ? (
            <>
              {skill.Levelconfirmed && skill.Levelconfirmed > 0 ? (
                <Chip
                  label={`${getLevelFromNumber(skill.Levelconfirmed)} Confirmed`}
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Chip
                  label="No Level Confirmed"
                  size="small"
                  sx={{
                    backgroundColor: '#FF9800',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              )}
            </>
          ) : (
            <>
              {skill.Levelconfirmed && skill.Levelconfirmed > 0 ? (
                <Chip
                  label={`${getLevelFromNumber(skill.Levelconfirmed)} Confirmed`}
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Chip
                  label="No Level Confirmed"
                  size="small"
                  sx={{
                    backgroundColor: '#FF9800',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    borderRadius: 1,
                  }}
                />
              )}
            </>
          )}
        </Box>

        {/* Low Score Warning - Below 40% threshold */}
        {scoreTest > 0 && scoreTest < 40 && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              border: '1px solid #F59E0B',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#92400E',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 16 }} />
              Score too low for badge - Improve to 40%+ to start earning badges
            </Typography>
          </Box>
        )}

        {/* Stack Progression Message */}
        {bestStackProgression && !bestStackProgression.canEarnBadge && scoreTest >= 40 && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
              border: '1px solid #8310FF30',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#8310FF',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              {bestStackProgression.message}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={bestStackProgression.progressPercentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e8f0fe',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #8310FF 0%, #a855f7 100%)',
                    borderRadius: 3
                  }
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#6B7280',
                  fontSize: '0.7rem',
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {bestStackProgression.completedSkills.length}/{bestStackProgression.totalSkills} skills completed
              </Typography>
            </Box>
          </Box>
        )}

        {/* Success Badge Message */}
        {bestStackProgression && bestStackProgression.canEarnBadge && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              border: '1px solid #10B98130',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#10B981',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 16 }} />
              {bestStackProgression.message}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            height: '8px',
            background: '#f0f0f0',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: '100%',
              background: type === "technical"
                ? 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)'
                : 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)',
              borderRadius: 2,
              transition: 'width 0.8s ease',
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStartTest}
          sx={{
            background: type === "technical" ? '#2196F3' : '#FF6B6B',
            color: '#ffffff',
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            '&:hover': {
              background: type === "technical" ? '#1976D2' : '#FF5252',
              transform: 'translateY(-1px)',
            },
          }}
          disabled={profile.quota >= 5}
        >
          Start Test
        </Button>
        
        {onDelete && (
          <IconButton
            onClick={handleDeleteClick}
            size="medium"
            sx={{
              color: '#ff3b30',
              background: 'rgba(255, 59, 48, 0.08)',
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(255, 59, 48, 0.12)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #ff3b30 0%, #ff5252 100%)',
            color: 'white',
            pb: 3,
            pt: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Delete Skill
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
            Are you sure you want to delete <strong>{skill.name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>
            This will permanently remove this skill from your profile, including all test scores and verification data.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            gap: 2,
            borderTop: '1px solid #E5E7EB'
          }}
        >
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#D1D5DB',
                background: '#F9FAFB'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ff3b30 0%, #ff5252 100%)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #e63328 0%, #e64545 100%)'
              }
            }}
          >
            Delete Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
    </>
  );
}

export default React.memo(SkillBlockComponent);


