// components/AssessmentDetailsModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Allow both legacy and new assessment shapes
type Assessment = any;

interface AssessmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AssessmentDetailsModal Component
 *
 * Displays detailed assessment information in a modal dialog
 */
const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({
  open,
  onClose,
  assessment
}) => {
  if (!assessment) return null;

  // Get data from the new API structure
  const raw = assessment.raw || assessment;
  const candidate = raw.candidate || {};
  const post = raw.post || {};
  const interviewData = raw.interviewData || {};
  const finalReport = interviewData.finalReport || {};
  const analytics = interviewData.analytics || {};
  const coverageAreas = finalReport.coverage?.areas || {};
  const aiAnalysis = finalReport.aiAnalysis || {};

  // Helpers to get data
  const getCandidateName = () => candidate.username || assessment.candidateName || 'Unknown User';
  const getCandidateEmail = () => candidate.email || assessment.candidateEmail || '';
  const getJobTitle = () => post.jobDetails?.title || assessment.jobTitle || 'Unknown Job';
  const getJobDescription = () => post.jobDetails?.description || '';
  const getInterviewType = () => interviewData.interviewType || 'HR_INTERVIEW';
  const getCoverageScore = () => finalReport.coverage?.overall || 0;
  const getSummary = () => finalReport.summary || '';
  const getRecommendations = () => finalReport.recommendations || [];
  const getTimestamp = () => raw.createdAt || assessment.timestamp || new Date().toISOString();

  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Format area name for display
  const formatAreaName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          maxHeight: '95vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #00FF9D 0%, #02E2FF 100%)',
            borderRadius: '12px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <StarIcon sx={{ color: '#1e293b', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{
              color: '#111827',
              fontWeight: 700,
              fontSize: '1.25rem'
            }}>
              Interview Assessment Details
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 400 }}>
              {getInterviewType().replace(/_/g, ' ')} - Comprehensive evaluation
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#6b7280' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        p: 3,
        mt: "10px",
        overflowY: 'auto',
        maxHeight: 'calc(95vh - 200px)'
      }}>
        <Box>
          {/* Candidate & Job Header */}
          <Box sx={{
            mb: 4,
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            p: 3,
            border: '1px solid #e2e8f0'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
                <Box sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {(getCandidateName() || 'U')?.[0]?.toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{
                    fontWeight: 700,
                    color: '#111827',
                    mb: 1
                  }} noWrap>
                    {getCandidateName()}
                  </Typography>
                  {getCandidateEmail() && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        filter: 'blur(4px)',
                        userSelect: 'none',
                      }}
                      noWrap
                    >
                      <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                      {getCandidateEmail()}
                    </Typography>
                  )}
                  <Typography variant="h6" sx={{
                    color: '#10b981',
                    fontWeight: 600,
                    mb: 1
                  }} noWrap>
                    {getJobTitle()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <InfoIcon sx={{ fontSize: 14, color: '#10b981' }} />
                      {new Date(getTimestamp()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                    <Chip
                      label={getInterviewType().replace(/_/g, ' ')}
                      size="small"
                      sx={{
                        backgroundColor: '#ede9fe',
                        color: '#7c3aed',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                      }}
                    />
                    {post.status && (
                      <Chip
                        label={post.status}
                        size="small"
                        sx={{
                          backgroundColor: post.status === 'open' ? '#d1fae5' : '#fee2e2',
                          color: post.status === 'open' ? '#065f46' : '#991b1b',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={getCoverageScore()}
                    size={80}
                    thickness={4}
                    sx={{
                      color: getCoverageScore() >= 50 ? '#10b981' : '#f59e0b'
                    }}
                  />
                  <Box sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h5" component="div" sx={{
                      fontWeight: 700,
                      color: '#111827'
                    }}>
                      {Math.round(getCoverageScore())}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{
                    color: '#64748b',
                    display: 'block',
                    fontWeight: 600
                  }}>
                    Coverage Score
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Analytics Summary */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{
              color: '#111827',
              mb: 3,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                backgroundColor: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUpIcon sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              Interview Analytics
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2
            }}>
              <Box sx={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #bae6fd',
                textAlign: 'center'
              }}>
                <AccessTimeIcon sx={{ color: '#0284c7', fontSize: 28, mb: 1 }} />
                <Typography variant="h6" sx={{
                  color: '#0284c7',
                  fontWeight: 700,
                }}>
                  {formatDuration(analytics.duration || 0)}
                </Typography>
                <Typography variant="caption" sx={{
                  color: '#6b7280',
                  fontWeight: 500
                }}>
                  Duration
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #bbf7d0',
                textAlign: 'center'
              }}>
                <ChatIcon sx={{ color: '#16a34a', fontSize: 28, mb: 1 }} />
                <Typography variant="h6" sx={{
                  color: '#16a34a',
                  fontWeight: 700,
                }}>
                  {analytics.messageCount || 0}
                </Typography>
                <Typography variant="caption" sx={{
                  color: '#6b7280',
                  fontWeight: 500
                }}>
                  Messages
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #fcd34d',
                textAlign: 'center'
              }}>
                <AssessmentIcon sx={{ color: '#d97706', fontSize: 28, mb: 1 }} />
                <Typography variant="h6" sx={{
                  color: '#d97706',
                  fontWeight: 700,
                }}>
                  {analytics.completedAreas || 0}/{analytics.totalAreas || 4}
                </Typography>
                <Typography variant="caption" sx={{
                  color: '#6b7280',
                  fontWeight: 500
                }}>
                  Areas Covered
                </Typography>
              </Box>

              <Box sx={{
                backgroundColor: '#fdf4ff',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #f5d0fe',
                textAlign: 'center'
              }}>
                <TrendingUpIcon sx={{ color: '#a855f7', fontSize: 28, mb: 1 }} />
                <Typography variant="h6" sx={{
                  color: '#a855f7',
                  fontWeight: 700,
                }}>
                  {Math.round(analytics.coveragePercentage || 0)}%
                </Typography>
                <Typography variant="caption" sx={{
                  color: '#6b7280',
                  fontWeight: 500
                }}>
                  Coverage
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Coverage Areas */}
          {Object.keys(coverageAreas).length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{
                color: '#111827',
                mb: 3,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WorkIcon sx={{ fontSize: 18, color: 'white' }} />
                </Box>
                Coverage Areas
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(coverageAreas).map(([areaKey, areaData]: [string, any]) => (
                  <Box
                    key={areaKey}
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{
                          fontWeight: 700,
                          color: '#111827',
                          textTransform: 'capitalize',
                        }}>
                          {formatAreaName(areaKey)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {areaData.depth}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={areaData.completed ? 'Completed' : 'In Progress'}
                          size="small"
                          sx={{
                            backgroundColor: areaData.completed ? '#d1fae5' : '#fef3c7',
                            color: areaData.completed ? '#065f46' : '#92400e',
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="h6" sx={{
                          fontWeight: 700,
                          color: areaData.percentage >= 50 ? '#10b981' : '#f59e0b',
                        }}>
                          {Math.round(areaData.percentage || 0)}%
                        </Typography>
                      </Box>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={areaData.percentage || 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e5e7eb',
                        mb: 2,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: areaData.percentage >= 50 ? '#10b981' : '#f59e0b',
                          borderRadius: 4,
                        }
                      }}
                    />

                    {/* Indicators */}
                    {areaData.indicators && areaData.indicators.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                          Indicators:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {areaData.indicators.map((indicator: any, idx: number) => (
                            <Chip
                              key={idx}
                              label={indicator.name}
                              size="small"
                              sx={{
                                backgroundColor: indicator.covered ? '#d1fae5' : '#f3f4f6',
                                color: indicator.covered ? '#065f46' : '#6b7280',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Weight: {Math.round((areaData.weight || 0) * 100)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Questions: {areaData.questionsAsked || 0}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* AI Analysis */}
          {(aiAnalysis.strongestAreas?.length > 0 || aiAnalysis.weakestAreas?.length > 0 || aiAnalysis.recommendedFocus?.length > 0) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{
                color: '#111827',
                mb: 3,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  backgroundColor: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
                </Box>
                AI Analysis
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {aiAnalysis.strongestAreas?.length > 0 && (
                  <Box sx={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #bbf7d0',
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065f46', mb: 1 }}>
                      Strongest Areas
                    </Typography>
                    {aiAnalysis.strongestAreas.map((area: string, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#047857' }}>
                        • {area}
                      </Typography>
                    ))}
                  </Box>
                )}

                {aiAnalysis.weakestAreas?.length > 0 && (
                  <Box sx={{
                    backgroundColor: '#fef2f2',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #fecaca',
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b', mb: 1 }}>
                      Areas for Improvement
                    </Typography>
                    {aiAnalysis.weakestAreas.map((area: string, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#b91c1c' }}>
                        • {area}
                      </Typography>
                    ))}
                  </Box>
                )}

                {aiAnalysis.recommendedFocus?.length > 0 && (
                  <Box sx={{
                    backgroundColor: '#fffbeb',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #fcd34d',
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e', mb: 1 }}>
                      Recommended Focus
                    </Typography>
                    {aiAnalysis.recommendedFocus.map((focus: string, idx: number) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#a16207' }}>
                        • {focus}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Summary */}
          {getSummary() && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{
                color: '#111827',
                mb: 2,
                fontWeight: 700,
              }}>
                Summary
              </Typography>
              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
              }}>
                <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.6 }}>
                  {getSummary()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Job Details */}
          {getJobDescription() && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{
                color: '#111827',
                mb: 2,
                fontWeight: 700,
              }}>
                Job Description
              </Typography>
              <Box sx={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
              }}>
                <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6 }}>
                  {getJobDescription()}
                </Typography>
                {post.jobDetails?.requirements?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', mb: 1 }}>
                      Requirements:
                    </Typography>
                    <List dense sx={{ p: 0 }}>
                      {post.jobDetails.requirements.map((req: string, idx: number) => (
                        <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <ArrowForwardIcon sx={{ fontSize: 14, color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText primary={req} sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem', color: '#4b5563' } }} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Recommendations */}
          {getRecommendations().length > 0 && (
            <Box>
              <Typography variant="h6" sx={{
                color: '#111827',
                mb: 3,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
                </Box>
                Recommendations ({getRecommendations().length})
              </Typography>

              <Box sx={{
                backgroundColor: '#fffbeb',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #fed7aa'
              }}>
                <List sx={{ p: 0 }}>
                  {getRecommendations().map((rec: string, index: number) => (
                    <ListItem key={index} sx={{
                      py: 1.5,
                      px: 0,
                      '&:not(:last-child)': {
                        borderBottom: '1px solid #fed7aa'
                      }
                    }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ArrowForwardIcon sx={{ fontSize: 14, color: 'white' }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={rec}
                        sx={{
                          color: '#111827',
                          '& .MuiListItemText-primary': {
                            fontWeight: 500,
                            lineHeight: 1.5,
                            fontSize: '0.95rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#10b981',
            color: 'white',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#059669',
            }
          }}
        >
          Close Assessment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentDetailsModal;
