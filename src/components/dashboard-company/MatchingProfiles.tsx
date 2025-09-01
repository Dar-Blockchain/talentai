
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/router';

// Update the MatchingCandidate interface
interface MatchingCandidate {
  candidateId: {
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    role: string;
  };
  name: string;
  score: number;
  finalBid: number;
  matchedSkills: Array<{
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
    _id: string;
    ScoreTest?: number;
  }>;
  requiredSkills: Array<{
    name: string;
    level: string;
    importance: string;
    category: string;
    _id: string;
  }>;
}

interface MatchingProfilesProps {
  matchingProfiles: MatchingCandidate[];
  isLoadingMatches: boolean;
  matchError: string | null;
  displayCount: number;
  selectedJob: string;
  onRetry: () => void;
  onBackToJobs: () => void;
  onCreateNewJob: () => void;
  onLoadMore: () => void;
  onBidDialogOpen: (candidate: MatchingCandidate) => void;
}

const MatchingProfiles: React.FC<MatchingProfilesProps> = ({
  matchingProfiles,
  isLoadingMatches,
  matchError,
  displayCount,
  selectedJob,
  onRetry,
  onBackToJobs,
  onCreateNewJob,
  onLoadMore,
  onBidDialogOpen,
}) => {
  const router = useRouter();

  if (isLoadingMatches) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 8,
        background: 'linear-gradient(135deg, rgba(2,226,255,0.03) 0%, rgba(0,255,195,0.03) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(0,255,157,0.1)'
      }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(2,226,255,0.1), rgba(0,255,195,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 8px 32px rgba(2,226,255,0.15)'
        }}>
          <CircularProgress sx={{ color: '#02E2FF', width: 48, height: 48 }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 1 }}>
          Finding Perfect Matches
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
          Analyzing candidate profiles and skills...
        </Typography>
      </Box>
    );
  }

  if (matchError) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 4,
        background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(220,38,38,0.05) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(239,68,68,0.2)',
        textAlign: 'center'
      }}>
        <Box sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}>
          <ErrorIcon sx={{ fontSize: 32, color: '#dc2626' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 2 }}>
          Error Loading Matches
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: '400px', mb: 3 }}>
          {matchError}
        </Typography>
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            color: '#0f172a',
            fontWeight: 700,
            borderRadius: '12px',
            px: 3,
            '&:hover': {
              background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!matchingProfiles || matchingProfiles.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        background: 'linear-gradient(135deg, rgba(2,226,255,0.03) 0%, rgba(0,255,195,0.03) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(0,255,157,0.1)',
        textAlign: 'center'
      }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(2,226,255,0.1), rgba(0,255,195,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 8px 32px rgba(2,226,255,0.15)'
        }}>
          <PersonSearchIcon sx={{ fontSize: 40, color: '#02E2FF' }} />
        </Box>
        <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 700, mb: 2 }}>
          No Matching Candidates Found
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', maxWidth: '500px', mb: 4, lineHeight: 1.6 }}>
          We couldn't find any candidates that match your job requirements. Try adjusting your filters or requirements to find more matches.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={onBackToJobs}
            sx={{
              borderColor: '#02E2FF',
              color: '#02E2FF',
              borderRadius: '12px',
              px: 3,
              '&:hover': {
                borderColor: '#00FFC3',
                backgroundColor: 'rgba(0,255,195,0.05)'
              }
            }}
          >
            Back to Jobs
          </Button>
          <Button
            variant="contained"
            onClick={onCreateNewJob}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              color: '#0f172a',
              fontWeight: 700,
              borderRadius: '12px',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Create New Job
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Stats Summary */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(2,226,255,0.05) 0%, rgba(0,255,195,0.05) 100%)',
        borderRadius: '20px',
        p: 3,
        border: '1px solid rgba(0,255,157,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#02E2FF', fontWeight: 800, mb: 0.5 }}>
            {matchingProfiles.length}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Total Matches
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#00FFC3', fontWeight: 800, mb: 0.5 }}>
            {Math.round(matchingProfiles.reduce((acc, c) => acc + (c.score || 0), 0) / matchingProfiles.length)}%
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Avg. Match Score
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#7C4DFF', fontWeight: 800, mb: 0.5 }}>
            ${Math.round(matchingProfiles.reduce((acc, c) => acc + (c.finalBid || 0), 0) / matchingProfiles.length)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Avg. Bid Amount
          </Typography>
        </Box>
      </Box>

      {/* Candidates Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(400px, 1fr))' },
        gap: 3
      }}>
        {matchingProfiles.slice(0, displayCount).map((candidate: MatchingCandidate, index: number) => (
          <Box
            key={candidate?.candidateId?._id || `temp-${Math.random()}`}
            sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(0,255,157,0.15)',
              boxShadow: '0 8px 32px rgba(0,255,157,0.08)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0,255,157,0.15)',
                border: '1px solid rgba(0,255,157,0.3)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)`,
                opacity: 0.8
              }
            }}
          >
            {/* Header Section */}
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(2,226,255,0.05) 0%, rgba(0,255,195,0.05) 100%)',
              p: 3,
              borderBottom: '1px solid rgba(0,255,157,0.1)'
            }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                  {/* Enhanced Avatar */}
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    boxShadow: '0 8px 24px rgba(2,226,255,0.3)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: '-2px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #02E2FF, #00FFC3)',
                      opacity: 0.3,
                      zIndex: -1
                    }
                  }}>
                    {candidate?.candidateId?.username ? candidate.candidateId.username.charAt(0).toUpperCase() : '?'}
                  </Box>
                  
                  {/* User Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="h6" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        lineHeight: 1.2
                      }}>
                        {candidate?.candidateId?.username || 'Anonymous'}
                      </Typography>
                      {candidate?.candidateId?.isVerified && (
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                        }}>
                          <CheckIcon sx={{ fontSize: 14, color: '#ffffff' }} />
                        </Box>
                      )}
                      <Chip
                        label={candidate?.candidateId?.role || 'Developer'}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(2,226,255,0.1)',
                          color: '#02E2FF',
                          fontWeight: 600,
                          height: 24,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b', 
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <EmailIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      {candidate?.candidateId?.email || 'No email provided'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Score and Bid Cards */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 2,
                justifyContent: 'space-between'
              }}>
                {/* Match Score */}
                <Box sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  flex: 1,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography variant="h4" sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: '1.5rem',
                      lineHeight: 1,
                      mb: 0.5
                    }}>
                      {candidate?.score || 0}%
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#0f172a',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}>
                      Match Score
                    </Typography>
                  </Box>
                </Box>
                
                {/* Current Bid */}
                <Box sx={{
                  background: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D4 100%)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  flex: 1,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    zIndex: 1
                  }
                }}>
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography variant="h4" sx={{
                      fontWeight: 800,
                      color: '#ffffff',
                      fontSize: '1.5rem',
                      lineHeight: 1,
                      mb: 0.5
                    }}>
                      ${candidate?.finalBid || 0}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}>
                      Current Bid
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ p: 3 }}>
              {/* Matched Skills Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{
                  color: '#1e293b',
                  mb: 2,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '1rem'
                }}>
                  <Box sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(2,226,255,0.3)'
                  }}>
                    <StarIcon sx={{ fontSize: 18, color: '#0f172a' }} />
                  </Box>
                  Matched Skills ({candidate?.matchedSkills?.length || 0})
                </Typography>
                
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(200px, 1fr))' },
                  gap: 2
                }}>
                  {(candidate?.matchedSkills || []).map((skill, skillIndex) => (
                    <Box
                      key={skill?._id || `skill-${skillIndex}`}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(2,226,255,0.08) 0%, rgba(0,255,195,0.08) 100%)',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid rgba(2,226,255,0.15)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(2,226,255,0.15)',
                          border: '1px solid rgba(2,226,255,0.3)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Typography sx={{ 
                          color: '#1e293b', 
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}>
                          {skill?.name || 'Unnamed Skill'}
                        </Typography>
                        <Chip
                          label={skill?.experienceLevel || 'N/A'}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D4 100%)',
                            color: '#ffffff',
                            height: 26,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: '12px',
                            px: 1.5,
                            boxShadow: '0 4px 12px rgba(124,77,255,0.3)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                              zIndex: 1
                            },
                            '& .MuiChip-label': {
                              zIndex: 2,
                              position: 'relative',
                              fontWeight: 700,
                              letterSpacing: 0.3,
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            },
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 16px rgba(124,77,255,0.4)',
                              background: 'linear-gradient(135deg, #00B8D4 0%, #7C4DFF 100%)'
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      </Box>
                      
                      {/* Proficiency Bar */}
                      <Box sx={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'rgba(2,226,255,0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        mb: 2
                      }}>
                        <Box sx={{
                          width: `${((skill?.proficiencyLevel || 0) / 5) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                          borderRadius: '4px',
                          transition: 'width 0.8s ease'
                        }} />
                      </Box>
                      
                      {/* Proficiency Level Indicator */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 1
                      }}>
                        <Typography variant="caption" sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          Proficiency: {skill?.proficiencyLevel || 0}/5
                        </Typography>
                        {skill?.ScoreTest && (
                          <Chip
                            label={`Test: ${skill.ScoreTest}%`}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                              color: '#0f172a',
                              height: 24,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: '12px',
                              px: 1.5,
                              boxShadow: '0 4px 12px rgba(0,255,195,0.3)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                                zIndex: 1
                              },
                              '& .MuiChip-label': {
                                zIndex: 2,
                                position: 'relative',
                                fontWeight: 700,
                                letterSpacing: 0.3
                              },
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0,255,195,0.4)',
                                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)'
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Required Skills Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{
                  color: '#1e293b',
                  mb: 2,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '1rem'
                }}>
                  <Box sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #7C4DFF 0%, #00B8D4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(124,77,255,0.3)'
                  }}>
                    <WorkIcon sx={{ fontSize: 18, color: '#ffffff' }} />
                  </Box>
                  Required Skills ({candidate?.requiredSkills?.length || 0})
                </Typography>
                
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  backgroundColor: 'rgba(124,77,255,0.05)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(124,77,255,0.1)'
                }}>
                  {(candidate?.requiredSkills || []).map((skill, skillIndex) => (
                    <Chip
                      key={skill?._id || `req-skill-${skillIndex}`}
                      label={`${skill?.name || 'Unnamed'} (${skill?.level || 'N/A'})`}
                      size="small"
                      icon={<StarIcon sx={{ fontSize: 16, color: '#7C4DFF' }} />}
                      sx={{
                        backgroundColor: 'rgba(124,77,255,0.1)',
                        color: '#7C4DFF',
                        fontWeight: 600,
                        height: 28,
                        fontSize: '0.8rem',
                        border: '1px solid rgba(124,77,255,0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(124,77,255,0.15)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                mt: 'auto',
                pt: 2,
                borderTop: '1px solid rgba(0,255,157,0.1)'
              }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EmailIcon />}
                  component="a"
                  href={`mailto:${candidate?.candidateId?.email}`}
                  sx={{
                    background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                    color: '#0f172a',
                    fontWeight: 700,
                    borderRadius: '16px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 16px rgba(2,226,255,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(2,226,255,0.4)'
                    },
                    transition: 'all 0.3s ease',
                    '&.Mui-disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af'
                    }
                  }}
                  disabled={!candidate?.candidateId?.email}
                >
                  Contact Candidate
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AttachMoneyIcon />}
                  onClick={() => onBidDialogOpen(candidate)}
                  sx={{
                    borderColor: 'rgba(0, 255, 157, 0.6)',
                    color: '#00FFC3',
                    fontWeight: 700,
                    borderRadius: '16px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    borderWidth: '2px',
                    backgroundColor: 'rgba(0,255,195,0.02)',
                    '&:hover': {
                      borderColor: '#00FFC3',
                      backgroundColor: 'rgba(0,255,195,0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,255,195,0.2)'
                    },
                    transition: 'all 0.3s ease',
                    '&.Mui-disabled': {
                      borderColor: '#e5e7eb',
                      color: '#9ca3af'
                    }
                  }}
                  disabled={!candidate?.candidateId?._id || !selectedJob}
                >
                  Place Bid
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Load More Button */}
      {matchingProfiles.length > displayCount && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            onClick={onLoadMore}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              color: '#0f172a',
              fontWeight: 700,
              borderRadius: '16px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(2,226,255,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(2,226,255,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
            endIcon={<ExpandMoreIcon />}
          >
            Load More Candidates
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MatchingProfiles;
