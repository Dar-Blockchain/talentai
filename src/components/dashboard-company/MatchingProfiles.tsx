
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
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

  return (
    <>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, rgba(0,255,157,0.9), rgba(2,226,255,0.9))',
            boxShadow: '0 4px 12px rgba(2,226,255,0.35)'
          }}>
            <PersonSearchIcon sx={{ color: '#0f172a', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800 }}>
            Matching Candidates
          </Typography>
          <Tooltip title="Candidates are matched based on their skills meeting or exceeding the required level for your job posting. The match score indicates how well their skills align with your requirements.">
            <InfoIcon sx={{ color: 'rgba(0, 255, 157, 1)', cursor: 'help' }} />
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            variant="contained"
            startIcon={<WorkIcon />}
            onClick={onBackToJobs}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              color: '#0f172a',
              fontWeight: 700,
              borderRadius: '16px',
              px: 3,
              py: 1.5,
              fontSize: '0.95rem',
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(2,226,255,0.3)',
              border: '2px solid transparent',
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
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 28px rgba(2,226,255,0.4)',
                border: '2px solid rgba(255,255,255,0.3)'
              },
              '&:active': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(2,226,255,0.3)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiButton-startIcon': {
                zIndex: 2,
                position: 'relative'
              },
              '& .MuiButton-label': {
                zIndex: 2,
                position: 'relative'
              }
            }}
          >
            ← Return to Jobs
          </Button>
        </Box>
      </Box>

      {/* Content Section */}
      {isLoadingMatches ? (
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
      ) : matchError ? (
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
      ) : !matchingProfiles || matchingProfiles.length === 0 ? (
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
                borderColor: 'rgba(0,255,157,0.6)',
                color: '#00FFC3',
                fontWeight: 700,
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.95rem',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: '#00FFC3',
                  backgroundColor: 'rgba(0,255,195,0.08)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              ← Back to Jobs
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
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.95rem',
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
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Stats Summary */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            background: 'linear-gradient(135deg, rgba(0,255,157,0.05) 0%, rgba(2,226,255,0.05) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(0,255,157,0.1)',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>
              Found {matchingProfiles.length} matching candidates
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              Showing {Math.min(displayCount, matchingProfiles.length)} of {matchingProfiles.length}
            </Typography>
          </Box>

          {/* Candidate Cards */}
          {matchingProfiles.slice(0, displayCount).map((candidate, index) => (
            <Box
              key={candidate.candidateId._id}
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '20px',
                border: '1px solid rgba(0,255,157,0.15)',
                boxShadow: '0 8px 32px rgba(0,255,157,0.1)',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 48px rgba(0,255,157,0.15)',
                  border: '1px solid rgba(0,255,157,0.25)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>
                      {candidate.name || candidate.candidateId.username}
                    </Typography>
                    {candidate.candidateId.isVerified && (
                      <Chip
                        label="Verified"
                        size="small"
                        icon={<CheckIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          backgroundColor: 'rgba(0,255,157,0.15)',
                          color: '#00FFC3',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                    {candidate.candidateId.email}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h5" sx={{ color: '#00FFC3', fontWeight: 800, mb: 0.5 }}>
                    {candidate.score}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Match Score
                  </Typography>
                </Box>
              </Box>

              {/* Skills Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#1e293b', fontWeight: 700, mb: 1.5 }}>
                  Matched Skills ({candidate.matchedSkills.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {candidate.matchedSkills.slice(0, 6).map((skill, idx) => (
                    <Chip
                      key={skill._id || idx}
                      label={skill.name}
                      size="small"
                      icon={<StarIcon sx={{ color: '#00FFC3', fontSize: 16 }} />}
                      sx={{
                        backgroundColor: 'rgba(0,255,157,0.15)',
                        color: '#1e293b',
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
          ))}

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
      )}
    </>
  );
};

export default MatchingProfiles;
