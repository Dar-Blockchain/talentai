import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from 'next/router';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Job {
  _id: string;
  jobDetails: {
    title: string;
    location: string;
    employmentType: string;
    salary: {
      currency: string;
      min: number;
      max: number;
    };
    description: string;
  };
  skillAnalysis?: {
    requiredSkills: Array<{
      name: string;
    }>;
  };
  post_Steps?: Array<{
    postId: string;
    order: number;
  }>;
  createdAt: string;
}

interface MyJobPostsProps {
  myJobs: Job[];
  isLoadingJobs: boolean;
  jobsError: string | null;
  selectedJob: string | null;
  displayCount: number;
  onViewJobDetails: (job: Job) => void;
  onViewMatches: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onSetDisplayCount: (count: number) => void;
  onSetSelectedJob: (jobId: string | null) => void;
  onFilterDialogOpen: () => void;
  onDeleteDialogOpen: (jobId: string) => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
  }
}));

const JobCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: '16px',
  border: '1px solid rgba(15, 23, 42, 0.06)',
  boxShadow: '0 12px 24px rgba(2,23,36,0.06)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 16px 32px rgba(2,23,36,0.1)'
  }
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MyJobPosts Component
 * 
 * Displays the company's job posts with search, sort, and management capabilities
 */
const MyJobPosts: React.FC<MyJobPostsProps> = ({
  myJobs,
  isLoadingJobs,
  jobsError,
  selectedJob,
  displayCount,
  onViewJobDetails,
  onViewMatches,
  onDeleteJob,
  onSetDisplayCount,
  onSetSelectedJob,
  onFilterDialogOpen,
  onDeleteDialogOpen
}) => {
  const router = useRouter();

  const renderJobPosts = () => (
    <StyledCard sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" sx={{ color: 'black', fontWeight: 800, letterSpacing: 0.2 }}>
          My Job Posts
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search jobs..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
              )
            }}
            sx={{
              minWidth: { xs: '100%', sm: 260 },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px'
              }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            sx={{
              borderColor: 'rgba(0,0,0,0.12)',
              color: '#0f172a',
              background: 'white',
              borderRadius: '12px',
              '&:hover': {
                borderColor: 'rgba(0,0,0,0.2)',
                background: 'white'
              }
            }}
          >
            Sort
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/posts/create')}
            sx={{
              background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
              color: '#0f172a',
              fontWeight: 800,
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(90deg, #00FFC3, #02E2FF)'
              }
            }}
          >
            Post New Job
          </Button>
        </Box>
      </Box>

      {isLoadingJobs ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      ) : jobsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>{jobsError}</Alert>
      ) : myJobs.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No job posts found.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          {myJobs.slice(0, displayCount).map((job: Job) => {
            const steps = job?.post_Steps
              ?.filter((step: any) => step.postId === job._id)
              .sort((a: any, b: any) => a.order - b.order) || [];

            return (
              <Box
                key={job._id}
                sx={{
                  width: '100%',
                  display: 'flex',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: '0 12px 24px rgba(2,23,36,0.06)',
                  borderRadius: '16px',
                  border: '1px solid rgba(15, 23, 42, 0.06)'
                }}
              >
                <JobCard
                  sx={{
                    width: '100%',
                    maxWidth: '100%',
                    flex: '1 1 100%',
                    p: 2.5
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon sx={{ color: 'rgba(0, 255, 157, 1)', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800 }}>
                        {job.jobDetails.title}
                      </Typography>
                    </Box>
                    {job.createdAt && (
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, ml: 2 }}>
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>

                  {/* Meta Chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Chip
                      icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
                      label={job.jobDetails.location}
                      size="small"
                      sx={{ backgroundColor: 'rgba(0, 255, 157, 0.15)', color: '#0f172a', fontWeight: 700, border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                    <Chip
                      label={job.jobDetails.employmentType}
                      size="small"
                      sx={{ backgroundColor: 'rgba(2, 226, 255, 0.12)', color: '#0f172a', fontWeight: 700, border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                    <Chip
                      label={`${job.jobDetails.salary.currency}${job.jobDetails.salary.min}-${job.jobDetails.salary.max}`}
                      size="small"
                      sx={{ backgroundColor: 'rgba(0,255,157,0.12)', color: '#0f172a', fontWeight: 700, border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#0f172a',
                      mb: 2.5,
                      minHeight: 40,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                    title={job.jobDetails.description}
                  >
                    {job.jobDetails.description}
                  </Typography>

                  {/* Skills */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {(job.skillAnalysis?.requiredSkills ?? []).slice(0, 4).map((skill: any, idx: number) => (
                      <Chip
                        key={idx}
                        label={skill.name}
                        size="small"
                        icon={<StarIcon sx={{ color: '#00FFC3', fontSize: 18 }} />}
                        sx={{
                          backgroundColor: 'rgba(0, 255, 157, 0.15)',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '0.87rem',
                          letterSpacing: 0.2,
                          px: 1
                        }}
                      />
                    ))}
                  </Box>
                  
                  {/* Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid rgba(2,226,255,0.08)'
                    }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => onViewJobDetails(job)}
                      sx={{
                        background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
                        color: '#0f172a',
                        fontWeight: 800,
                        borderRadius: '10px',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #00FFC3, #02E2FF)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        onSetSelectedJob(job._id);
                        onFilterDialogOpen();
                      }}
                      sx={{
                        borderColor: 'rgba(0,0,0,0.1)',
                        color: '#0f172a',
                        background: 'white',
                        fontWeight: 800,
                        borderRadius: '10px',
                        '&:hover': {
                          borderColor: 'rgba(0,0,0,0.2)',
                          backgroundColor: '#fff'
                        }
                      }}
                    >
                      View Matches
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: '#ff3b30',
                        color: '#ff3b30',
                        fontWeight: 700,
                        borderRadius: '10px',
                        textTransform: 'none',
                        letterSpacing: 0.5,
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#ff3b30',
                          background: 'rgba(255,59,48,0.08)'
                        }
                      }}
                      onClick={() => onDeleteDialogOpen(job._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </JobCard>
              </Box>
            );
          })}

          {myJobs.length > displayCount && (
            <Button
              variant="contained"
              endIcon={<ExpandMoreIcon />}
              onClick={() => onSetDisplayCount(displayCount + 3)}
              sx={{
                mt: 2.5,
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
                color: '#0f172a',
                fontWeight: 800,
                boxShadow: '0 8px 20px rgba(0, 255, 195, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #00FFC3, #02E2FF)',
                  boxShadow: '0 12px 28px rgba(0, 255, 195, 0.3)'
                }
              }}
            >
              Show More
            </Button>
          )}
        </Box>
      )}
    </StyledCard>
  );

  const renderMatchingCandidates = () => (
    <StyledCard>
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
            onClick={() => onSetSelectedJob(null)}
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
      {/* This will be rendered by the parent component */}
      <Box sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Matching candidates will be displayed here
        </Typography>
      </Box>
    </StyledCard>
  );

  return (
    <Box sx={{ flex: 2 }}>
      {!selectedJob ? renderJobPosts() : renderMatchingCandidates()}
    </Box>
  );
};

export default MyJobPosts;
