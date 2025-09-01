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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  Paper,
  MenuItem,
  Tooltip,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
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
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchBids, placeBid } from '@/store/slices/bidSlice';
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

// Update the JobPost interface
interface JobPost {
  jobDetails: {
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: string;
    employmentType: string;
    experienceLevel: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  skillAnalysis: {
    requiredSkills: Array<{
      name: string;
      level: string;
      importance: string;
      category: string;
      experienceLevel: string;
    }>;
    suggestedSkills: {
      technical: Array<{
        name: string;
        reason: string;
        category: string;
        priority: string;
      }>;
      frameworks: Array<{
        name: string;
        relatedTo: string;
        priority: string;
      }>;
      tools: Array<{
        name: string;
        purpose: string;
        category: string;
      }>;
    };
    skillSummary: {
      mainTechnologies: string[];
      complementarySkills: string[];
      learningPath: string[];
      stackComplexity: string;
    };
  };
  linkedinPost: {
    formattedContent: {
      headline: string;
      introduction: string;
      companyPitch: string;
      roleOverview: string;
      keyPoints: string[];
      skillsRequired: string;
      benefitsSection: string;
      callToAction: string;
    };
    hashtags: string[];
    formatting: {
      emojis: {
        company: string;
        location: string;
        salary: string;
        requirements: string;
        skills: string;
        benefits: string;
        apply: string;
      };
    };
    finalPost: string;
  };
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
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
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
  const renderFilterDialog = () => (
    <Dialog
      open={filterDialog}
      onClose={() => setFilterDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'white',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        color: '#000000'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#000000' }}>Filter by Job</Typography>
          <IconButton
            onClick={() => setFilterDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#000000' }}>
          Select Job
        </Typography>
        {isLoadingJobs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} sx={{ color: '#000000' }} />
          </Box>
        ) : jobsError ? (
          <Alert severity="error" sx={{
            backgroundColor: 'rgba(211,47,47,0.1)',
            color: '#ff8a80',
            border: '1px solid rgba(211,47,47,0.3)',
            '& .MuiAlert-icon': {
              color: '#ff8a80'
            }
          }}>
            {jobsError}
          </Alert>
        ) : (
          <TextField
            select
            fullWidth
            value={selectedJob}
            onChange={handleJobChange}
            sx={{
              color: 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              },
              backgroundColor: 'white',
              '& .MuiSelect-select': {
                color: 'black'
              },
              '& .MuiInputLabel-root': {
                color: 'black'
              }
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    backgroundColor: 'white',
                    '& .MuiMenuItem-root': {
                      color: 'black',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 157, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 255, 157, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 255, 157, 0.3)',
                        }
                      }
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="">All Jobs</MenuItem>
            {myJobs.map((job) => (
              <MenuItem key={job._id} value={job._id} sx={{ backgroundColor: 'white' }}>
                {job.jobDetails.title}
              </MenuItem>
            ))}
          </TextField>
        )}
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Button
          onClick={() => {
            setSelectedJob('');
            setFilterDialog(false);
          }}
          sx={{
            borderColor: 'black',
            color: 'black',
            '&:hover': {
              borderColor: 'rgba(0, 255, 157, 1)',
              background: 'rgba(0, 255, 157, 0.08)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleFilterApply}
          sx={{
            background: 'rgba(0, 255, 157, 1)',
            '&:hover': {
              background: 'rgba(0, 255, 157, 1)',
            }
          }}
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );



  // Update the renderMatchingProfiles function
  const renderMatchingProfiles = () => {
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
            onClick={() => handleFilterApply()}
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
              onClick={() => setSelectedJob('')}
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
              onClick={() => router.push('/posts/create')}
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
                    onClick={() => handleBidDialogOpen(candidate)}
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
              onClick={() => setDisplayCount(prev => prev + 3)}
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
    setBidAmount('');
  };

  const handleBidSubmit = async () => {
    try {
      if (!selectedCandidate || !bidAmount) return;
      setIsSubmittingBid(true);
      const params = {
        newBid: Number(bidAmount),
        userId: selectedCandidate.candidateId._id,
        postId: selectedJob
      };
      await dispatch(placeBid(params)).unwrap();
      handleBidDialogClose();
      toast.success("Bid submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error: any) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setIsSubmittingBid(false);
    }
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
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            color: '#191919',
            boxShadow: '0 4px 24px 0 rgba(124,77,255,0.10)',
            mb: 3,
            borderRadius: 3,
            backdropFilter: 'blur(16px)',
            width: 'unset',
            mx: { xs: 1, sm: 4 },
            mt: 2,
            px: { xs: 1, sm: 3 },
            py: 1,
          }}
        >
          <Toolbar
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: { xs: 56, sm: 72 },
              px: '0 !important',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/logo.svg"
                alt="TalentAI Logo"
                sx={{ height: { xs: 28, sm: 32 }, mr: 1, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.07)' } }}
                onClick={() => router.push('/')}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                  color: '#7C4DFF',
                  textShadow: '0 2px 8px #7C4DFF11',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Company Dashboard
              </Typography>
            </Box>
            {profile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Avatar
                  sx={{
                    bgcolor: 'linear-gradient(135deg, #7C4DFF 60%, #00B8D4 100%)',
                    color: '#fff',
                    width: 44,
                    height: 44,
                    fontWeight: 700,
                    fontSize: 22,
                    boxShadow: '0 2px 8px #7C4DFF22',
                    border: '2px solid #fff',
                  }}
                >
                  {profile.userId?.username?.[0] || profile.userId?.email?.[0] || 'U'}
                </Avatar>
                {!isMobile && (
                  <>
                    <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', fontSize: 17, lineHeight: 1.1 }}>
                        {profile.userId?.username || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                        {profile.userId?.email}
                      </Typography>
                    </Box>
                    <Box sx={{ mx: 1, height: 36, borderLeft: '1.5px solid #E0E0E0' }} />
                  </>
                )}
                {isMobile ? (
                  <IconButton
                    onClick={handleLogout}
                    sx={{
                      background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
                      color: '#fff',
                      width: 44, height: 44,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)',
                      }
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    sx={{
                      background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      boxShadow: '0 2px 8px #00B8D422',
                      textTransform: 'none',
                      fontSize: 16,
                      letterSpacing: 0.2,
                      transition: 'background 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)',
                        boxShadow: '0 4px 16px #00B8D433',
                      },
                    }}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </AppBar>
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
          {renderFilterDialog()}
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
                  {renderMatchingProfiles()}
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

          <Dialog
            open={editSkillsDialog}
            onClose={() => setEditSkillsDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)'
              }
            }}
          >
            <DialogTitle sx={{
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              pb: 2,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Required Skills</Typography>
              <IconButton
                onClick={() => setEditSkillsDialog(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'rgba(255,255,255,0.8)'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Add Required Skills


              </Typography>
              <TextField
                fullWidth
                placeholder="Enter skills (comma separated)"
                variant="outlined"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                  }
                }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Required Experience Level
              </Typography>
              <TextField
                fullWidth
                select
                SelectProps={{
                  native: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                <option value="">Select Level</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Junior+">Junior+</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Expert">Expert</option>
              </TextField>
            </DialogContent>
            <DialogActions sx={{
              p: 3,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            }}>
              <Button
                onClick={() => setEditSkillsDialog(false)}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
              {/* <Button
                variant="contained"
                onClick={() => setEditSkillsDialog(false)}
                sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  }
                }}
              >
                Save Changes
              </Button> */}
            </DialogActions>
          </Dialog>

          {/* My Job Posts Section */}

          <Dialog
            open={deleteDialogOpen}
            onClose={handleCancelDelete}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(255,59,48,0.10)',
                p: 0
              }
            }}
          >
            <DialogTitle
              sx={{
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: '#ff3b30',
                fontSize: '1.2rem',
                fontWeight: 700,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'white',
              }}
            >
              <ErrorIcon sx={{ color: 'red', fontSize: 28 }} />
              Are you sure you want to delete this job post?
            </DialogTitle>
            <DialogContent sx={{
              background: 'white',
              color: '#fff',
              py: 3,
              px: 3,
              fontSize: '1rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Typography sx={{ color: 'black' }}>
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{
              px: 3,
              py: 2,
              background: 'white',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Button onClick={handleCancelDelete} disabled={isDeleting}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteJob(jobToDelete)}
                color="error"
                variant="contained"
                disabled={isDeleting}
                sx={{
                  background: 'linear-gradient(135deg, #ff3b30 0%, #ff8a65 100%)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff3b30 0%, #ff8a65 100%)',
                    opacity: 0.9
                  },
                  minWidth: 100
                }}
                startIcon={<DeleteIcon />}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Bid Dialog */}
          <Dialog
            open={bidDialogOpen}
            onClose={handleBidDialogClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: 'white',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
              }
            }}
          >
            <DialogTitle sx={{
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              color: 'black'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Place Bid</Typography>
                <IconButton
                  onClick={handleBidDialogClose}
                  sx={{ color: 'black' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    p: 2.5,
                    border: '1px solid black',
                    display: "flex",
                    justifyContent: "space-between"
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(2,226,255,0.2) 0%, rgba(0,255,195,0.2) 100%)',
                        display: 'flex',
                        alignItems: 'center',

                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: 'black'
                      }}>
                        {selectedCandidate?.candidateId?.username?.charAt(0).toUpperCase() || '?'}
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography sx={{ color: 'black', fontWeight: 600, fontSize: '1.1rem' }}>
                            {selectedCandidate?.candidateId?.username}
                          </Typography>
                          {selectedCandidate?.candidateId?.isVerified && (
                            <Box sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: '#4ade80',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <StarIcon sx={{ fontSize: 12, color: 'black' }} />
                            </Box>
                          )}
                        </Box>
                        {/* <Typography sx={{
                          color: 'black',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          <WorkIcon sx={{ fontSize: 16 }} />
                          {selectedCandidate?.candidateId?.role}
                        </Typography> */}
                      </Box>
                    </Box>
                    <Box sx={{
                      background: 'linear-gradient(135deg, rgba(2,226,255,0.1) 0%, rgba(0,255,195,0.1) 100%)',
                      padding: '8px',
                      borderRadius: '8px',
                      minWidth: '70px',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: 'black',
                        fontSize: '1.25rem',
                        lineHeight: 1
                      }}>
                        {selectedCandidate?.finalBid} $
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: 'black',
                        fontSize: '0.7rem'
                      }}>
                        Current Bid
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <TextField
                  label="Bid Amount"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                  InputLabelProps={{ sx: { color: 'black' } }}
                  sx={{
                    color: 'black',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'black',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'black'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'black',
                    },
                    '& .MuiInputBase-input': {
                      color: 'black',
                    },
                    '& .MuiInputAdornment-root .MuiTypography-root': {
                      color: 'black',
                    },
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{
              p: 3,
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Button
                onClick={handleBidDialogClose}
                sx={{
                  color: 'black',
                  mr: 1
                }}
                disabled={isSubmittingBid}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleBidSubmit}
                disabled={!bidAmount || parseFloat(bidAmount) <= 0 || isSubmittingBid}
                sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  color: 'black',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  },
                  '&.Mui-disabled': {
                    background: 'grey',
                    color: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                {isSubmittingBid ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                    Submitting...
                  </>
                ) : (
                  'Submit Bid'
                )}
              </Button>
            </DialogActions>
          </Dialog>

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