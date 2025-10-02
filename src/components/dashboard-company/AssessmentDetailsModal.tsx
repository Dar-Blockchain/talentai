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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Assessment {
  _id: string;
  condidateId: {
    userId: {
      username: string;
      email: string;
    };
    skills: Array<{
      _id: string;
      name: string;
      experienceLevel: string;
    }>;
  };
  jobId: {
    jobDetails: {
      title: string;
    };
  };
  analysis: {
    overallScore: number;
    jobMatch: {
      status: string;
    };
    skillAnalysis: Array<{
      skillName: string;
      requiredLevel: string;
      match: string;
    }>;
    recommendations: string[];
  };
  timestamp: string;
}

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
              Assessment Details
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 400 }}>
              Comprehensive candidate evaluation and skill analysis
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#6b7280' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 3,
        mt:"10px",

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
                  {(assessment?.condidateId?.userId?.username || 'U')?.[0]}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: '#111827',
                    mb: 1
                  }} noWrap>
                    {assessment?.condidateId?.userId?.username}
                  </Typography>
                  {assessment?.condidateId?.userId?.email && (
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280', 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }} noWrap>
                      <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                      {assessment?.condidateId?.userId?.email}
                    </Typography>
                  )}
                  <Typography variant="h6" sx={{ 
                    color: '#10b981', 
                    fontWeight: 600,
                    mb: 1
                  }} noWrap>
                    {assessment?.jobId?.jobDetails?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <InfoIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    Assessment Date: {new Date(assessment.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={Number(assessment.analysis.overallScore) || 0} 
                    size={80} 
                    thickness={4} 
                    sx={{ 
                      color: '#10b981'
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
                      {assessment.analysis.overallScore}%
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={assessment.analysis?.jobMatch?.status}
                    size="medium"
                    sx={{
                      backgroundColor: assessment.analysis?.jobMatch?.status === 'match' 
                        ? '#10b981' 
                        : '#ef4444',
                      color: 'white',
                      fontWeight: 600,
                      height: 32,
                      fontSize: '0.875rem',
                      borderRadius: '8px'
                    }}
                  />
                  <Typography variant="caption" sx={{ 
                    color: '#64748b', 
                    display: 'block', 
                    mt: 1,
                    fontWeight: 600
                  }}>
                    Job Match Status
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Candidate Skills */}
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
                <StarIcon sx={{ fontSize: 18, color: 'white' }} />
              </Box>
              Candidate Skills ({assessment.condidateId.skills.length})
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' },
              gap: 2
            }}>
              {assessment.condidateId.skills.map((skill: any, index: number) => (
                <Box
                  key={skill._id}
                  sx={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ 
                    color: '#111827', 
                    fontWeight: 600,
                    mb: 1
                  }}>
                    {skill.name}
                  </Typography>
                  <Chip
                    label={skill.experienceLevel}
                    size="small"
                    sx={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      fontWeight: 600,
                      height: 24,
                      borderRadius: '6px',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Assessment Results */}
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
              Assessment Results
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(200px, 1fr))' },
              gap: 3
            }}>
              <Box sx={{
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #bae6fd',
                textAlign: 'center'
              }}>
                <Typography variant="h4" sx={{ 
                  color: '#10b981', 
                  fontWeight: 700,
                  mb: 1
                }}>
                  {assessment.analysis.overallScore}%
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#6b7280',
                  fontWeight: 600
                }}>
                  Overall Score
                </Typography>
              </Box>
              
              <Box sx={{
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #fcd34d',
                textAlign: 'center'
              }}>
                <Typography variant="h4" sx={{ 
                  color: '#f59e0b', 
                  fontWeight: 700,
                  mb: 1
                }}>
                  {assessment.analysis?.jobMatch?.status === 'match' ? '✓' : '✗'}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#6b7280',
                  fontWeight: 600
                }}>
                  Job Match
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Skill Analysis */}
          <Box sx={{ 
            mb: 4, 
            backgroundColor: '#f8fafc',
            borderRadius: '12px', 
            padding: '20px', 
            border: '1px solid #e2e8f0'
          }}>
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
              Skill Analysis ({assessment.analysis.skillAnalysis.length} skills)
            </Typography>
            
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' },
              gap: 3
            }}>
              {assessment.analysis.skillAnalysis.map((skill: any, index: number) => {
                // Check if this is a soft skill (no requiredLevel field or requiredLevel is null/undefined)
                const isSoftSkill = !skill.requiredLevel || skill.requiredLevel === null || skill.requiredLevel === undefined;

                return (
                  <Box key={index} sx={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <Typography variant="subtitle1" sx={{ 
                      color: '#111827', 
                      mb: 2,
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      {skill.skillName}
                    </Typography>
                    
                    {isSoftSkill ? (
                      // Soft skill display - only skillName and confidenceScore
                      <Box sx={{
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        padding: '12px',
                        textAlign: 'center',
                        border: '1px solid #bae6fd'
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#6b7280',
                          mb: 1,
                          fontWeight: 500
                        }}>
                          Confidence Score
                        </Typography>
                        <Typography sx={{ 
                          color: '#111827',
                          fontWeight: 700,
                          fontSize: '1.25rem'
                        }}>
                          {skill.confidenceScore || 'N/A'}%
                        </Typography>
                      </Box>
                    ) : (
                      // Technical skill display - full details
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2
                      }}>
                        <Box sx={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          border: '1px solid #e2e8f0'
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: '#6b7280',
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Required Level
                          </Typography>
                          <Typography sx={{ 
                            color: '#111827',
                            fontWeight: 600,
                            fontSize: '1rem'
                          }}>
                            {skill.requiredLevel}
                          </Typography>
                        </Box>
                        
                        <Box sx={{
                          backgroundColor: skill.match === 'match' 
                            ? '#f0fdf4' 
                            : '#fef2f2',
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          border: `1px solid ${skill.match === 'match' 
                            ? '#bbf7d0' 
                            : '#fecaca'}`
                        }}>
                          <Typography variant="body2" sx={{ 
                            color: '#6b7280',
                            mb: 1,
                            fontWeight: 500
                          }}>
                            Match Status
                          </Typography>
                          <Chip
                            label={skill.match}
                            size="small"
                            sx={{
                              backgroundColor: skill.match === 'match' 
                                ? '#10b981' 
                                : '#ef4444',
                              color: 'white',
                              fontWeight: 600,
                              height: 24,
                              borderRadius: '6px',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Recommendations */}
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
              Recommendations ({assessment.analysis.recommendations.length})
            </Typography>
            
            <Box sx={{
              backgroundColor: '#fffbeb',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #fed7aa'
            }}>
              <List sx={{ p: 0 }}>
                {assessment.analysis.recommendations.map((rec: string, index: number) => (
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
