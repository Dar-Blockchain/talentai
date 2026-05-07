import React from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { extractInterviewData } from '@/utils/interview';

interface InterviewCardProps {
  row: any;
  type: 'skill' | 'hr' | 'onboarding' | 'soft';
  level: string;
  color: 'default' | 'success' | 'warning' | 'error';
  score: number | null;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ row, type, level, color, score }) => {
  const router = useRouter();
  const extracted = extractInterviewData(row);
  const {
    metadata,
    overallCoverage,
    qualityScore,
    technicalDepthPercentage,
    problemApproachPercentage,
    technicalIndicators,
    problemIndicators,
  } = extracted;

  // Common data extraction
  const skillName = metadata.skill || row.skillDetails?.[0]?.name || metadata.role;
  const title = skillName || row.post?.jobDetails?.title || row.skillName || row.position || row.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Assessment`;
  const dateLabel = metadata.exportedAt
    ? new Date(metadata.exportedAt).toLocaleDateString()
    : row.createdAt
    ? new Date(row.createdAt).toLocaleDateString()
    : null;
  const skillType = metadata.type || row.skillDetails?.[0]?.type || type;
  const proficiencyLevel = metadata.proficiency || row.skillDetails?.[0]?.proficiencyLevel;
  const totalQuestions = row.skillDetails?.[0]?.questionAnswerList?.length || 0;
  const correctAnswers = row.skillDetails?.[0]?.questionAnswerList?.filter((qa: any) => qa.status === 'correct').length || 0;
  const partialAnswers = row.skillDetails?.[0]?.questionAnswerList?.filter((qa: any) => qa.status === 'partial_correct').length || 0;
  const totalIndicatorsCovered = technicalIndicators.length + problemIndicators.length;
  const updatedLabel = row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : null;
  const candidateName =
    row.candidateId?.firstName && row.candidateId?.lastName
      ? `${row.candidateId.firstName} ${row.candidateId.lastName}`
      : row.candidate?.name || row.profile?.fullName || 'Candidate';
  const notes = row.notes || row.summary || row.hrNotes || '';
  const recommendationsCount = row.recommendations?.length || 0;

  // Calculate display percentage
  const displayPercentage = overallCoverage || technicalDepthPercentage || problemApproachPercentage || 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        borderColor: '#E0E0E0',
        transition: 'all .2s ease',
        '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,.08)', transform: 'translateY(-2px)' },
      }}
    >
      <Stack spacing={1.25}>
        {/* Title and Level */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ fontWeight: 800, fontSize: type === 'onboarding' ? '1rem' : 'inherit' }}>{title}</Typography>
          {score !== null && <Chip size="small" color={color} label={level} sx={{ fontWeight: 700 }} />}
        </Stack>

        {/* Metadata Row */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#7a7a7a', flexWrap: 'wrap' }}>
          {type === 'skill' && <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />}
          {type === 'hr' && <PersonOutlineIcon sx={{ fontSize: 18 }} />}
          {type === 'onboarding' && <CalendarTodayIcon sx={{ fontSize: 16 }} />}
          {type === 'soft' && <PsychologyIcon sx={{ fontSize: 18 }} />}

          {type === 'hr' ? (
            <>
              <Typography variant="body2">{candidateName}</Typography>
              {dateLabel && (
                <>
                  <Typography variant="body2" sx={{ mx: 0.5 }}>•</Typography>
                  <Typography variant="body2">{dateLabel}</Typography>
                </>
              )}
            </>
          ) : type === 'onboarding' ? (
            <>
              <Typography variant="caption">{dateLabel || '—'}</Typography>
              {updatedLabel && updatedLabel !== dateLabel && (
                <>
                  <Typography variant="caption" sx={{ mx: 0.5 }}>•</Typography>
                  <Typography variant="caption">Updated: {updatedLabel}</Typography>
                </>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2">{skillType}</Typography>
              {dateLabel && (
                <>
                  <Typography variant="body2" sx={{ mx: 0.5 }}>•</Typography>
                  <Typography variant="body2">{dateLabel}</Typography>
                </>
              )}
            </>
          )}
        </Stack>

        {/* Score Display */}
        {score !== null ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={displayPercentage}
                size={type === 'onboarding' ? 56 : 64}
                thickness={5}
                sx={{ color: '#ece7fb' }}
              />
              <CircularProgress
                variant="determinate"
                value={displayPercentage}
                size={type === 'onboarding' ? 56 : 64}
                thickness={5}
                sx={{ position: 'absolute', left: 0, top: 0, color: '#8310FF' }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, fontSize: type === 'onboarding' ? '0.7rem' : 'inherit', color: '#333' }}
                >
                  {`${displayPercentage}%`}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              {qualityScore ? (
                <>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                    Quality Score
                  </Typography>
                  <Typography variant={type === 'onboarding' ? 'body2' : 'h6'} sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>
                    {qualityScore}/10
                  </Typography>
                  {totalIndicatorsCovered > 0 && (
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {totalIndicatorsCovered} indicators covered
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: type === 'onboarding' ? 0.5 : 0.75 }}>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: type === 'onboarding' ? 600 : 'inherit' }}>
                      {type === 'hr' ? 'Overall Evaluation' : 'Overall Score'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Relative standing">
                        <TrendingUpIcon sx={{ fontSize: 16, color: '#8310FF' }} />
                      </Tooltip>
                      <Typography variant="caption" sx={{ color: '#333', fontWeight: 700 }}>
                        {level}
                      </Typography>
                    </Stack>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={score}
                    sx={{
                      height: type === 'onboarding' ? 6 : 8,
                      borderRadius: type === 'onboarding' ? 4 : 6,
                      '& .MuiLinearProgress-bar': { backgroundColor: '#8310FF' },
                    }}
                  />
                </>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: '#666', fontStyle: type === 'onboarding' ? 'italic' : 'inherit' }}>
            No score available
          </Typography>
        )}

        {/* HR Notes */}
        {type === 'hr' && notes && (
          <Box>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Notes
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', mt: 0.5 }} noWrap title={notes}>
              {notes}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: type === 'onboarding' ? 0.5 : 1 }} />

        {/* Chips Section */}
        {((skillType && type !== 'hr') || proficiencyLevel || totalQuestions > 0 || metadata.type) && (
          <>
            {type === 'onboarding' && (totalQuestions > 0 || proficiencyLevel || metadata.type) && (
              <Stack spacing={0.5}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  Assessment Details:
                </Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: type === 'onboarding' ? 0.5 : 1 }}>
              {metadata.type && type !== 'skill' && (
                <Chip
                  size="small"
                  label={metadata.type}
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: type === 'onboarding' ? '0.7rem' : 'inherit', textTransform: 'capitalize' }}
                />
              )}
              {skillType && type === 'skill' && (
                <Chip
                  size="small"
                  label={`${skillType} skill`}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                />
              )}
              {proficiencyLevel && (
                <Chip
                  size="small"
                  label={type === 'skill' ? `Level ${proficiencyLevel}` : proficiencyLevel}
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: type === 'onboarding' ? '0.7rem' : 'inherit' }}
                />
              )}
              {totalQuestions > 0 && type === 'onboarding' && (
                <Chip size="small" label={`${totalQuestions} questions`} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
              )}
              {totalQuestions > 0 && (type === 'skill' || type === 'soft') && (
                <Chip size="small" label={`${correctAnswers}/${totalQuestions} correct`} variant="outlined" sx={{ fontWeight: 600 }} />
              )}
              {correctAnswers > 0 && type === 'onboarding' && (
                <Chip size="small" label={`${correctAnswers} correct`} variant="outlined" color="success" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
              )}
              {partialAnswers > 0 && type === 'onboarding' && (
                <Chip size="small" label={`${partialAnswers} partial`} variant="outlined" color="warning" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
              )}
            </Stack>
          </>
        )}

        {/* Recommendations for Onboarding */}
        {type === 'onboarding' && recommendationsCount > 0 && (
          <Box sx={{ backgroundColor: '#f8f9fc', p: 1.5, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingUpIcon sx={{ fontSize: 16, color: '#8310FF' }} />
              <Typography variant="caption" sx={{ color: '#333', fontWeight: 700 }}>
                {recommendationsCount} Recommendation{recommendationsCount > 1 ? 's' : ''} Available
              </Typography>
            </Stack>
          </Box>
        )}

        {/* View Details Button */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
          <Button
            onClick={() => router.push(`/candidate/interview/report/${row._id || row.id}`)}
            size="small"
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              px: 2,
              backgroundColor: '#8310FF',
              color: '#fff',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#6B0BC7',
              },
            }}
          >
            View details
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default React.memo(InterviewCard);
