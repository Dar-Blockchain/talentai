import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Close as CloseIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

// Styled Components
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
  background: 'white',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(2,226,255,0.15)',
  boxShadow: '0 4px 20px rgba(2,226,255,0.10)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  width: '100%',
  maxWidth: 400,
  flex: '1 1 340px',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    minWidth: 0,
    padding: theme.spacing(2),
  },
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 8px 32px rgba(2,226,255,0.18)',
    border: '1.5px solid #02E2FF',
  },
}));

interface MyJobPostsProps {
  myJobs: any[];
  isLoadingJobs: boolean;
  jobsError: string | null;
  displayCount: number;
  onViewMatches: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onLoadMore: () => void;
  onCreateNewJob: () => void;
}

const MyJobPosts: React.FC<MyJobPostsProps> = ({
  myJobs,
  isLoadingJobs,
  jobsError,
  displayCount,
  onViewMatches,
  onDeleteJob,
  onLoadMore,
  onCreateNewJob,
}) => {
  // Add state for job details modal
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);

  // Add handlers for job details modal
  const handleViewJobDetails = (job: any) => {
    setSelectedJobForDetails(job);
    setJobDetailsModalOpen(true);
  };

  const handleCloseJobDetailsModal = () => {
    setJobDetailsModalOpen(false);
    setSelectedJobForDetails(null);
  };

  return (
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
            onClick={onCreateNewJob}
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
          {myJobs.slice(0, displayCount).map((job: any) => {
            const steps = job?.post_Steps
              .filter((step: any) => step.postId === job._id)
              .sort((a: any, b: any) => a.order - b.order)

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
                      onClick={() => handleViewJobDetails(job)}
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
                      onClick={() => onViewMatches(job._id)}
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
                      onClick={() => onDeleteJob(job._id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </JobCard>
              </Box>
            )
          })}

          {myJobs.length > displayCount && (
            <Button
              variant="contained"
              endIcon={<ExpandMoreIcon />}
              onClick={onLoadMore}
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

      {/* Job Details Modal */}
      <Dialog open={jobDetailsModalOpen} onClose={handleCloseJobDetailsModal} maxWidth="md" fullWidth>
        <DialogTitle>{selectedJobForDetails?.jobDetails?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>Job Details</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1"><strong>Title:</strong> {selectedJobForDetails?.jobDetails?.title}</Typography>
            <Typography variant="body1"><strong>Description:</strong> {selectedJobForDetails?.jobDetails?.description}</Typography>
            <Typography variant="body1"><strong>Location:</strong> {selectedJobForDetails?.jobDetails?.location}</Typography>
            <Typography variant="body1"><strong>Employment Type:</strong> {selectedJobForDetails?.jobDetails?.employmentType}</Typography>
            <Typography variant="body1"><strong>Salary:</strong> {selectedJobForDetails?.jobDetails?.salary?.currency}{selectedJobForDetails?.jobDetails?.salary?.min}-{selectedJobForDetails?.jobDetails?.salary?.max}</Typography>
            <Typography variant="body1"><strong>Created At:</strong> {new Date(selectedJobForDetails?.createdAt).toLocaleDateString()}</Typography>
          </Box>

          <Typography variant="h6" gutterBottom mt={3}>Required Skills</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(selectedJobForDetails?.skillAnalysis?.requiredSkills ?? []).map((skill: any, idx: number) => (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobDetailsModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
};

export default MyJobPosts;
