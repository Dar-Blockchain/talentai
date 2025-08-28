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
  LinearProgress,
  TextField,
  Paper,
  MenuItem,
  Tooltip,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import CategoryIcon from '@mui/icons-material/Category';
import { useRouter } from 'next/router';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CompanyOnly from '@/components/CompanyOnly';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// At the top of your file, after imports
const GREEN_MAIN = 'rgba(0, 255, 157, 1)';

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

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'black',
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '0',
    width: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
    borderRadius: '2px'
  }
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  color: '#000000',
  padding: theme.spacing(4, 2),
  borderRadius: '32px',
  marginBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.06)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'radial-gradient(circle at top right, rgba(0, 0, 0, 0.03) 0%, transparent 70%)',
    zIndex: 1,
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(6, 4),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8),
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3)
}));

const StatCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
  padding: theme.spacing(3),
  borderRadius: Number(theme.shape.borderRadius) * 3,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05), 0 1px 6px rgba(0, 0, 0, 0.04)',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)',
  },
}));

const IconCircle = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #7C4DFF22 0%, #00B8D422 100%)',
  border: `1px solid ${theme.palette.divider}`,
}));

const HeaderBadge = styled(Chip)(({ theme }) => ({
  borderRadius: 999,
  fontWeight: 600,
  height: 28,
  '& .MuiChip-label': { px: 1.5 },
  background: 'rgba(2, 226, 255, 0.08)',
  border: '1px solid rgba(2, 226, 255, 0.15)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 800,
  borderRadius: 999,
  padding: '10px 18px',
  height: 42,
  background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
  color: '#0f172a',
  letterSpacing: 0.2,
  boxShadow: '0 6px 18px rgba(2,226,255,0.3)',
  border: '1px solid rgba(255,255,255,0.35)',
  backdropFilter: 'blur(6px)',
  '&:hover': {
    background: 'linear-gradient(90deg, rgba(2,226,255,0.92) 0%, rgba(0,255,195,0.92) 100%)',
    boxShadow: '0 10px 24px rgba(2,226,255,0.35)',
    transform: 'translateY(-1px)'
  },
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '12px',
  padding: theme.spacing(1.2),
  height: 36,
  background: 'rgba(2, 226, 255, 0.08)',
  color: '#111827',
  border: '1px solid rgba(2, 226, 255, 0.15)',
  fontWeight: 600,
  letterSpacing: 0.2,
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(2, 226, 255, 0.15)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(2,226,255,0.10)'
  },
  '& .MuiChip-icon': {
    color: '#00B8D4',
  },
  '& .MuiChip-deleteIcon': {
    color: '#ef4444',
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

// Add interface for bid history
interface BidHistoryItem {
  candidate: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  status: 'win' | 'lose';
  bidAmount: number;
  jobTitle: string;
  createdAt: string;
}

const DashboardCompany = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector(selectProfile);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [editSkillsDialog, setEditSkillsDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matchingProfiles, setMatchingProfiles] = useState<MatchingCandidate[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [generatedJob, setGeneratedJob] = useState<JobPost | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasSharedToLinkedIn, setHasSharedToLinkedIn] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(3); // Change initial display count to 3
  const [linkedinWarningOpen, setLinkedinWarningOpen] = useState(false);
  const [salaryRange, setSalaryRange] = useState({
    min: 0,
    max: 0,
    currency: '$'
  });
  const [isSaving, setIsSaving] = useState(false);
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
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<any>(null);
  const [localRequiredSkills, setLocalRequiredSkills] = useState(profile?.requiredSkills || []);
  const [displayedAssessments, setDisplayedAssessments] = useState(10);
  const [newSkillLevel, setNewSkillLevel] = useState("3");
  // UI controls for Company Profiles & Assessments section
  const [assessmentSearch, setAssessmentSearch] = useState('');
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState('all'); // all | match | no match
  const [assessmentSort, setAssessmentSort] = useState('date_desc'); // date_desc | date_asc | score_desc | score_asc | candidate_asc | candidate_desc | job_asc | job_desc
  const [assessmentView, setAssessmentView] = useState<'table' | 'cards'>('table');
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  const [updatedJobData, setUpdatedJobData] = useState<JobPost | undefined>(undefined);
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

  // Update the renderBidHistory function
  const renderBidHistory = () => (
    <StyledCard sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <SectionTitle sx={{ mb: 0 }}>Bid History</SectionTitle>
        {data.length > 0 && (
          <Chip
            label={`${data.length} bids`}
            size="small"
            sx={{
              background: 'rgba(2, 226, 255, 0.12)',
              color: '#0f172a',
              fontWeight: 700,
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          />
        )}
      </Box>
      {status === "loading" ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      ) : status === "failed" ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : data.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 6,
          px: 2,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(2,226,255,0.06) 0%, rgba(0,255,195,0.06) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(15,23,42,0.06)'
        }}>
          <Box sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(2,226,255,0.15), rgba(0,255,195,0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.06)'
          }}>
            <PersonSearchIcon sx={{ color: GREEN_MAIN, fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 800 }}>
            No bid history yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 520 }}>
            Once you place bids on candidates who match your job posts, they will appear here. View matches from your job posts to place a bid.
          </Typography>
          <Button
            variant="contained"
            startIcon={<WorkIcon />}
            onClick={() => router.push('/posts/create')}
            sx={{
              mt: 1,
              background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
              color: '#0f172a',
              fontWeight: 800,
              borderRadius: '12px',
              px: 2.5,
              '&:hover': {
                background: 'linear-gradient(90deg, #00FFC3, #02E2FF)'
              }
            }}
          >
            Post New Job
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((bid: any) => (
            <Box
              key={bid?._id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                p: 2,
                boxShadow: '0 8px 20px rgba(2,23,36,0.06)',
                border: '1px solid rgba(15,23,42,0.06)'
              }}
            >
              <Box>
                <Typography sx={{ color: '#0f172a', fontWeight: 700 }}>{bid?.userInfo?.username}</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>{bid?.userInfo?.email}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<WorkIcon sx={{ fontSize: 16 }} />}
                    label={bid?.post?.jobDetails?.title || '—'}
                    size="small"
                    sx={{ background: 'rgba(2, 226, 255, 0.12)', color: '#0f172a', fontWeight: 700, border: '1px solid rgba(0,0,0,0.08)' }}
                  />
                  {bid?.status && (
                    <Chip
                      label={bid.status === 'win' ? 'Won' : 'Lost'}
                      size="small"
                      sx={{
                        background: bid.status === 'win' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: '#0f172a',
                        fontWeight: 800,
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 800, justifySelf: 'end' }}>
                ${bid?.finalBid}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', justifySelf: 'end' }}>
                {new Date(bid?.dateBid).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </StyledCard>
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

  // Add a function to handle closing the LinkedIn warning dialog
  const handleCloseLinkedinWarning = () => {
    setLinkedinWarningOpen(false);
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

  // Add function to render company profiles table
  const renderCompanyProfilesTable = () => {
    if (isLoadingProfiles) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      );
    }

    if (profilesError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>{profilesError}</Alert>
      );
    }

    if (!companyProfiles || companyProfiles.length === 0) {
      return (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 3,
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid rgba(2,226,255,0.1)',
          textAlign: 'center'
        }}>
          <BusinessIcon sx={{ fontSize: 48, color: '#02E2FF', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700, mb: 1 }}>
            No Assessments Found
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', maxWidth: '400px' }}>
            There are no assessments available at the moment.
          </Typography>
        </Box>
      );
    }

    // Apply search, filter, and sort
    const normalizedSearch = assessmentSearch.toLowerCase().trim();
    const filteredAssessments = companyProfiles.filter((assessment: any) => {
      const candidateName = assessment?.condidateId?.userId?.username?.toLowerCase?.() || '';
      const jobTitle = assessment?.jobId?.jobDetails?.title?.toLowerCase?.() || '';
      const matchesSearch = !normalizedSearch || candidateName.includes(normalizedSearch) || jobTitle.includes(normalizedSearch);
      const status = assessment?.analysis?.jobMatch?.status || '';
      const matchesStatus = assessmentStatusFilter === 'all' || status === assessmentStatusFilter;
      return matchesSearch && matchesStatus;
    });

    const sortedAssessments = [...filteredAssessments].sort((a: any, b: any) => {
      const scoreA = Number(a?.analysis?.overallScore) || 0;
      const scoreB = Number(b?.analysis?.overallScore) || 0;
      const nameA = (a?.condidateId?.userId?.username || '').toLowerCase();
      const nameB = (b?.condidateId?.userId?.username || '').toLowerCase();
      const jobA = (a?.jobId?.jobDetails?.title || '').toLowerCase();
      const jobB = (b?.jobId?.jobDetails?.title || '').toLowerCase();
      const dateA = new Date(a?.timestamp || 0).getTime();
      const dateB = new Date(b?.timestamp || 0).getTime();
      switch (assessmentSort) {
        case 'date_asc':
          return dateA - dateB;
        case 'score_desc':
          return scoreB - scoreA;
        case 'score_asc':
          return scoreA - scoreB;
        case 'candidate_asc':
          return nameA.localeCompare(nameB);
        case 'candidate_desc':
          return nameB.localeCompare(nameA);
        case 'job_asc':
          return jobA.localeCompare(jobB);
        case 'job_desc':
          return jobB.localeCompare(jobA);
        case 'date_desc':
        default:
          return dateB - dateA;
      }
    });

    const visibleAssessments = sortedAssessments.slice(0, displayedAssessments);
    const hasMore = companyProfiles.length > displayedAssessments;

    return (
      <>
        {assessmentView === 'table' ? (
          <TableContainer component={Paper} sx={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Candidate</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Job Title</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Assessment Date</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Overall Score</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Job Match</TableCell>
                  <TableCell sx={{ color: '#000', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleAssessments.map((assessment) => (
                  <TableRow key={assessment._id} sx={{ '&:hover': { backgroundColor: 'rgba(2,226,255,0.05)' } }}>
                    <TableCell sx={{ color: '#000' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ bgcolor: '#00B8D4', color: '#fff', width: 28, height: 28, fontSize: 14, fontWeight: 700 }}>
                          {(assessment?.condidateId?.userId?.username || 'U')?.[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, lineHeight: 1 }}>
                            {assessment.condidateId.userId.username}
                          </Typography>
                          {assessment?.condidateId?.userId?.email && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {assessment.condidateId.userId.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#000' }}>
                      {assessment.jobId.jobDetails.title}
                    </TableCell>
                    <TableCell sx={{ color: '#000' }}>
                      {new Date(assessment.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ color: '#000', minWidth: 160 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, minWidth: 40 }}>{assessment.analysis.overallScore}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Number(assessment.analysis.overallScore) || 0}
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 6,
                            backgroundColor: 'rgba(2,226,255,0.08)',
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)`
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <Chip
                        label={assessment.analysis.jobMatch.status}
                        size="small"
                        sx={{
                          backgroundColor: assessment.analysis.jobMatch.status === 'match'
                            ? 'rgba(0,255,195,0.13)'
                            : 'rgba(255,59,48,0.13)',
                          color: assessment.analysis.jobMatch.status === 'match'
                            ? '#00FFC3'
                            : '#ff3b30',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleViewAssessmentDetails(assessment)}
                        sx={{
                          background: 'linear-gradient(90deg, rgba(0,255,157,1) 0%, rgba(2,226,255,1) 100%)',
                          color: '#0f172a',
                          fontWeight: 800,
                          borderRadius: '999px',
                          px: 2,
                          height: 34,
                          textTransform: 'none',
                          boxShadow: '0 2px 10px rgba(2,226,255,0.25)',
                          transition: 'all .2s ease',
                          '&:hover': {
                            background: 'linear-gradient(90deg, rgba(0,255,157,0.9) 0%, rgba(2,226,255,0.9) 100%)',
                            boxShadow: '0 4px 16px rgba(2,226,255,0.35)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {visibleAssessments.map((assessment: any) => {
              const score = Number(assessment?.analysis?.overallScore) || 0;
              const match = assessment?.analysis?.jobMatch?.status === 'match';
              return (
                <Box key={assessment._id} sx={{ width: { xs: '100%', sm: '50%', md: '33.3333%' } }}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(2,226,255,0.1)', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#00B8D4', color: '#fff', width: 36, height: 36, fontWeight: 700 }}>
                        {(assessment?.condidateId?.userId?.username || 'U')?.[0]}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700 }}>
                          {assessment?.condidateId?.userId?.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                          {assessment?.condidateId?.userId?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#111827', mb: 1 }} noWrap>
                      {assessment?.jobId?.jobDetails?.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={score} size={64} thickness={5} sx={{ color: match ? '#00C48C' : '#7C4DFF' }} />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" sx={{ fontWeight: 700 }}>
                            {score}%
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={match ? <CheckCircleIcon sx={{ fontSize: 18, color: '#00FFC3' }} /> : <ErrorIcon sx={{ fontSize: 18, color: '#ff3b30' }} />}
                        label={match ? 'Job match' : 'No match'}
                        size="small"
                        sx={{
                          pl: 0.5,
                          pr: 1.25,
                          height: 30,
                          borderRadius: '999px',
                          fontWeight: 800,
                          letterSpacing: 0.2,
                          color: match ? '#065f46' : '#7f1d1d',
                          background: match
                            ? 'linear-gradient(90deg, rgba(0,255,195,0.16) 0%, rgba(2,226,255,0.12) 100%)'
                            : 'linear-gradient(90deg, rgba(255,59,48,0.16) 0%, rgba(255,59,48,0.10) 100%)',
                          border: '1px solid',
                          borderColor: match ? 'rgba(0,255,195,0.35)' : 'rgba(255,59,48,0.35)',
                          boxShadow: match
                            ? '0 2px 10px rgba(0,255,195,0.15)'
                            : '0 2px 10px rgba(255,59,48,0.12)'
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleViewAssessmentDetails(assessment)}
                        sx={{
                          background: 'linear-gradient(90deg, rgba(0,255,157,1) 0%, rgba(2,226,255,1) 100%)',
                          color: '#0f172a',
                          fontWeight: 800,
                          borderRadius: '999px',
                          px: 2,
                          height: 34,
                          boxShadow: '0 2px 10px rgba(2,226,255,0.25)',
                          textTransform: 'none',
                          transition: 'all .2s ease',
                          '&:hover': {
                            background: 'linear-gradient(90deg, rgba(0,255,157,0.9) 0%, rgba(2,226,255,0.9) 100%)',
                            boxShadow: '0 4px 16px rgba(2,226,255,0.35)',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        Details
                      </Button>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1.5 }}>
                      {new Date(assessment?.timestamp).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        )}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              endIcon={<ExpandMoreIcon />}
              onClick={() => setDisplayedAssessments(prev => prev + 10)}
              sx={{
                background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)',
                color: '#0f172a',
                fontWeight: 800,
                borderRadius: '999px',
                px: 2.5,
                height: 40,
                textTransform: 'none',
                boxShadow: '0 2px 12px rgba(2,226,255,0.25)',
                transition: 'all .2s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgba(2,226,255,0.9) 0%, rgba(0,255,195,0.9) 100%)',
                  boxShadow: '0 6px 18px rgba(2,226,255,0.35)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              View More
            </Button>
          </Box>
        )}
        {renderAssessmentDetailsModal()}
      </>
    );
  };

  // Add function to handle opening assessment details
  const handleViewAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setAssessmentModalOpen(true);
  };

  // Add function to render assessment details modal
  const renderAssessmentDetailsModal = () => (
    <Dialog
      open={assessmentModalOpen}
      onClose={() => setAssessmentModalOpen(false)}
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
        {selectedAssessment && (
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
                    {(selectedAssessment?.condidateId?.userId?.username || 'U')?.[0]}
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
                      {selectedAssessment?.condidateId?.userId?.username}
                    </Typography>
                    {selectedAssessment?.condidateId?.userId?.email && (
                      <Typography variant="body1" sx={{ 
                        color: '#64748b', 
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }} noWrap>
                        <EmailIcon sx={{ fontSize: 18, color: '#64748b' }} />
                        {selectedAssessment?.condidateId?.userId?.email}
                      </Typography>
                    )}
                    <Typography variant="h6" sx={{ 
                      color: '#02E2FF', 
                      fontWeight: 700,
                      mb: 1
                    }} noWrap>
                      {selectedAssessment?.jobId?.jobDetails?.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <InfoIcon sx={{ fontSize: 16, color: '#00FFC3' }} />
                      Assessment Date: {new Date(selectedAssessment.timestamp).toLocaleDateString('en-US', {
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
                      value={Number(selectedAssessment.analysis.overallScore) || 0} 
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
                        {selectedAssessment.analysis.overallScore}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      label={selectedAssessment.analysis.jobMatch.status}
                      size="medium"
                      sx={{
                        backgroundColor: selectedAssessment.analysis.jobMatch.status === 'match' 
                          ? 'linear-gradient(135deg, rgba(0,255,195,0.9), rgba(0,255,195,0.8))' 
                          : 'linear-gradient(135deg, rgba(255,59,48,0.9), rgba(255,59,48,0.8))',
                        background: selectedAssessment.analysis.jobMatch.status === 'match' 
                          ? 'linear-gradient(135deg, rgba(0,255,195,0.9), rgba(0,255,195,0.8))' 
                          : 'linear-gradient(135deg, rgba(255,59,48,0.9), rgba(255,59,48,0.8))',
                        color: selectedAssessment.analysis.jobMatch.status === 'match' ? '#065f46' : '#7f1d1d',
                        fontWeight: 700,
                        height: 32,
                        fontSize: '0.9rem',
                        borderRadius: '16px',
                        boxShadow: selectedAssessment.analysis.jobMatch.status === 'match'
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
                Candidate Skills ({selectedAssessment.condidateId.skills.length})
              </Typography>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' },
                gap: 2
              }}>
                {selectedAssessment.condidateId.skills.map((skill: any, index: number) => (
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
                    {selectedAssessment.analysis.overallScore}%
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
                    {selectedAssessment.analysis.jobMatch.status === 'match' ? '✓' : '✗'}
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
                Skill Analysis ({selectedAssessment.analysis.skillAnalysis.length} skills)
              </Typography>
              
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' },
                gap: 3
              }}>
                {selectedAssessment.analysis.skillAnalysis.map((skill: any, index: number) => (
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
                Recommendations ({selectedAssessment.analysis.recommendations.length})
              </Typography>
              
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(255,107,107,0.05) 0%, rgba(255,230,109,0.05) 100%)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(255,107,107,0.2)'
              }}>
                <List sx={{ p: 0 }}>
                  {selectedAssessment.analysis.recommendations.map((rec: string, index: number) => (
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
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 4, 
        borderTop: '2px solid rgba(0, 255, 157, 0.15)',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '0 0 28px 28px'
      }}>
        <Button
          onClick={() => setAssessmentModalOpen(false)}
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

          {/* Add the LinkedIn duplicate post warning dialog */}
          <Dialog
            open={linkedinWarningOpen}
            onClose={handleCloseLinkedinWarning}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: '450px'
              }
            }}
          >
            <DialogTitle sx={{
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#02E2FF',
              fontSize: '1.2rem',
              fontWeight: 600,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <InfoIcon sx={{ color: '#02E2FF' }} />
              LinkedIn Sharing Restriction
              <IconButton
                aria-label="close"
                onClick={handleCloseLinkedinWarning}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 2 }}>
              <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
                LinkedIn does not allow posting duplicate content. Please modify your job post or generate a new one before sharing again.
              </Typography>
              <Box sx={{
                p: 2,
                borderRadius: '8px',
                backgroundColor: 'rgba(2,226,255,0.05)',
                border: '1px solid rgba(2,226,255,0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5
              }}>
                <InfoIcon sx={{ color: '#02E2FF', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  This is a LinkedIn platform restriction to prevent spam. Try using the "Quick Generate" or "Detailed Analysis" button to create a different job post.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                onClick={handleCloseLinkedinWarning}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  }
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>

          

          <ProfileHeader>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                mb: 4,
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 4 },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
  <Avatar sx={{ bgcolor: '#00B8D4', color: '#fff', width: 64, height: 64, fontSize: 28, fontWeight: 700 }}>
                    {(profile?.companyDetails?.name || profile?.userId?.username || 'U')?.[0]}
                  </Avatar>
                  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
        {profile?.companyDetails?.name}
      </Typography>
      {profile?.userId?.isVerified && (
        <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 24 }} />
      )}
    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      {profile?.type && (
                        <HeaderBadge label={profile.type} />
                      )}
                      {/* {profile?.userId?.role && (
                        <HeaderBadge label={profile.userId.role} />
                      )} */}
                      {profile?.companyDetails?.location && (
                        <HeaderBadge label={profile.companyDetails.location} />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Verified chip removed in favor of icon next to name */}
                  <GradientButton onClick={() => router.push('/posts/create')} endIcon={<AddIcon />}>
                    Post Job
                  </GradientButton>
                </Box>
              </Box>

              <StatsContainer>
                <StatCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconCircle>
                      <CategoryIcon sx={{ color: '#7C4DFF' }} />
                    </IconCircle>
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.7, color: '#111827' }}>
                        Industry
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        {profile?.companyDetails?.industry || '—'}
                      </Typography>
                    </Box>
                  </Box>
                </StatCard>
                <StatCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconCircle>
                      <GroupsIcon sx={{ color: '#00B8D4' }} />
                    </IconCircle>
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.7, color: '#111827' }}>
                        Company Size
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        {profile?.companyDetails?.size || '—'}
                      </Typography>
                    </Box>
                  </Box>
                </StatCard>
                <StatCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconCircle>
                      <LocationOnIcon sx={{ color: '#22C55E' }} />
                    </IconCircle>
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.7, color: '#111827' }}>
                        Location
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                        {profile?.companyDetails?.location || '—'}
                      </Typography>
                    </Box>
                  </Box>
                </StatCard>
              </StatsContainer>

              {/* Required Skills in Header */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 1.5 }}>
                  Required Skills
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.25,
                  p: 2,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(2,226,255,0.06) 0%, rgba(0,255,195,0.06) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  {localRequiredSkills && localRequiredSkills.length > 0 ? (
                    localRequiredSkills.map((skill, index) => (
                      <SkillChip
                        key={`header-req-skill-${index}`}
                        icon={
                          <Box sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '999px',
                            display: 'grid',
                            placeItems: 'center',
                            background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                            boxShadow: '0 2px 8px rgba(2,226,255,0.35)'
                          }}>
                            <StarIcon sx={{ fontSize: 14, color: '#0f172a' }} />
                          </Box>
                        }
                        label={`${skill}`}
                        sx={{
                          height: 38,
                          px: 1.25,
                          borderRadius: '999px',
                          fontWeight: 800,
                          letterSpacing: 0.2,
                          color: '#0f172a',
                          background: 'linear-gradient( to right bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.6) ) padding-box, linear-gradient(90deg, rgba(0,255,195,0.7), rgba(2,226,255,0.7)) border-box',
                          border: '1px solid transparent',
                          boxShadow: '0 4px 18px rgba(2,226,255,0.12)',
                          backdropFilter: 'blur(6px)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(2,226,255,0.22)'
                          }
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      No required skills added yet.
                    </Typography>
                  )}
                </Box>
                <Box sx={{
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  p: 2,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(2,226,255,0.06) 0%, rgba(0,255,195,0.06) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '999px',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #00FFC3 0%, #02E2FF 100%)',
                      boxShadow: '0 2px 8px rgba(2,226,255,0.35)'
                    }}>
                      <WorkIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ color: '#111827', fontWeight: 800 }}>
                      Required Experience
                    </Typography>
                  </Box>
                  <Chip
                    label={profile?.requiredExperienceLevel || 'Not set'}
                    sx={{
                      height: 36,
                      px: 1.25,
                      borderRadius: '999px',
                      fontWeight: 800,
                      letterSpacing: 0.2,
                      color: '#0f172a',
                      background: 'linear-gradient( to right bottom, rgba(255,255,255,0.75), rgba(255,255,255,0.6) ) padding-box, linear-gradient(90deg, rgba(0,255,195,0.7), rgba(2,226,255,0.7)) border-box',
                      border: '1px solid transparent',
                      boxShadow: '0 4px 18px rgba(2,226,255,0.12)',
                      backdropFilter: 'blur(6px)'
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </ProfileHeader>

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
          {renderBidHistory()}

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

          {/* Success Dialog for Job Post */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(2,226,255,0.2)',
                boxShadow: '0 8px 32px rgba(2,226,255,0.10)',
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
                color: 'black ',
                fontSize: '1.2rem',
                fontWeight: 700,

                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'white',
              }}
            >
              <CheckIcon sx={{ color: 'black', fontSize: 28 }} />
              Job Posted Successfully!
              <IconButton
                aria-label="close"
                onClick={() => setDialogOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ background: 'white', color: 'white', fontSize: '1rem', }}>
              <Typography sx={{ color: 'black', mb: 2 }}>
                Your job post has been published. Share the test job link below with candidates:
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                borderRadius: '8px',
                p: 2,
                mb: 2,
                border: '1px solid rgba(2,226,255,0.2)'
              }}>
                <LinkIcon sx={{ color: '#02E2FF', mr: 1 }} />
                <Typography
                  sx={{ color: '#02E2FF', fontWeight: 600, flex: 1, wordBreak: 'break-all' }}
                  id="test-job-link"
                >
                  {(() => {
                    if (!postedJobId) return '';
                    const base = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';
                    // Try to find the first step id for the newly posted job
                    const job = myJobs.find((j: any) => j._id === postedJobId);
                    const stepId = job?.post_Steps?.[0]?._id;
                    return stepId
                      ? `${base}/posts/${postedJobId}/interview?stepId=${stepId}`
                      : `${base}/posts/${postedJobId}/interview`;
                  })()}
                </Typography>
                <Tooltip title={copySuccess ? 'Copied!' : 'Copy'}>
                  <IconButton
                    onClick={() => {
                      if (!postedJobId) return;
                      const base = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';
                      const job = myJobs.find((j: any) => j._id === postedJobId);
                      const stepId = job?.post_Steps?.[0]?._id;
                      const url = stepId
                        ? `${base}/posts/${postedJobId}/interview?stepId=${stepId}`
                        : `${base}/posts/${postedJobId}/interview`;
                      navigator.clipboard.writeText(url);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 1500);
                    }}
                    sx={{ color: copySuccess ? '#00FFC3' : '#02E2FF', ml: 1 }}
                    disabled={!postedJobId}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1, background: 'white' }}>
              <Button
                onClick={() => setDialogOpen(false)}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success Dialog for Job Post */}
          <Dialog
            open={showSuccessDialog}
            onClose={() => setShowSuccessDialog(false)}
            PaperProps={{
              sx: {
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                maxWidth: '500px',
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
                }
              }
            }}
          >
            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Box
                  sx={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(2, 226, 255, 0.1), rgba(0, 255, 195, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: '-2px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #02E2FF, #00FFC3)',
                      opacity: 0.5,
                      animation: 'pulse 2s infinite',
                    }
                  }}
                >
                  <CheckIcon sx={{ fontSize: 40, color: '#00FFC3' }} />
                </Box>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: '#fff',
                    fontWeight: 600,
                    mb: 2,
                    background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Job Posted Successfully!
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 3,
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                  }}
                >
                  Your job has been posted and is now visible to potential candidates. You can manage it from your dashboard.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowSuccessDialog(false)}
                    sx={{
                      color: '#02E2FF',
                      borderColor: 'rgba(2, 226, 255, 0.3)',
                      '&:hover': {
                        borderColor: '#02E2FF',
                        background: 'rgba(2, 226, 255, 0.1)',
                      },
                      px: 3,
                      py: 1,
                      borderRadius: '12px',
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setShowSuccessDialog(false);
                      router.push('/dashboard/company');
                    }}
                    sx={{
                      background: 'linear-gradient(90deg, #02E2FF, #00FFC3)',
                      color: '#1E293B',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #00FFC3, #02E2FF)',
                      },
                      px: 3,
                      py: 1,
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0, 255, 195, 0.3)',
                    }}
                  >
                    View Dashboard
                  </Button>
                </Box>
              </motion.div>
            </DialogContent>
          </Dialog>

          {/* Job Details Modal */}
          <Dialog
            open={jobDetailsModalOpen}
            onClose={handleCloseJobDetailsModal}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '24px',
                boxShadow: '0 32px 64px -12px rgba(0,0,0,0.3)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(24px)',
                maxHeight: '95vh',
                overflow: 'hidden',
                border: '1px solid rgba(0, 255, 157, 0.1)'
              }
            }}
          >
            <DialogTitle sx={{
              borderBottom: '2px solid rgba(0, 255, 157, 0.15)',
              pb: 3,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #00FF9D 0%, #02E2FF 50%, #00FF9D 100%)',
                borderRadius: '24px 24px 0 0'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #02E2FF 100%)',
                  borderRadius: '12px',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 255, 157, 0.3)'
                }}>
                  <WorkIcon sx={{ color: '#1e293b', fontSize: 28, fontWeight: 'bold' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Job Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
                    Comprehensive job information and requirements
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleCloseJobDetailsModal}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  p: 1.5,
                  '&:hover': {
                    color: '#00FF9D',
                    background: 'rgba(0, 255, 157, 0.2)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s ease'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ 
              mt: 0, 
              p: 0,
              overflowY: 'auto',
              maxHeight: 'calc(95vh - 140px)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)'
            }}>
              {selectedJobForDetails && (
                <Box sx={{ p: 4 }}>
                  {/* Job Header - Enhanced */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.08) 0%, rgba(2, 226, 255, 0.08) 100%)',
                    borderRadius: '20px',
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
                    <Typography variant="h4" sx={{ 
                      color: '#1e293b', 
                      fontWeight: 800, 
                      mb: 3,
                      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      lineHeight: 1.2
                    }}>
                      {selectedJobForDetails.jobDetails.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                      <Chip
                        icon={<LocationOnIcon sx={{ fontSize: 20, color: '#1e293b' }} />}
                        label={selectedJobForDetails.jobDetails.location}
                        size="medium"
                        sx={{ 
                          backgroundColor: 'rgba(0, 255, 157, 0.9)', 
                          color: '#1e293b', 
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          px: 2,
                          py: 1,
                          borderRadius: '12px',
                          boxShadow: '0 4px 8px rgba(0, 255, 157, 0.2)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(0, 255, 157, 0.3)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      />
                      <Chip
                        label={selectedJobForDetails.jobDetails.employmentType}
                        size="medium"
                        sx={{ 
                          backgroundColor: 'rgba(2, 226, 255, 0.9)', 
                          color: '#1e293b', 
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          px: 2,
                          py: 1,
                          borderRadius: '12px',
                          boxShadow: '0 4px 8px rgba(2, 226, 255, 0.2)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(2, 226, 255, 0.3)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      />
                      <Chip
                        icon={<AttachMoneyIcon sx={{ fontSize: 20, color: '#1e293b' }} />}
                        label={`${selectedJobForDetails.jobDetails.salary.currency}${selectedJobForDetails.jobDetails.salary.min.toLocaleString()}-${selectedJobForDetails.jobDetails.salary.max.toLocaleString()}`}
                        size="medium"
                        sx={{ 
                          backgroundColor: 'rgba(255, 193, 7, 0.9)', 
                          color: '#1e293b', 
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          px: 2,
                          py: 1,
                          borderRadius: '12px',
                          boxShadow: '0 4px 8px rgba(255, 193, 7, 0.2)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(255, 193, 7, 0.3)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      />
                    </Box>
                    
                    {selectedJobForDetails.createdAt && (
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(30, 41, 59, 0.7)', 
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <InfoIcon sx={{ fontSize: 16, color: '#00FF9D' }} />
                        Posted: {new Date(selectedJobForDetails.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    )}
                    
                    {/* Job URL - Enhanced */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 600, 
                        display: 'block', 
                        mb: 1.5,
                        fontSize: '0.95rem'
                      }}>
                        Public Job URL:
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '12px',
                        p: 2,
                        border: '2px solid rgba(0, 255, 157, 0.2)',
                        boxShadow: '0 4px 12px rgba(0, 255, 157, 0.1)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'rgba(0, 255, 157, 0.4)',
                          boxShadow: '0 6px 16px rgba(0, 255, 157, 0.2)'
                        }
                      }}>
                        <LinkIcon sx={{ color: '#02E2FF', mr: 1.5, fontSize: 24 }} />
                        <Typography
                          sx={{ 
                            color: '#02E2FF', 
                            fontWeight: 600, 
                            flex: 1, 
                            wordBreak: 'break-all',
                            fontSize: '0.9rem'
                          }}
                        >
                          {(() => {
                            const base = typeof window !== 'undefined' && window.location.origin 
                              ? `${window.location.origin}`
                              : `https://app.talentai.bid`;
                            const stepId = selectedJobForDetails?.post_Steps?.[0]?._id;
                            return stepId
                              ? `${base}/posts/${selectedJobForDetails._id}/interview?stepId=${stepId}`
                              : `${base}/posts/${selectedJobForDetails._id}/interview`;
                          })()}
                        </Typography>
                        <Tooltip title="Copy URL" arrow>
                          <IconButton
                            onClick={() => {
                              const base = typeof window !== 'undefined' && window.location.origin 
                                ? `${window.location.origin}`
                                : `https://app.talentai.bid`;
                              const stepId = selectedJobForDetails?.post_Steps?.[0]?._id;
                              const url = stepId
                                ? `${base}/posts/${selectedJobForDetails._id}/interview?stepId=${stepId}`
                                : `${base}/posts/${selectedJobForDetails._id}/interview`;
                              navigator.clipboard.writeText(url);
                              // You could add a success notification here
                            }}
                            sx={{ 
                              color: '#02E2FF', 
                              ml: 1,
                              background: 'rgba(2, 226, 255, 0.1)',
                              borderRadius: '8px',
                              '&:hover': {
                                color: '#00FFC3',
                                background: 'rgba(0, 255, 195, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            size="small"
                          >
                            <ContentCopyIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>

                  {/* Content Sections */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 4 }}>
                    {/* Job Description */}
                    <Box sx={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '16px',
                      p: 3,
                      border: '1px solid rgba(0, 255, 157, 0.1)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#1e293b', 
                        fontWeight: 700, 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <DescriptionIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                        Job Description
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: '#374151', 
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.95rem'
                      }}>
                        {selectedJobForDetails.jobDetails.description}
                      </Typography>
                    </Box>

                    {/* Requirements */}
                    {selectedJobForDetails.jobDetails.requirements && selectedJobForDetails.jobDetails.requirements.length > 0 && (
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        p: 3,
                        border: '1px solid rgba(0, 255, 157, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <CheckIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                          Requirements
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                          {selectedJobForDetails.jobDetails.requirements.map((req: string, index: number) => (
                            <Typography 
                              key={index} 
                              component="li" 
                              variant="body1" 
                              sx={{ 
                                color: '#374151', 
                                mb: 1.5,
                                lineHeight: 1.6,
                                fontSize: '0.95rem',
                                position: 'relative',
                                pl: 2,
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '8px',
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#00FF9D'
                                }
                              }}
                            >
                              {req}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Responsibilities */}
                    {selectedJobForDetails.jobDetails.responsibilities && selectedJobForDetails.jobDetails.responsibilities.length > 0 && (
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        p: 3,
                        border: '1px solid rgba(0, 255, 157, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <WorkIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                          Responsibilities
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                          {selectedJobForDetails.jobDetails.responsibilities.map((resp: string, index: number) => (
                            <Typography 
                              key={index} 
                              component="li" 
                              variant="body1" 
                              sx={{ 
                                color: '#374151', 
                                mb: 1.5,
                                lineHeight: 1.6,
                                fontSize: '0.95rem',
                                position: 'relative',
                                pl: 2,
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '8px',
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#02E2FF'
                                }
                              }}
                            >
                              {resp}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Required Skills */}
                    {selectedJobForDetails.skillAnalysis?.requiredSkills && selectedJobForDetails.skillAnalysis.requiredSkills.length > 0 && (
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        p: 3,
                        border: '1px solid rgba(0, 255, 157, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <StarIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                          Required Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                          {selectedJobForDetails.skillAnalysis.requiredSkills.map((skill: any, idx: number) => (
                            <Chip
                              key={idx}
                              label={`${skill.name} (${skill.level})`}
                              size="medium"
                              icon={<StarIcon sx={{ color: '#1e293b', fontSize: 18 }} />}
                              sx={{
                                backgroundColor: 'linear-gradient(135deg, rgba(0, 255, 157, 0.9) 0%, rgba(0, 255, 195, 0.9) 100%)',
                                background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.9) 0%, rgba(0, 255, 195, 0.9) 100%)',
                                color: '#1e293b',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                letterSpacing: 0.2,
                                px: 2,
                                py: 1,
                                borderRadius: '12px',
                                boxShadow: '0 4px 8px rgba(0, 255, 157, 0.2)',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 12px rgba(0, 255, 157, 0.3)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Suggested Skills */}
                    {selectedJobForDetails.skillAnalysis?.suggestedSkills && (
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        p: 3,
                        border: '1px solid rgba(0, 255, 157, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <AutoAwesomeIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                          Suggested Skills
                        </Typography>
                        
                        {/* Technical Skills */}
                        {selectedJobForDetails.skillAnalysis.suggestedSkills.technical && selectedJobForDetails.skillAnalysis.suggestedSkills.technical.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ 
                              color: '#1e293b', 
                              fontWeight: 600, 
                              mb: 1.5,
                              fontSize: '1rem'
                            }}>
                              Technical Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedJobForDetails.skillAnalysis.suggestedSkills.technical.map((skill: any, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={skill.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(2, 226, 255, 0.9)',
                                    color: '#1e293b',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Frameworks */}
                        {selectedJobForDetails.skillAnalysis.suggestedSkills.frameworks && selectedJobForDetails.skillAnalysis.suggestedSkills.frameworks.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ 
                              color: '#1e293b', 
                              fontWeight: 600, 
                              mb: 1.5,
                              fontSize: '1rem'
                            }}>
                              Frameworks
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedJobForDetails.skillAnalysis.suggestedSkills.frameworks.map((skill: any, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={skill.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(2, 226, 255, 0.9)',
                                    color: '#1e293b',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Tools */}
                        {selectedJobForDetails.skillAnalysis.suggestedSkills.tools && selectedJobForDetails.skillAnalysis.suggestedSkills.tools.length > 0 && (
                          <Box>
                            <Typography variant="subtitle1" sx={{ 
                              color: '#1e293b', 
                              fontWeight: 600, 
                              mb: 1.5,
                              fontSize: '1rem'
                            }}>
                              Tools
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedJobForDetails.skillAnalysis.suggestedSkills.tools.map((skill: any, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={skill.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(2, 226, 255, 0.9)',
                                    color: '#1e293b',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                                      transition: 'all 0.2s ease'
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Skill Summary */}
                    {selectedJobForDetails.skillAnalysis?.skillSummary && (
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        p: 3,
                        border: '1px solid rgba(0, 255, 157, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <TrendingUpIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                          Skill Summary
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          {selectedJobForDetails.skillAnalysis.skillSummary.mainTechnologies && selectedJobForDetails.skillAnalysis.skillSummary.mainTechnologies.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" sx={{ 
                                color: '#1e293b', 
                                fontWeight: 600, 
                                mb: 1.5,
                                fontSize: '1rem'
                              }}>
                                Main Technologies
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {selectedJobForDetails.skillAnalysis.skillSummary.mainTechnologies.map((tech: string, idx: number) => (
                                  <Chip
                                    key={idx}
                                    label={tech}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(0, 255, 157, 0.8)',
                                      color: '#1e293b',
                                      fontWeight: 600,
                                      borderRadius: '8px',
                                      '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 8px rgba(0, 255, 157, 0.3)',
                                        transition: 'all 0.2s ease'
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {selectedJobForDetails.skillAnalysis.skillSummary.complementarySkills && selectedJobForDetails.skillAnalysis.skillSummary.complementarySkills.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" sx={{ 
                                color: '#1e293b', 
                                fontWeight: 600, 
                                mb: 1.5,
                                fontSize: '1rem'
                              }}>
                                Complementary Skills
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {selectedJobForDetails.skillAnalysis.skillSummary.complementarySkills.map((skill: string, idx: number) => (
                                  <Chip
                                    key={idx}
                                    label={skill}
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(2, 226, 255, 0.8)',
                                      color: '#1e293b',
                                      fontWeight: 600,
                                      borderRadius: '8px',
                                      '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 8px rgba(2, 226, 255, 0.3)',
                                        transition: 'all 0.2s ease'
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {selectedJobForDetails.skillAnalysis.skillSummary.stackComplexity && (
                            <Box>
                              <Typography variant="subtitle1" sx={{ 
                                color: '#1e293b', 
                                fontWeight: 600, 
                                mb: 1.5,
                                fontSize: '1rem'
                              }}>
                                Stack Complexity
                              </Typography>
                              <Chip
                                label={selectedJobForDetails.skillAnalysis.skillSummary.stackComplexity}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(0, 255, 157, 0.9)',
                                  color: '#1e293b',
                                  fontWeight: 600,
                                  borderRadius: '8px',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 8px rgba(0, 255, 157, 0.3)',
                                    transition: 'all 0.2s ease'
                                  }
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Recruitment Steps */}
                    {selectedJobForDetails?.post_Steps?.length > 0 && (
                      <Box sx={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '16px',
                        p: 3,
                        border: '1px solid rgba(0, 255, 157, 0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1e293b', 
                          fontWeight: 700, 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <TrendingUpIcon sx={{ color: '#00FF9D', fontSize: 24 }} />
                          Recruitment Steps
                        </Typography>
                        <Stepper orientation="vertical" nonLinear activeStep={-1}>
                          {selectedJobForDetails?.post_Steps?.map((step: any, index: number) => (
                            <Step key={step._id}>
                              <StepLabel
                                StepIconProps={{
                                  sx: {
                                    color: 'rgba(0, 255, 157, 1)',
                                    fontSize: '1.5rem'
                                  }
                                }}
                              >
                                <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                                  {step.data.title || step.data.label}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                  {step.data.subtitle}
                                </Typography>
                              </StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ 
              p: 3, 
              borderTop: '2px solid rgba(0, 255, 157, 0.15)',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '0 0 24px 24px'
            }}>
              <Button
                onClick={handleCloseJobDetailsModal}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #02E2FF 100%)',
                  color: '#1e293b',
                  fontWeight: 700,
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 8px 16px rgba(0, 255, 157, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00E2B8 0%, #00C3FF 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(0, 255, 157, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Company Profiles Section */}
          <StyledCard sx={{ mt: 6, mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ color: 'black', fontWeight: 800, letterSpacing: 0.2 }}>
                Company Profiles & Assessments
              </Typography>
            </Box>
            {renderCompanyProfilesTable()}
          </StyledCard>
        </Container>
      </Box>
    </CompanyOnly>
  );
}

export default DashboardCompany;