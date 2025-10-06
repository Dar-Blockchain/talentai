
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  Pagination,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
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
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const router = useRouter();

  return (
    <>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ 
            color: '#111827', 
            fontWeight: 700,
            fontSize: '1.5rem',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '60px',
              height: '3px',
              backgroundColor: '#10b981',
              borderRadius: '2px'
            }
          }}>
            Matching Candidates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onBackToJobs}
          sx={{
            backgroundColor: '#10b981',
            color: 'white',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#059669',
            }
          }}
        >
          Return to Jobs
        </Button>
      </Box>

      {/* Content Section */}
      {isLoadingMatches ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 8,
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <CircularProgress sx={{ color: '#3b82f6', mb: 3 }} />
          <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, mb: 1 }}>
            Finding Perfect Matches
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
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
          backgroundColor: '#fef2f2',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          textAlign: 'center'
        }}>
          <ErrorIcon sx={{ fontSize: 48, color: '#dc2626', mb: 3 }} />
          <Typography variant="h6" sx={{ color: '#111827', fontWeight: 600, mb: 2 }}>
            Error Loading Matches
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', maxWidth: '400px', mb: 3 }}>
            {matchError}
          </Typography>
          <Button
            variant="contained"
            onClick={onRetry}
            sx={{
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 600,
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                backgroundColor: '#2563eb'
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
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <PersonSearchIcon sx={{ fontSize: 48, color: '#6b7280', mb: 3 }} />
          <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700, mb: 2 }}>
            No Matching Candidates Found
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280', maxWidth: '500px', mb: 4, lineHeight: 1.6 }}>
            We couldn't find any candidates that match your job requirements. Try adjusting your filters or requirements to find more matches.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={onBackToJobs}
              sx={{
                borderColor: '#d1d5db',
                color: '#374151',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
            >
              ← Back to Jobs
            </Button>
            <Button
              variant="contained"
              onClick={onCreateNewJob}
              sx={{
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#2563eb'
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
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            mb: 3
          }}>
            <Typography variant="h6" sx={{ 
              color: '#10b981', 
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              Found {matchingProfiles.length} matching candidates
            </Typography>
          </Box>

          {/* Candidate Cards */}
          {matchingProfiles.slice(0, displayCount).map((candidate, index) => (
            <Box
              key={candidate.candidateId._id}
              sx={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                p: 3,
                transition: 'border-color 0.2s',
                '&:hover': {
                  borderColor: '#d1d5db'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: '#f3f4f6',
                      border: '2px solid #e5e7eb',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: '#6b7280'
                    }}
                  >
                    {(candidate.name || candidate.candidateId.username)?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ 
                      color: '#111827', 
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      mb: 0.5
                    }}>
                      {candidate.name || candidate.candidateId.username} | {candidate.candidateId.role || 'Software Engineer'}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280', 
                      fontSize: '0.875rem'
                    }}>
                      {candidate.candidateId.email}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'center', ml: 2 }}>
                  <Box sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    border: `6px solid ${candidate.score >= 70 ? '#10b981' : candidate.score >= 50 ? '#f59e0b' : '#ef4444'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    position: 'relative'
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: '#111827', 
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      lineHeight: 1
                    }}>
                      {candidate.score.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#6b7280', 
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      mt: 0.5
                    }}>
                      Matching Score
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Skills Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ 
                  color: '#111827', 
                  fontWeight: 600, 
                  mb: 1.5,
                  fontSize: '0.875rem'
                }}>
                  Matched Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {candidate.matchedSkills.slice(0, 6).map((skill, idx) => (
                    <Chip
                      key={skill._id || idx}
                      label={`${skill.name} (${skill.experienceLevel || skill.proficiencyLevel || 'N/A'})`}
                      size="small"
                      sx={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        fontWeight: 500,
                        height: 28,
                        fontSize: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: '#e5e7eb'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                mt: 'auto'
              }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<EmailIcon />}
                  component="a"
                  href={`mailto:${candidate?.candidateId?.email}`}
                  sx={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: '8px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: '#059669'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#e5e7eb',
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
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    fontWeight: 600,
                    borderRadius: '8px',
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    borderWidth: '1px',
                    '&:hover': {
                      borderColor: '#2563eb',
                      backgroundColor: '#eff6ff'
                    },
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

          {/* Pagination */}
          {totalPages > 1 && onPageChange && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => onPageChange(page)}
                color="primary"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#6b7280',
                    '&.Mui-selected': {
                      backgroundColor: '#10b981',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#059669'
                      }
                    },
                    '&:hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default MatchingProfiles;
