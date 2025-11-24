
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TollIcon from '@mui/icons-material/Toll';
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
  
  // Items per page selector - user can choose 5, 10, or 20
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const calculatedTotalPages = Math.ceil(matchingProfiles.length / itemsPerPage);
  const [localPage, setLocalPage] = React.useState(1);
  
  // Reset to page 1 when items per page changes
  React.useEffect(() => {
    setLocalPage(1);
    if (onPageChange) {
      onPageChange(1);
    }
  }, [itemsPerPage, onPageChange]);
  
  // Use provided pagination or fallback to local
  const page = onPageChange ? currentPage : localPage;
  const handlePageChange = onPageChange || ((newPage: number) => setLocalPage(newPage));
  
  // Get items for current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = matchingProfiles.slice(startIndex, endIndex);
  const effectiveTotalPages = totalPages > 1 ? totalPages : calculatedTotalPages;
  
  const handleItemsPerPageChange = (event: any) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newItemsPerPage);
  };

  return (
    <>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Items per page selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="items-per-page-label">Per Page</InputLabel>
            <Select
              labelId="items-per-page-label"
              id="items-per-page-select"
              value={itemsPerPage}
              label="Per Page"
              onChange={handleItemsPerPageChange}
              sx={{
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                },
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
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
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ 
                color: '#10b981', 
                fontWeight: 600,
                fontSize: '1rem'
              }}>
                Found {matchingProfiles.length} matching candidates
              </Typography>
              {effectiveTotalPages > 1 && (
                <Typography variant="body2" sx={{ 
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  (Showing {startIndex + 1}-{Math.min(endIndex, matchingProfiles.length)} of {matchingProfiles.length})
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ 
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              {itemsPerPage} per page
            </Typography>
          </Box>

          {/* Candidate Cards */}
          {paginatedCandidates.map((candidate, index) => (
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
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        filter: 'blur(4px)',
                        userSelect: 'none'
                      }}
                    >
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
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mt: 'auto'
                }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TollIcon />}
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
                  Place Bid (TAI)
                </Button>
              </Box>
            </Box>
          ))}

          {/* Pagination */}
          {effectiveTotalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={effectiveTotalPages}
                page={page}
                onChange={(event, newPage) => handlePageChange(newPage)}
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
