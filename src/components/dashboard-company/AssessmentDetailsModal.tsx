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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';

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
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(24px)',
          borderRadius: '28px',
          border: '2px solid rgba(0, 255, 157, 0.15)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.3)',
          maxHeight: '95vh',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #00FF9D 0%, #02E2FF 50%, #00FF9D 100%)',
            borderRadius: '28px 28px 0 0',
            zIndex: 1
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        borderBottom: '2px solid rgba(0, 255, 157, 0.2)',
        pb: 3,
        pt: 4,
        position: 'relative',
        zIndex: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #00FF9D 0%, #02E2FF 100%)',
            borderRadius: '16px',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 255, 157, 0.3)'
          }}>
            <StarIcon sx={{ color: '#1e293b', fontSize: 28, fontWeight: 'bold' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, background: 'linear-gradient(90deg, #00FF9D, #02E2FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Assessment Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
              Comprehensive candidate evaluation and skill analysis
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ 
        mt: 0, 
        p: 0,
        overflowY: 'auto',
        maxHeight: 'calc(95vh - 200px)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)'
      }}>
        <Box sx={{ p: 4 }}>
          {/* Enhanced Candidate & Job Header */}
          <Box sx={{
            mb: 4,
            background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.08) 0%, rgba(2, 226, 255, 0.08) 100%)',
            borderRadius: '24px',
            p: 4,
            border: '2px solid rgba(0, 255, 157, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00FF9D 0%, #02E2FF 100%)'
            }
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
                  width: 72,
                  height: 72,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  boxShadow: '0 12px 32px rgba(2,226,255,0.4)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: '-3px',
                    borderRadius: '23px',
                    background: 'linear-gradient(135deg, #02E2FF, #00FFC3)',
                    opacity: 0.3,
                    zIndex: -1
                  }
                }}>
                  {(assessment?.condidateId?.userId?.username || 'U')?.[0]}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800, 
                    color: '#1e293b',
                    mb: 1,
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }} noWrap>
                    {assessment?.condidateId?.userId?.username}
                  </Typography>
                  {assessment?.condidateId?.userId?.email && (
                    <Typography variant="body1" sx={{ 
                      color: '#64748b', 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }} noWrap>
                      <EmailIcon sx={{ fontSize: 18, color: '#64748b' }} />
                      {assessment?.condidateId?.userId?.email}
                    </Typography>
                  )}
                  <Typography variant="h6" sx={{ 
                    color: '#02E2FF', 
                    fontWeight: 700,
                    mb: 1
                  }} noWrap>
                    {assessment?.jobId?.jobDetails?.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <InfoIcon sx={{ fontSize: 16, color: '#00FFC3' }} />
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
                    size={96} 
                    thickness={6} 
                    sx={{ 
                      color: '#7C4DFF',
                      filter: 'drop-shadow(0 4px 12px rgba(124,77,255,0.3))'
                    }} 
                  />
                  <Box sx={{
                    top: 0, left: 0, bottom: 0, right: 0, 
                    position: 'absolute', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h4" component="div" sx={{ 
                      fontWeight: 800,
                      color: '#1e293b',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {assessment.analysis.overallScore}%
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={assessment.analysis.jobMatch.status}
                    size="medium"
                    sx={{
                      backgroundColor: assessment.analysis.jobMatch.status === 'match' 
                        ? 'linear-gradient(135deg, rgba(0,255,195,0.9), rgba(0,255,195,0.8))' 
                        : 'linear-gradient(135deg, rgba(255,59,48,0.9), rgba(255,59,48,0.8))',
                      background: assessment.analysis.jobMatch.status === 'match' 
                        ? 'linear-gradient(135deg, rgba(0,255,195,0.9), rgba(0,255,195,0.8))' 
                        : 'linear-gradient(135deg, rgba(255,59,48,0.9), rgba(255,59,48,0.8))',
                      color: assessment.analysis.jobMatch.status === 'match' ? '#065f46' : '#7f1d1d',
                      fontWeight: 700,
                      height: 32,
                      fontSize: '0.9rem',
                      borderRadius: '16px',
                      boxShadow: assessment.analysis.jobMatch.status === 'match'
                        ? '0 4px 16px rgba(0,255,195,0.3)'
                        : '0 4px 16px rgba(255,59,48,0.3)'
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

          {/* Enhanced Candidate Skills */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ 
              color: '#1e293b', 
              mb: 3, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,255,195,0.3)'
              }}>
                <StarIcon sx={{ fontSize: 20, color: '#0f172a' }} />
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
                    background: 'linear-gradient(135deg, rgba(0,255,195,0.08) 0%, rgba(2,226,255,0.08) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(0,255,195,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 32px rgba(0,255,195,0.15)',
                      border: '1px solid rgba(0,255,195,0.4)'
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ 
                    color: '#1e293b', 
                    fontWeight: 700,
                    mb: 1
                  }}>
                    {skill.name}
                  </Typography>
                  <Chip
                    label={skill.experienceLevel}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(0, 255, 157, 0.9)',
                      color: '#0f172a',
                      fontWeight: 700,
                      height: 28,
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Enhanced Assessment Results */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ 
              color: '#1e293b', 
              mb: 3,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(124,77,255,0.3)'
              }}>
                <TrendingUpIcon sx={{ fontSize: 20, color: '#ffffff' }} />
              </Box>
              Assessment Results
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(200px, 1fr))' },
              gap: 3
            }}>
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(2,226,255,0.08) 0%, rgba(0,255,195,0.08) 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(2,226,255,0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h3" sx={{ 
                  color: '#02E2FF', 
                  fontWeight: 800,
                  mb: 1
                }}>
                  {assessment.analysis.overallScore}%
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#64748b',
                  fontWeight: 600
                }}>
                  Overall Score
                </Typography>
              </Box>
              
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(124,77,255,0.08) 0%, rgba(0,184,212,0.08) 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(124,77,255,0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h3" sx={{ 
                  color: '#7C4DFF', 
                  fontWeight: 800,
                  mb: 1
                }}>
                  {assessment.analysis.jobMatch.status === 'match' ? '✓' : '✗'}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: '#64748b',
                  fontWeight: 600
                }}>
                  Job Match
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Enhanced Skill Analysis */}
          <Box sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            borderRadius: '24px', 
            padding: '24px', 
            border: '2px solid rgba(0, 255, 157, 0.2)',
            boxShadow: '0 8px 32px rgba(0,255,157,0.1)'
          }}>
            <Typography variant="h5" sx={{ 
              color: '#1e293b', 
              mb: 3,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0,255,195,0.3)'
              }}>
                <WorkIcon sx={{ fontSize: 20, color: '#0f172a' }} />
              </Box>
              Skill Analysis ({assessment.analysis.skillAnalysis.length} skills)
            </Typography>
            
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' },
              gap: 3
            }}>
              {assessment.analysis.skillAnalysis.map((skill: any, index: number) => (
                <Box key={index} sx={{ 
                  background: 'linear-gradient(135deg, rgba(0,255,195,0.05) 0%, rgba(2,226,255,0.05) 100%)',
                  borderRadius: '20px',
                  padding: '20px',
                  border: '1px solid rgba(0,255,195,0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,255,195,0.15)',
                    border: '1px solid rgba(0,255,195,0.3)'
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#1e293b', 
                    mb: 2,
                    fontWeight: 700,
                    textAlign: 'center'
                  }}>
                    {skill.skillName}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    mb: 2
                  }}>
                    <Box sx={{
                      background: 'rgba(2,226,255,0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      border: '1px solid rgba(2,226,255,0.2)'
                    }}>
                      <Typography variant="subtitle2" sx={{ 
                        color: '#64748b',
                        mb: 1,
                        fontWeight: 600
                      }}>
                        Required Level
                      </Typography>
                      <Typography sx={{ 
                        color: '#1e293b',
                        fontWeight: 700,
                        fontSize: '1.1rem'
                      }}>
                        {skill.requiredLevel}
                      </Typography>
                    </Box>
                    
                    <Box sx={{
                      background: skill.match === 'match' 
                        ? 'rgba(0,255,195,0.1)' 
                        : 'rgba(255,59,48,0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      border: `1px solid ${skill.match === 'match' 
                        ? 'rgba(0,255,195,0.2)' 
                        : 'rgba(255,59,48,0.2)'}`
                    }}>
                      <Typography variant="subtitle2" sx={{ 
                        color: '#64748b',
                        mb: 1,
                        fontWeight: 600
                      }}>
                        Match Status
                      </Typography>
                      <Chip
                        label={skill.match}
                        size="small"
                        sx={{
                          backgroundColor: skill.match === 'match' 
                            ? 'rgba(0,255,195,0.9)' 
                            : 'rgba(255,59,48,0.9)',
                          color: skill.match === 'match' ? '#065f46' : '#7f1d1d',
                          fontWeight: 700,
                          height: 28,
                          borderRadius: '12px',
                          fontSize: '0.8rem'
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Enhanced Recommendations */}
          <Box>
            <Typography variant="h5" sx={{ 
              color: '#1e293b', 
              mb: 3,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(255,107,107,0.3)'
              }}>
                <AutoAwesomeIcon sx={{ fontSize: 20, color: '#ffffff' }} />
              </Box>
              Recommendations ({assessment.analysis.recommendations.length})
            </Typography>
            
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(255,107,107,0.05) 0%, rgba(255,230,109,0.05) 100%)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255,107,107,0.2)'
            }}>
              <List sx={{ p: 0 }}>
                {assessment.analysis.recommendations.map((rec: string, index: number) => (
                  <ListItem key={index} sx={{ 
                    py: 1,
                    px: 0,
                    '&:not(:last-child)': {
                      borderBottom: '1px solid rgba(255,107,107,0.1)'
                    }
                  }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ArrowForwardIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={rec} 
                      sx={{ 
                        color: '#1e293b',
                        '& .MuiListItemText-primary': {
                          fontWeight: 500,
                          lineHeight: 1.6
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
        p: 4, 
        borderTop: '2px solid rgba(0, 255, 157, 0.15)',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '0 0 28px 28px'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #00FF9D 0%, #02E2FF 100%)',
            color: '#1e293b',
            fontWeight: 700,
            borderRadius: '16px',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            boxShadow: '0 8px 24px rgba(0, 255, 157, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00E2B8 0%, #00C3FF 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 32px rgba(0, 255, 157, 0.4)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Close Assessment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentDetailsModal;
