import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile, clearProfile } from '@/store/slices/profileSlice';
import {
  logout
} from "@/store/slices/authSlice";
import { AppDispatch, RootState } from '@/store/store';
import { 
  Box,
  Container,
  Typography,
  Card,
  Chip,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  TextField,

  Tooltip,
  InputAdornment,
  AppBar,
  Toolbar,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from 'next/router';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';
import WorkIcon from '@mui/icons-material/Work';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { signOut } from 'next-auth/react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchBids } from '@/store/slices/bidSlice';
import CheckIcon from '@mui/icons-material/Check';
import { motion } from 'framer-motion';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompanyOnly from '@/components/CompanyOnly';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompanyProfilesAssessments from '@/components/dashboard-company/CompanyProfilesAssessments';
import BidHistory from '@/components/dashboard-company/BidHistory';
import CompanyInfoHeader from '@/components/dashboard-company/CompanyInfoHeader';
import JobDetailsModal from '@/components/dashboard-company/JobDetailsModal';
import JobPostSuccessDialog from '@/components/dashboard-company/JobPostSuccessDialog';
import AddBidDialog from '@/components/dashboard-company/AddBidDialog';
import DeleteJobPostDialog from '@/components/dashboard-company/DeleteJobPostDialog';
import EditSkillsDialog from '@/components/dashboard-company/EditSkillsDialog';
import FilterDialog from '@/components/dashboard-company/FilterDialog';
import MatchingProfiles from '@/components/dashboard-company/MatchingProfiles';
import Navbar from '@/components/dashboard-company/Navbar';

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

const DashboardCompany = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector(selectProfile);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [editSkillsDialog, setEditSkillsDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [matchingProfiles, setMatchingProfiles] = useState<MatchingCandidate[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(3); // Change initial display count to 3
  const [linkedinWarningOpen, setLinkedinWarningOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const { data, status, error } = useSelector((state: RootState) => state.bid.bids);
  const [postedJobId, setPostedJobId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [jobToDelete, setJobToDelete] = useState<string>('');
  // Add new state for company profiles
  const [companyProfiles, setCompanyProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  // Add new state for selected assessment
  const [localRequiredSkills, setLocalRequiredSkills] = useState(profile?.requiredSkills || []);
  
  // Add state for job details modal
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);

  const handleFilterApply = async () => {
    if (!selectedJob) {
      setFilterDialog(false);
      return;
    }

    try {
      setIsLoadingMatches(true);
      setMatchError(null);
      const token = Cookies.get('api_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}matching/jobs/${selectedJob}/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matching candidates');
      }

      const data = await response.json();
      console.log('Matching candidates response:', data);
      if (data.success && data.matches) {
        setMatchingProfiles(data.matches);
      } else {
        setMatchingProfiles([]);
      }
    } catch (error) {
      setMatchError(error instanceof Error ? error.message : 'Failed to fetch matches');
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoadingMatches(false);
      setFilterDialog(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Close the menu first
      setAnchorEl(null);

      // First clear the token from both localStorage and cookies
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });

      // Then clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Clear Redux state
      dispatch(clearProfile());
      dispatch(logout());

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(fetchBids())
  }, [dispatch]);


  // Add function to fetch job posts
  const fetchMyJobs = async () => {
    const token = Cookies.get('api_token');
    setIsLoadingJobs(true);
    setJobsError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}post/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setMyJobs(data.data || []);
    } catch (error) {
      setJobsError(error instanceof Error ? error.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Add handler for job selection
  const handleJobChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedJob(event.target.value);
  };

  // Update the filter dialog open handler
  const handleFilterDialogOpen = () => {
    setFilterDialog(true);
    fetchMyJobs(); // Fetch jobs when dialog opens
  };
  useEffect(() => {
    fetchMyJobs();
  }, []);



    // MatchingProfiles component handles this now

  const handleDeleteJob = async (jobId: string) => {
    setIsDeleting(true);
    try {
      const token = Cookies.get('api_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}post/deletePost/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchMyJobs();
        setDeleteDialogOpen(false);
        setJobToDelete('');
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setJobToDelete('');
  };

  // Add handler for bid dialog
  const handleBidDialogOpen = (candidate: any) => {
    setSelectedCandidate(candidate);
    setBidDialogOpen(true);
  };

  const handleBidDialogClose = () => {
    setBidDialogOpen(false);
    setSelectedCandidate(null);
  };



  // Add function to fetch company profiles
  const fetchCompanyProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      setProfilesError(null);
      const token = localStorage.getItem('api_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getCompanyWithAssessments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company profiles');
      }

      const data = await response.json();
      setCompanyProfiles(data);
    } catch (error) {
      setProfilesError('Failed to fetch company profiles');
      console.error('Error fetching company profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Add useEffect to fetch profiles when component mounts
  useEffect(() => {
    // Only fetch company profiles if user is a company
    if (profile && (profile.userId.role === 'Company' || profile.userId.role === 'company')) {
      fetchCompanyProfiles();
    }
  }, [profile]);


  useEffect(() => {
    setLocalRequiredSkills(profile?.requiredSkills || []);
  }, [profile]);

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
    <CompanyOnly>
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: 'white',

        py: 2,
      }}>
        {/* Navbar */}
        <Navbar profile={profile} onLogout={handleLogout} />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Container maxWidth="lg">
          {/* Filter Dialog */}
          <FilterDialog
            open={filterDialog}
            onClose={() => setFilterDialog(false)}
            selectedJob={selectedJob}
            onJobChange={handleJobChange}
            onApplyFilter={handleFilterApply}
            onCancel={() => {
              setSelectedJob('');
              setFilterDialog(false);
            }}
            jobs={myJobs}
            isLoadingJobs={isLoadingJobs}
            jobsError={jobsError}
          />
          <CompanyInfoHeader
            profile={profile}
            localRequiredSkills={localRequiredSkills}
          />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

            <Box sx={{ flex: 2 }}>
              {!selectedJob ? (
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
                                  onClick={() => {
                                    setSelectedJob(job._id)
                                    handleFilterDialogOpen()
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
                                  onClick={() => {
                                    setJobToDelete(job._id)
                                    setDeleteDialogOpen(true)
                                  }}
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
                          onClick={() => setDisplayCount((prev: number) => prev + 3)}
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
              ) : (
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
                        onClick={() => setSelectedJob('')}
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
                  <MatchingProfiles
                    matchingProfiles={matchingProfiles}
                    isLoadingMatches={isLoadingMatches}
                    matchError={matchError}
                    displayCount={displayCount}
                    selectedJob={selectedJob}
                    onRetry={handleFilterApply}
                    onBackToJobs={() => setSelectedJob('')}
                    onCreateNewJob={() => router.push('/posts/create')}
                    onLoadMore={() => setDisplayCount(prev => prev + 3)}
                    onBidDialogOpen={handleBidDialogOpen}
                  />
                </StyledCard>
              )}
            </Box>
          </Box>

          {/* Bid History Section */}
          <BidHistory
            bids={data}
            status={status}
            error={error}
            onPostNewJob={() => router.push('/posts/create')}
          />

          {/* Delete Job Post Dialog */}
          <DeleteJobPostDialog
            open={deleteDialogOpen}
            onClose={handleCancelDelete}
            onDelete={() => handleDeleteJob(jobToDelete)}
            isDeleting={isDeleting}
          />

          {/* Add Bid Dialog */}
          <AddBidDialog
            open={bidDialogOpen}
            onClose={handleBidDialogClose}
            selectedCandidate={selectedCandidate}
            selectedJob={selectedJob}
          />

          {/* Job Details Modal */}
          <JobDetailsModal
            open={jobDetailsModalOpen}
            onClose={handleCloseJobDetailsModal}
            selectedJobForDetails={selectedJobForDetails}
          />

          {/* Company Profiles & Assessments Section */}
          <CompanyProfilesAssessments
            companyProfiles={companyProfiles}
            isLoadingProfiles={isLoadingProfiles}
            profilesError={profilesError}
          />
        </Container>
      </Box>
    </CompanyOnly>
  );
}

export default DashboardCompany;