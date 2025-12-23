import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import {
  getSmartSkillRecommendations,
  getBadgeOpportunities,
  SkillEvidence
} from '@/utils/badgeEvaluationEngine';

interface SkillRecommendationsProps {
  allSkills: any[];
  skillType: 'technical' | 'soft';
}

const SkillRecommendations: React.FC<SkillRecommendationsProps> = ({ allSkills, skillType }) => {
  // Build evidence map
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

  // Get smart recommendations
  const recommendations = useMemo(() => {
    return getSmartSkillRecommendations(allSkillEvidences, skillType);
  }, [allSkillEvidences, skillType]);

  // Get badge opportunities
  const opportunities = useMemo(() => {
    return getBadgeOpportunities(allSkillEvidences).filter(
      o => o.category === skillType && o.urgency !== 'potential'
    );
  }, [allSkillEvidences, skillType]);

  if (recommendations.length === 0 && opportunities.length === 0) {
    return null;
  }

  const priorityColors = {
    high: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    medium: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    low: { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' }
  };

  const urgencyColors = {
    immediate: { bg: '#D1FAE5', text: '#065F46', icon: '#10B981' },
    close: { bg: '#E0E7FF', text: '#3730A3', icon: '#6366F1' },
    potential: { bg: '#F3F4F6', text: '#374151', icon: '#6B7280' }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Badge Opportunities */}
      {opportunities.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '2px solid #FCD34D'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 24, color: '#F59E0B' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#92400E',
                fontSize: '1.1rem'
              }}
            >
              Badge Opportunities
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {opportunities.map((opp) => (
              <Box
                key={opp.stackName}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: '#111827',
                        fontSize: '0.95rem',
                        mb: 0.5
                      }}
                    >
                      {opp.stackName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6B7280',
                        fontSize: '0.8rem'
                      }}
                    >
                      {opp.description}
                    </Typography>
                  </Box>
                  <Chip
                    icon={opp.urgency === 'immediate' ? <EmojiEventsIcon sx={{ fontSize: 14 }} /> : <TrendingUpIcon sx={{ fontSize: 14 }} />}
                    label={opp.urgency === 'immediate' ? 'Ready!' : 'Close'}
                    size="small"
                    sx={{
                      backgroundColor: urgencyColors[opp.urgency].bg,
                      color: urgencyColors[opp.urgency].text,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 24,
                      '& .MuiChip-icon': {
                        color: urgencyColors[opp.urgency].icon
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.7rem' }}>
                      PROGRESS
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.7rem' }}>
                      {Math.round(opp.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={opp.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#FEF3C7',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>

                {opp.missingSkills.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#92400E',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      {opp.missingSkills.length === 1 ? '1 SKILL NEEDED:' : `${opp.missingSkills.length} SKILLS NEEDED:`}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {opp.missingSkills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: '#FFFBEB',
                            color: '#92400E',
                            border: '1px solid #FCD34D'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: '#ffffff',
            border: '1px solid #E0E0E0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LightbulbIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#111827',
                fontSize: '1.1rem'
              }}
            >
              AI-Powered Recommendations
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recommendations.map((rec, idx) => (
              <Box
                key={`${rec.skillName}-${idx}`}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderColor: '#8310FF'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#111827',
                          fontSize: '0.95rem'
                        }}
                      >
                        {rec.skillName}
                      </Typography>
                      <Chip
                        label={rec.priority.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: priorityColors[rec.priority].bg,
                          color: priorityColors[rec.priority].text,
                          border: `1px solid ${priorityColors[rec.priority].border}`
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B7280',
                        fontSize: '0.85rem',
                        mb: 1
                      }}
                    >
                      {rec.reason}
                    </Typography>

                    {rec.potentialBadges.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                        <Tooltip title="Completing this skill will help you earn these badges" arrow>
                          <AutoAwesomeIcon sx={{ fontSize: 14, color: '#8310FF' }} />
                        </Tooltip>
                        {rec.potentialBadges.map((badge) => (
                          <Chip
                            key={badge}
                            label={badge}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: '#F3E8FF',
                              color: '#8310FF',
                              border: '1px solid #C084FC'
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SkillRecommendations;
