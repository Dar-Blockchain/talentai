import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';
import { PostInterviewData } from '../../../types/postInterview';
import { getScoreColor, getScoreLabel, formatDate } from '../../../utils/postInterviewHelpers';

interface InterviewCardProps {
  interview: PostInterviewData;
  onViewDetails: (id: string) => void;
  onProvideFeedback: (interview: PostInterviewData) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  interview,
  onViewDetails,
  onProvideFeedback,
}) => {
  return (
    <Card
      sx={{
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
              {interview.post?.jobDetails?.title || 'Unknown Position'}
            </Typography>

            {/* Interview Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                  Interview Progress
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                  {interview.type === 'HR Interview 1' && interview.overallScore ? '100% Complete' : 'In Progress'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={interview.type === 'HR Interview 1' && interview.overallScore ? 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e9ecef',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: interview.type === 'HR Interview 1' && interview.overallScore ? '#4caf50' : '#02E2FF',
                    borderRadius: 4,
                    background: interview.type === 'HR Interview 1' && interview.overallScore
                      ? 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)'
                      : 'linear-gradient(90deg, #02E2FF 0%, #00B8D4 100%)',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip
                label={interview.type || 'Post Interview'}
                size="small"
                sx={{
                  backgroundColor: interview.type === 'HR Interview 1' && interview.overallScore ? '#4caf5020' : '#02E2FF20',
                  color: interview.type === 'HR Interview 1' && interview.overallScore ? '#4caf50' : '#02E2FF',
                  fontWeight: 500,
                }}
              />
              {interview.post?.company && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2" color="textSecondary">
                    {interview.post.company}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: '#666' }} />
                <Typography variant="body2" color="textSecondary">
                  {formatDate(interview.createdAt)}
                </Typography>
              </Box>
              {interview.updatedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TimelineIcon sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2" color="textSecondary">
                    Updated: {formatDate(interview.updatedAt)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right', ml: 2 }}>
            {interview.overallScore !== null && interview.overallScore !== undefined ? (
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: getScoreColor(interview.overallScore),
                    mb: 0.5,
                  }}
                >
                  {interview.overallScore}%
                </Typography>
                <Chip
                  label={getScoreLabel(interview.overallScore)}
                  size="small"
                  sx={{
                    backgroundColor: `${getScoreColor(interview.overallScore)}20`,
                    color: getScoreColor(interview.overallScore),
                    fontWeight: 500,
                  }}
                />
              </Box>
            ) : (
              <Chip label="Pending" size="small" color="default" />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Skills Analysis */}
        {interview.skillDetails && interview.skillDetails.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
              Skills Assessment
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interview.skillDetails.slice(0, 4).map((skill, index) => (
                <Box key={index} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: '#f8f9fa',
                      borderRadius: 1,
                      border: '1px solid #e9ecef',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {skill.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        {skill.proficiencyLevel}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={skill.confidenceScore}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#e9ecef',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getScoreColor(skill.confidenceScore),
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Recommendations */}
        {interview.recommendations && interview.recommendations.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
              Key Recommendations
            </Typography>
            <List dense>
              {interview.recommendations.map((rec, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={rec}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'textSecondary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => onViewDetails(interview._id)}
              sx={{
                borderColor: '#02E2FF',
                color: '#02E2FF',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#02E2FF',
                  backgroundColor: '#02E2FF10',
                },
              }}
            >
              View Details
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FeedbackIcon />}
              onClick={() => onProvideFeedback(interview)}
              sx={{
                borderColor: '#8310FF',
                color: '#8310FF',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#8310FF',
                  backgroundColor: '#8310FF10',
                },
              }}
            >
              Provide Feedback
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(InterviewCard);
