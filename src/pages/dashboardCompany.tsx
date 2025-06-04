import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile, clearProfile } from '../store/slices/profileSlice';
import { AppDispatch, RootState } from '../store/store';
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
  Grid,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  InputAdornment,
  Menu,
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
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';
import WorkIcon from '@mui/icons-material/Work';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import ErrorIcon from '@mui/icons-material/Error';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InfoIcon from '@mui/icons-material/Info';
import { signOut } from 'next-auth/react';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchBids, placeBid } from '@/store/slices/bidSlice';
import CheckIcon from '@mui/icons-material/Check';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import axios from 'axios';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
  background: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  color: '#ffffff',
  padding: theme.spacing(4),
  borderRadius: '16px',
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: 1
  }
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3)
}));

const StatCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255,255,255,0.1)',
  padding: theme.spacing(2),
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
}));

const CompanyInfoCard = styled(Box)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  padding: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.1)',
  marginBottom: theme.spacing(3),
  backdropFilter: 'blur(10px)'
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: GREEN_MAIN,
  color: 'black',
  fontWeight: 600,
  margin: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(2, 226, 255, 0.2)',
  }
}));

const CandidateCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  width: '100%',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(2,226,255,0.1)'
  }
}));

const MatchCard = styled(Box)(({ theme }) => ({
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid black',
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(2,226,255,0.15)',
    border: '1px solid rgba(2,226,255,0.3)',
  }
}));

const MatchScore = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(2,226,255,0.1) 0%, rgba(0,255,195,0.1) 100%)',
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
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

// Add interface for job data
interface JobData {
  title: string;
  description: string;
  requirements: string[];
  skills: Array<{
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
  }>;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: string;
  experienceLevel: string;
}

// Add helper function to map proficiency levels to experience levels
const getExperienceLevelFromProficiency = (proficiencyLevel: number): string => {
  switch (proficiencyLevel) {
    case 1:
      return 'Entry Level';
    case 2:
      return 'Junior';
    case 3:
      return 'Mid Level';
    case 4:
      return 'Senior';
    case 5:
      return 'Expert';
    default:
      return 'Entry Level';
  }
};

// Add interfaces for skill types
interface RequiredSkill {
  name: string;
  level: string;
  importance: string;
  category: string;
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
  const { profile, loading } = useSelector(selectProfile);
  const [editSkillsDialog, setEditSkillsDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [matchingProfiles, setMatchingProfiles] = useState<MatchingCandidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<MatchingCandidate[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [jobPostDialog, setJobPostDialog] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuickGenerating, setIsQuickGenerating] = useState(false);
  const [isDetailedGenerating, setIsDetailedGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<'quick' | 'detailed'>('quick');
  const [isPosting, setIsPosting] = useState(false);
  const [generatedJob, setGeneratedJob] = useState<JobPost | undefined>(undefined);
  const [jobPostError, setJobPostError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [linkedinCopySuccess, setLinkedinCopySuccess] = useState(false);
  const [hasSharedToLinkedIn, setHasSharedToLinkedIn] = useState(false);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [displayCount, setDisplayCount] = useState(3); // Change initial display count to 3
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
  const [newSkill, setNewSkill] = useState('');
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);
  const [newSkillLevel, setNewSkillLevel] = useState("3");

  const isSalaryRangeValid = () => {
    return salaryRange.min > 0 && salaryRange.max > 0 && salaryRange.max >= salaryRange.min;
  };

  const handleSalaryChange = (field: 'min' | 'max' | 'currency', value: string | number) => {
    if (field === 'currency') {
      setSalaryRange(prev => ({
        ...prev,
        [field]: value as string
      }));
    } else {
      // For min and max fields, ensure we're working with a clean number
      const numValue = typeof value === 'string' ? parseInt(value.replace(/^0+/, ''), 10) || 0 : value;
      setSalaryRange(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };



  // Filter profiles based on score and skills
  useEffect(() => {
    const filtered = matchingProfiles.filter(candidate => {
      const meetsScoreRequirement = candidate.score >= minScore;
      const meetsSkillRequirement = selectedSkills.length === 0 ||
        selectedSkills.every(skill =>
          candidate.matchedSkills.some(s => s.name === skill)
        );
      return meetsScoreRequirement && meetsSkillRequirement;
    });
    setFilteredCandidates(filtered);
  }, [minScore, selectedSkills, matchingProfiles]);

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

  // Modify the handle generate job function to reset the sharing state ONLY after successful generation
  const handleGenerateJob = async (type: 'quick' | 'detailed') => {
    try {
      if (type === 'quick') {
        setIsQuickGenerating(true);
      } else {
        setIsDetailedGenerating(true);
      }
      setJobPostError(null);

      const token = Cookies.get('api_token');

      // Format salary range for description
      const salaryText = `\n\nSalary Range: ${salaryRange.currency}${salaryRange.min.toLocaleString()} - ${salaryRange.currency}${salaryRange.max.toLocaleString()}`;
      const descriptionWithSalary = jobDescription + salaryText;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}linkedinPost/generate-job-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: descriptionWithSalary,
          type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate job post');
      }

      const data = await response.json();

      // Transform the API response into our required structure
      const jobPost = {
        jobDetails: {
          title: data.jobDetails.title,
          description: data.jobDetails.description,
          requirements: data.jobDetails.requirements,
          responsibilities: data.jobDetails.responsibilities,
          location: data.jobDetails.location,
          employmentType: data.jobDetails.employmentType,
          experienceLevel: data.jobDetails.experienceLevel,
          salary: data.jobDetails.salary
        },
        skillAnalysis: {
          requiredSkills: data.skillAnalysis.requiredSkills.map((skill: any) => ({
            name: skill.name,
            level: skill.level.toString(),
            importance: "Required",
            category: skill.name.includes('React') || skill.name.includes('JavaScript') ? 'Frontend' :
              skill.name.includes('Git') ? 'Version Control' :
                'General'
          })),
          suggestedSkills: {
            technical: data.skillAnalysis.suggestedSkills.technical.map((skill: any) => ({
              name: skill.name,
              reason: skill.reason,
              category: skill.category,
              priority: skill.priority
            })),
            frameworks: data.skillAnalysis.suggestedSkills.frameworks.map((framework: any) => ({
              name: framework.name,
              relatedTo: framework.relatedTo,
              priority: framework.priority
            })),
            tools: data.skillAnalysis.suggestedSkills.tools.map((tool: any) => ({
              name: tool.name,
              purpose: tool.purpose,
              category: tool.category
            }))
          },
          skillSummary: {
            mainTechnologies: data.skillAnalysis.requiredSkills.map((skill: any) => skill.name),
            complementarySkills: data.skillAnalysis.suggestedSkills.technical.map((skill: any) => skill.name),
            learningPath: data.skillAnalysis.skillSummary.learningPath,
            stackComplexity: data.skillAnalysis.skillSummary.stackComplexity
          }
        },
        linkedinPost: {
          formattedContent: {
            headline: `🌟 We're Hiring: ${data.jobDetails.title} 🌟`,
            introduction: "Are you passionate about building interactive web applications? We've got an exciting opportunity for you!",
            companyPitch: "Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.",
            roleOverview: `As a ${data.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.`,
            keyPoints: [
              "🔹 Develop cutting-edge web applications",
              "🔹 Work with a team of talented developers",
              `🔹 ${data.jobDetails.location} work`,
              `🔹 Salary range: ${data.jobDetails.salary.currency}${data.jobDetails.salary.min}-${data.jobDetails.salary.max}`
            ],
            skillsRequired: `💻 Required Skills: ${data.skillAnalysis.requiredSkills.map((skill: any) => skill.name).join(', ')}.`,
            benefitsSection: "🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.",
            callToAction: "✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test"
          },
          hashtags: [
            "#Hiring",
            "#TechJobs",
            `#${data.jobDetails.title.replace(/\s+/g, '')}`,
            "#RemoteWork",
            "#TechCareers"
          ],
          formatting: {
            emojis: {
              company: "🏢",
              location: "📍",
              salary: "💰",
              requirements: "📋",
              skills: "💻",
              benefits: "🎯",
              apply: "✨"
            }
          },
          finalPost: `🌟 We're Hiring: ${data.jobDetails.title} 🌟

Are you passionate about building interactive web applications? We've got an exciting opportunity for you!

Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.

As a ${data.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.

🔹 Develop cutting-edge web applications
🔹 Work with a team of talented developers
🔹 ${data.jobDetails.location} work
🔹 Salary range: ${data.jobDetails.salary.currency}${data.jobDetails.salary.min}-${data.jobDetails.salary.max}

💻 Required Skills: ${data.skillAnalysis.requiredSkills.map((skill: any) => skill.name).join(', ')}.

🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.

✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/

#Hiring #TechJobs #${data.jobDetails.title.replace(/\s+/g, '')} #RemoteWork #TechCareers`
        }
      };

      // Log the transformed job post data
      console.log('Generated Job Post:', jobPost);

      setGeneratedJob(jobPost);

      // NOW reset the LinkedIn sharing status since we have a new job post
      setHasSharedToLinkedIn(false);

    } catch (error) {
      console.error('Error generating job:', error);
      setJobPostError(error instanceof Error ? error.message : 'Failed to generate job post');
    } finally {
      if (type === 'quick') {
        setIsQuickGenerating(false);
      } else {
        setIsDetailedGenerating(false);
      }
    }
  };


  // Update the saveJob function to handle the job data properly
  const saveJob = async () => {
    setIsSaving(true);
    try {
      if (!generatedJob) {
        throw new Error('No job data available');
      }

      const jobPostData = {
        jobDetails: {
          title: generatedJob.jobDetails.title,
          description: generatedJob.jobDetails.description,
          requirements: generatedJob.jobDetails.requirements,
          responsibilities: generatedJob.jobDetails.responsibilities,
          location: generatedJob.jobDetails.location,
          employmentType: generatedJob.jobDetails.employmentType,
          experienceLevel: generatedJob.jobDetails.experienceLevel,
          salary: generatedJob.jobDetails.salary
        },
        skillAnalysis: {
          requiredSkills: localRequiredSkills.map((skillName) => ({
            name: skillName,
            level: "3", // Default level
            importance: "Required",
            category: skillName.includes('React') || skillName.includes('JavaScript') ? 'Frontend' :
              skillName.includes('Git') ? 'Version Control' :
                'General'
          })),
          suggestedSkills: {
            technical: [
              {
                name: "TypeScript",
                reason: "Enhances JavaScript coding, providing static types.",
                category: "Frontend",
                priority: "High"
              },
              {
                name: "Redux",
                reason: "Widely used with React for state management.",
                category: "Frontend",
                priority: "Medium"
              }
            ],
            frameworks: [
              {
                name: "Next.js",
                relatedTo: "React",
                priority: "Medium"
              }
            ],
            tools: [
              {
                name: "Webpack",
                purpose: "Module bundler for modern JavaScript applications.",
                category: "Build Tools"
              },
              {
                name: "NPM",
                purpose: "Package manager for JavaScript.",
                category: "Package Manager"
              }
            ]
          },
          skillSummary: {
            mainTechnologies: localRequiredSkills,
            complementarySkills: ["TypeScript", "Redux", "Next.js"],
            learningPath: ["ReactJS -> TypeScript -> Redux -> Next.js"],
            stackComplexity: "Moderate"
          }
        },
        linkedinPost: {
          formattedContent: {
            headline: `🌟 We're Hiring: ${generatedJob.jobDetails.title} 🌟`,
            introduction: "Are you passionate about building interactive web applications? We've got an exciting opportunity for you!",
            companyPitch: "Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.",
            roleOverview: `As a ${generatedJob.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.`,
            keyPoints: [
              "🔹 Develop cutting-edge web applications",
              "🔹 Work with a team of talented developers",
              `🔹 ${generatedJob.jobDetails.location} work`,
              `🔹 Salary range: ${generatedJob.jobDetails.salary.currency}${generatedJob.jobDetails.salary.min}-${generatedJob.jobDetails.salary.max}`
            ],
            skillsRequired: `💻 Required Skills: ${localRequiredSkills.join(', ')}.`,
            benefitsSection: "🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.",
            callToAction: "✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test"
          },
          hashtags: [
            "#Hiring",
            "#TechJobs",
            `#${generatedJob.jobDetails.title.replace(/\s+/g, '')}`,
            "#RemoteWork",
            "#TechCareers"
          ],
          formatting: {
            emojis: {
              company: "🏢",
              location: "📍",
              salary: "💰",
              requirements: "📋",
              skills: "💻",
              benefits: "🎯",
              apply: "✨"
            }
          },
          finalPost: `🌟 We're Hiring: ${generatedJob.jobDetails.title} 🌟

Are you passionate about building interactive web applications? We've got an exciting opportunity for you!

Join a team where innovation, a dynamic culture, and a passion for technology drive us. We believe in empowering our developers and offering endless opportunities for growth.

As a ${generatedJob.jobDetails.title}, you'll be at the heart of our engineering process, building software that matters.

🔹 Develop cutting-edge web applications
🔹 Work with a team of talented developers
🔹 ${generatedJob.jobDetails.location} work
🔹 Salary range: ${generatedJob.jobDetails.salary.currency}${generatedJob.jobDetails.salary.min}-${generatedJob.jobDetails.salary.max}

💻 Required Skills: ${localRequiredSkills.join(', ')}.

🎯 We offer a vibrant culture, mentorship from industry leaders, and the chance to work on projects that impact millions.

✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test

#Hiring #TechJobs #${generatedJob.jobDetails.title.replace(/\s+/g, '')} #RemoteWork #TechCareers`
        }
      };

      // Log the complete job post data
      console.log('Job Post Data:', jobPostData);

      const token = Cookies.get('api_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}post/save-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobPostData)
      });

      if (!response.ok) {
        throw new Error('Failed to save job');
      }

      const savedJob = await response.json();
      // Store the posted job ID for the success dialog
      setPostedJobId(savedJob.data?._id || savedJob._id);
      console.log('Job saved successfully:', savedJob);

      // Close the dialog after successful save
      setJobPostDialog(false);
      setDialogOpen(true); // Open success dialog
      setJobDescription('');
      setGeneratedJob(undefined);
      fetchMyJobs()
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
    <StyledCard sx={{ mt: 4 }}>
      <SectionTitle>Bid History</SectionTitle>
      {status === "loading" ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      ) : status === "failed" ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : data.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No bid history found.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((bid: any) => (
            <Box key={bid?._id} sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'white',
              borderRadius: '10px',
              p: 2,
              boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Box>
                <Typography sx={{ color: '#000', fontWeight: 600 }}>{bid?.userInfo?.username}</Typography>
                <Typography sx={{ color: '#000', fontSize: '0.9rem' }}>{bid?.userInfo?.email}</Typography>
                <Typography sx={{ color: '#000', fontSize: '0.85rem' }}>{bid?.post?.jobDetails?.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* <Chip
                  label={bid.status === 'win' ? 'Won' : 'Lost'}
                  color={bid.status === 'win' ? 'success' : 'error'}
                  sx={{ fontWeight: 700 }}
                /> */}
                <Typography sx={{ color: GREEN_MAIN, fontWeight: 600 }}>
                  ${bid?.finalBid}
                </Typography>
                <Typography sx={{ color: 'black', fontSize: '0.8rem' }}>
                  {new Date(bid?.dateBid).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </StyledCard>
  );

  // Add the job posting dialog component
  const renderJobPostDialog = () => (
    <Dialog
      open={jobPostDialog}
      onClose={() => setJobPostDialog(false)}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          background: 'white',
          backdropFilter: 'blur(10px)',
          borderRadius: { xs: '0', sm: '16px' },
          border: '1px solid rgba(255,255,255,0.1)',
          height: { xs: '100vh', sm: '90vh' },
          maxHeight: { xs: '100vh', sm: '90vh' },
          margin: { xs: 0, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <DialogTitle sx={{
        color: 'black',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: { xs: 2, sm: 3 },
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}>
            AI Job Post Generator
          </Typography>
          <Chip
            label="Beta"
            size="small"
            sx={{
              backgroundColor: GREEN_MAIN,
              color: 'black',
              height: '20px'
            }}
          />
        </Box>
        <IconButton
          onClick={() => setJobPostDialog(false)}
          sx={{
            color: 'black',
            position: { xs: 'absolute', sm: 'static' },
            right: { xs: 8, sm: 'auto' },
            top: { xs: 8, sm: 'auto' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        p: 0,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        <Box sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: 'auto', md: '100%' },
          borderRight: { xs: 'none', md: '1px solid rgba(255,255,255,0.1)' },
          borderBottom: { xs: '1px solid rgba(255,255,255,0.1)', md: 'none' },
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2, sm: 3 },
          gap: 2,
          overflow: 'auto'
        }}>
          <Typography variant="h6" sx={{
            color: '#000',
            mb: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            Job Description
          </Typography>
          <Typography variant="body2" sx={{
            color: '#000',
            mb: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Describe the position you're looking to fill. Be as detailed as possible about responsibilities, requirements, and desired skills.
          </Typography>

          <TextField
            multiline
            rows={8}
            fullWidth
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Example: 

We are seeking a Senior Full Stack Developer to join our dynamic team. The ideal candidate will have:

Technical Requirements:
- 5+ years of experience with React.js and Node.js
- Strong proficiency in TypeScript and modern JavaScript
- Experience with cloud platforms (AWS/Azure/GCP)
- Knowledge of microservices architecture
- Expertise in database design (SQL and NoSQL)

Responsibilities:
- Lead development of our core product features
- Mentor junior developers and conduct code reviews
- Design and implement scalable backend services
- Optimize application performance
- Collaborate with product and design teams

Additional Skills:
- Experience with CI/CD pipelines
- Knowledge of Docker and Kubernetes
- Strong problem-solving abilities
- Excellent communication skills

Benefits:
- Competitive salary range: $120,000 - $160,000
- Remote work options
- Health insurance
- 401(k) matching
- Professional development budget"
            InputLabelProps={{ sx: { color: GREEN_MAIN } }}
            InputProps={{
              sx: {
                color: '#000',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: GREEN_MAIN
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: GREEN_MAIN,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: GREEN_MAIN,
                },
              },
            }}
          />

          {!isSalaryRangeValid() && (
            <Alert
              severity="warning"
              sx={{
                mt: 2,
                backgroundColor: 'rgba(255,152,0,0.1)',
                color: '#ffb74d',
                border: '1px solid rgba(255,152,0,0.3)',
                '& .MuiAlert-icon': {
                  color: '#ffb74d'
                }
              }}
            >
              Please enter a valid salary range (minimum and maximum values required, maximum must be greater than or equal to minimum)
            </Alert>
          )}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#000', mb: 2 }}>
              Salary Range
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: GREEN_MAIN }}>Currency</InputLabel>
                  <Select
                    value={salaryRange.currency}
                    onChange={(e) => handleSalaryChange('currency', e.target.value)}
                    sx={{
                      color: '#000',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                    }}
                  >
                    <MenuItem value="$" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'rgba(30,41,59,1)' } }}>$ (USD)</MenuItem>
                    <MenuItem value="€" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'rgba(30,41,59,1)' } }}>€ (EUR)</MenuItem>
                    <MenuItem value="£" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'rgba(30,41,59,1)' } }}>£ (GBP)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Minimum Salary"
                  type="string"
                  value={salaryRange.min}
                  onChange={(e) => handleSalaryChange('min', parseInt(e.target.value) || 0)}
                  InputLabelProps={{ sx: { color: GREEN_MAIN } }}
                  InputProps={{
                    sx: {
                      color: '#000',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Maximum Salary"
                  type="string"
                  value={salaryRange.max}
                  onChange={(e) => handleSalaryChange('max', parseInt(e.target.value) || 0)}
                  InputLabelProps={{ sx: { color: GREEN_MAIN } }}
                  InputProps={{
                    sx: {
                      color: "#000",
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: GREEN_MAIN,
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleGenerateJob('quick')}
              disabled={!jobDescription || isQuickGenerating || !isSalaryRangeValid()}
              startIcon={isQuickGenerating ? <CircularProgress size={20} /> : <BoltIcon />}
              sx={{
                background: GREEN_MAIN,
                '&:hover': {
                  background: GREEN_MAIN,
                },
                '&.Mui-disabled': {
                  background: GREEN_MAIN,
                  color: 'black'
                }
              }}
            >
              {isQuickGenerating ? 'Generating...' : 'Quick Generate'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleGenerateJob('detailed')}
              disabled={!jobDescription || isDetailedGenerating || !isSalaryRangeValid()}
              startIcon={isDetailedGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              sx={{
                borderColor: GREEN_MAIN,
                color: GREEN_MAIN,
                '&:hover': {
                  borderColor: '#02E2FF',
                  backgroundColor: 'rgba(2,226,255,0.1)'
                },
                '&.Mui-disabled': {
                  borderColor: GREEN_MAIN,
                  color: GREEN_MAIN
                }
              }}
            >
              {isDetailedGenerating ? 'Generating...' : 'Detailed Generate'}
            </Button>
          </Box>


          {(isQuickGenerating || isDetailedGenerating) && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.875rem'
              }}
            >
              {isQuickGenerating ?
                'Generating a concise job post...' :
                'Performing detailed analysis and generating comprehensive job post...'}
            </Typography>
          )}
        </Box>

        <Box sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: '50%', md: 'auto' },
          p: { xs: 2, sm: 3 },
          overflowY: 'auto',
        }}>
          {jobPostError ? (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                backgroundColor: 'rgba(211,47,47,0.1)',
                color: '#ff8a80',
                border: '1px solid rgba(211,47,47,0.3)',
                '& .MuiAlert-icon': {
                  color: '#ff8a80'
                }
              }}
            >
              {jobPostError}
            </Alert>
          ) : !generatedJob ? (
            <Box sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              minHeight: { xs: '300px', md: 'auto' }
            }}>
              <Box sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: '50%',
                backgroundColor: GREEN_MAIN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <WorkIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, color: 'black' }}>
                Generated job post will appear here
              </Typography>
              <Typography variant="body2" sx={{
                maxWidth: '80%',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: 'black'
              }}>
                Enter your job description on the left and click "Generate" to create a professional job posting
              </Typography>
            </Box>
          ) : (
            <Box sx={{
              color: '#fff',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Job Title"
                      value={editedJob.jobDetails.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      InputLabelProps={{
                        sx: {
                          color: GREEN_MAIN,
                          fontSize: '1rem',
                          fontWeight: 500
                        }
                      }}
                      InputProps={{
                        sx: {
                          color: '#000',
                          fontSize: '1.1rem',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                            borderWidth: '2px'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                            borderWidth: '2px'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: GREEN_MAIN,
                            borderWidth: '2px'
                          },
                        },
                      }}
                    />
                  ) : (
                    <Typography
                      variant="h5"
                      sx={{
                        color: GREEN_MAIN,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
                    >
                      {generatedJob.jobDetails.title}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!isEditing ? (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleEdit}
                          sx={{
                            background: GREEN_MAIN,
                            color: 'black',
                            '&:hover': {
                              background: 'rgba(0, 255, 157, 0.8)',
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<LinkedInIcon />}
                          onClick={handleShareLinkedIn}
                          disabled={isPosting}
                          sx={{
                            background: hasSharedToLinkedIn
                              ? 'rgba(0,119,181,0.6)'
                              : 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
                            '&:hover': {
                              background: hasSharedToLinkedIn
                                ? 'rgba(0,119,181,0.7)'
                                : 'linear-gradient(135deg, #006097 0%, #0077B5 100%)',
                            }
                          }}
                        >
                          {isPosting
                            ? 'Sharing...'
                            : linkedinCopySuccess
                              ? 'Shared!'
                              : hasSharedToLinkedIn
                                ? 'Already Shared'
                                : 'Share on LinkedIn'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          sx={{
                            borderColor: GREEN_MAIN,
                            color: GREEN_MAIN,
                            '&:hover': {
                              borderColor: 'rgba(0, 255, 157, 0.8)',
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSave}
                          sx={{
                            background: GREEN_MAIN,
                            color: 'black',
                            '&:hover': {
                              background: 'rgba(0, 255, 157, 0.8)',
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {isEditing && editedJob && editedJob.jobDetails ? (
                    <>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={editedJob.jobDetails.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          InputLabelProps={{
                            sx: {
                              color: GREEN_MAIN,
                              fontSize: '1rem',
                              fontWeight: 500
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon sx={{ color: GREEN_MAIN }} />
                              </InputAdornment>
                            ),
                            sx: {
                              color: '#000',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                            },
                          }}
                        />
                        <FormControl fullWidth>
                          <InputLabel sx={{
                            color: GREEN_MAIN,
                            fontSize: '1rem',
                            fontWeight: 500
                          }}>
                            Employment Type
                          </InputLabel>
                          <Select
                            value={editedJob.jobDetails.employmentType}
                            onChange={(e) => handleInputChange('employmentType', e.target.value)}
                            label="Employment Type"
                            startAdornment={
                              <InputAdornment position="start">
                                <WorkIcon sx={{ color: GREEN_MAIN }} />
                              </InputAdornment>
                            }
                            sx={{
                              color: '#000',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '& .MuiSelect-icon': {
                                color: GREEN_MAIN
                              }
                            }}
                          >
                            <MenuItem value="Full-time">Full-time</MenuItem>
                            <MenuItem value="Part-time">Part-time</MenuItem>
                            <MenuItem value="Contract">Contract</MenuItem>
                            <MenuItem value="Freelance">Freelance</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <FormControl fullWidth>
                          <InputLabel sx={{
                            color: GREEN_MAIN,
                            fontSize: '1rem',
                            fontWeight: 500
                          }}>
                            Currency
                          </InputLabel>
                          <Select
                            value={editedJob.jobDetails.salary.currency}
                            onChange={(e) => handleInputChange('salary', {
                              ...editedJob.jobDetails.salary,
                              currency: e.target.value
                            })}
                            label="Currency"
                            startAdornment={
                              <InputAdornment position="start">
                                <AttachMoneyIcon sx={{ color: GREEN_MAIN }} />
                              </InputAdornment>
                            }
                            sx={{
                              color: '#000',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '& .MuiSelect-icon': {
                                color: GREEN_MAIN
                              }
                            }}
                          >
                            <MenuItem value="$">$ (USD)</MenuItem>
                            <MenuItem value="€">€ (EUR)</MenuItem>
                            <MenuItem value="£">£ (GBP)</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Minimum Salary"
                          type="number"
                          value={editedJob.jobDetails.salary.min}
                          onChange={(e) => handleInputChange('salary', {
                            ...editedJob.jobDetails.salary,
                            min: parseInt(e.target.value)
                          })}
                          InputLabelProps={{
                            sx: {
                              color: GREEN_MAIN,
                              fontSize: '1rem',
                              fontWeight: 500
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TrendingDownIcon sx={{ color: GREEN_MAIN }} />
                              </InputAdornment>
                            ),
                            sx: {
                              color: '#000',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Maximum Salary"
                          type="number"
                          value={editedJob.jobDetails.salary.max}
                          onChange={(e) => handleInputChange('salary', {
                            ...editedJob.jobDetails.salary,
                            max: parseInt(e.target.value)
                          })}
                          InputLabelProps={{
                            sx: {
                              color: GREEN_MAIN,
                              fontSize: '1rem',
                              fontWeight: 500
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TrendingUpIcon sx={{ color: GREEN_MAIN }} />
                              </InputAdornment>
                            ),
                            sx: {
                              color: '#000',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: GREEN_MAIN,
                                borderWidth: '2px'
                              },
                            },
                          }}
                        />
                      </Box>
                    </>
                  ) : (
                    <>

                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                          icon={<LocationOnIcon sx={{ fontSize: '0.875rem' }} />}
                          label={generatedJob.jobDetails.location}
                          size="small"
                          sx={{
                            color: 'black',
                            backgroundColor: GREEN_MAIN,
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                        <Chip
                          label={generatedJob.jobDetails.employmentType}
                          size="small"
                          sx={{
                            backgroundColor: GREEN_MAIN,
                            fontSize: '0.75rem',
                            color: 'black',
                            height: '24px'
                          }}
                        />
                        <Chip
                          label={`${generatedJob.jobDetails.salary.currency}${generatedJob.jobDetails.salary.min}-${generatedJob.jobDetails.salary.max}`}
                          size="small"
                          sx={{
                            color: 'black',
                            backgroundColor: GREEN_MAIN,
                            fontSize: '0.75rem',
                            height: '24px'
                          }}
                        />
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{
                  color: GREEN_MAIN,
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Overview
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedJob.jobDetails.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                ) : (
                  <Typography variant="body1" sx={{
                    color: 'black',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}>
                    {generatedJob.jobDetails.description}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{
                  color: GREEN_MAIN,
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Requirements
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedJob.jobDetails.requirements.join('\n')}
                    onChange={(e) => handleInputChange('requirements', e.target.value.split('\n'))}
                  />
                ) : (
                  <Box sx={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: `1px solid black`,
                    p: 2
                  }}>
                    {generatedJob.jobDetails.requirements.map((req: string, index: number) => (
                      <Box key={index} sx={{
                        display: 'flex',
                        gap: 2,
                        mb: index !== generatedJob.jobDetails.requirements.length - 1 ? 1.5 : 0,
                        alignItems: 'flex-start'
                      }}>
                        <Box sx={{
                          minWidth: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: GREEN_MAIN,
                          color: 'black',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {index + 1}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'black' }}>
                          {req}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{
                  color: GREEN_MAIN,
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Responsibilities
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedJob.jobDetails.responsibilities.join('\n')}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value.split('\n'))}
                  />
                ) : (
                  <Box sx={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: `1px solid black`,
                    p: 2
                  }}>
                    {generatedJob.jobDetails.responsibilities.map((resp: string, index: number) => (
                      <Box key={index} sx={{
                        display: 'flex',
                        gap: 2,
                        mb: index !== generatedJob.jobDetails.responsibilities.length - 1 ? 1.5 : 0,
                        alignItems: 'flex-start'
                      }}>
                        <Box sx={{
                          minWidth: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: GREEN_MAIN,
                          color: 'black',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {index + 1}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'black' }}>
                          {resp}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{
                  color: GREEN_MAIN,
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(isEditing ? editedJob?.skillAnalysis?.requiredSkills : generatedJob?.skillAnalysis?.requiredSkills || []).map((skill: { name: string; level: string; importance: string; category: string }, index: number) => (
                    editingSkillIndex === index ? (
                      <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          size="small"
                          value={editingSkillName}
                          onChange={(e) => setEditingSkillName(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              backgroundColor: 'white'
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleSaveSkill}
                          sx={{
                            backgroundColor: GREEN_MAIN,
                            color: 'black',
                            '&:hover': {
                              backgroundColor: GREEN_MAIN,
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingSkillIndex(null);
                            setEditingSkillName('');
                          }}
                          sx={{
                            borderColor: GREEN_MAIN,
                            color: GREEN_MAIN,
                            '&:hover': {
                              borderColor: GREEN_MAIN,
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <SkillChip
                        key={index}
                        label={`${skill.name} (${generatedJob?.jobDetails?.experienceLevel || 'Entry Level'})`}
                        onDelete={isEditing ? () => {
                          if (!editedJob) return;
                          const updatedSkills = [...editedJob.skillAnalysis.requiredSkills];
                          updatedSkills.splice(index, 1);
                          setEditedJob({
                            ...editedJob,
                            skillAnalysis: {
                              ...editedJob.skillAnalysis,
                              requiredSkills: updatedSkills
                            }
                          });
                        } : undefined}
                        deleteIcon={isEditing ? <DeleteIcon sx={{ color: 'red' }} /> : undefined}
                        onClick={isEditing ? () => handleEditSkill(index, skill) : undefined}
                        sx={isEditing ? { cursor: 'pointer' } : undefined}
                      />
                    )
                  ))}
                  
                  {isEditing && (
                    <>
                      {showAddSkillInput ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            placeholder="Add new skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: 'white'
                              }
                            }}
                          />
                          <TextField
                            select
                            size="small"
                            value={newSkillLevel || "3"}
                            onChange={(e) => setNewSkillLevel(e.target.value)}
                            sx={{
                              minWidth: 120,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: 'white'
                              }
                            }}
                          >
                            <MenuItem value="1">Entry Level</MenuItem>
                            <MenuItem value="2">Junior</MenuItem>
                            <MenuItem value="3">Mid Level</MenuItem>
                            <MenuItem value="4">Senior</MenuItem>
                            <MenuItem value="5">Expert</MenuItem>
                          </TextField>
                          <Button
                            variant="contained"
                            onClick={() => {
                              if (!newSkill.trim() || !editedJob) return;
                              const updatedSkills = [...editedJob.skillAnalysis.requiredSkills, {
                                name: newSkill.trim(),
                                level: newSkillLevel || "3",
                                importance: "Required",
                                category: newSkill.includes('React') || newSkill.includes('JavaScript') ? 'Frontend' :
                                  newSkill.includes('Git') ? 'Version Control' :
                                    'General'
                              }];
                              setEditedJob({
                                ...editedJob,
                                skillAnalysis: {
                                  ...editedJob.skillAnalysis,
                                  requiredSkills: updatedSkills
                                }
                              });
                              setNewSkill('');
                              setNewSkillLevel("3");
                              setShowAddSkillInput(false);
                            }}
                            sx={{
                              backgroundColor: GREEN_MAIN,
                              color: 'black',
                              '&:hover': {
                                backgroundColor: GREEN_MAIN,
                              }
                            }}
                          >
                            Add
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setShowAddSkillInput(false);
                              setNewSkill('');
                              setNewSkillLevel("3");
                            }}
                            sx={{
                              borderColor: GREEN_MAIN,
                              color: GREEN_MAIN,
                              '&:hover': {
                                borderColor: GREEN_MAIN,
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <IconButton
                          onClick={() => setShowAddSkillInput(true)}
                          sx={{
                            backgroundColor: 'rgba(0, 255, 157, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 157, 0.2)',
                            }
                          }}
                        >
                          <AddIcon sx={{ color: GREEN_MAIN }} />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>
              </Box>



              <Button
                fullWidth
                variant="contained"
                onClick={saveJob}
                disabled={isSaving}
                sx={{
                  mt: 4,
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  background: GREEN_MAIN,
                  borderRadius: '12px',
                  color: isSaving ? '#111' : '#fff',
                  '&:hover': {
                    background: GREEN_MAIN,
                  },
                  '&.Mui-disabled': {
                    background: GREEN_MAIN,
                    color: isSaving ? '#111' : '#fff',
                    opacity: 0.7,
                  }
                }}
              >
                {isSaving ? <CircularProgress size={20} sx={{ mr: 1, color: '#111' }} /> : null}
                {isSaving ? 'Saving...' : 'Save Job'}
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );

  // Update the renderMatchingProfiles function
  const renderMatchingProfiles = () => {
    if (isLoadingMatches) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      );
    }

    if (matchError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>{matchError}</Alert>
      );
    }

    if (!matchingProfiles || matchingProfiles.length === 0) {
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
          textAlign: 'center',
          boxShadow: '0px 0px 2px 0px rgba(0, 255, 157, 1)'
        }}>
          <PersonSearchIcon sx={{ fontSize: 48, color: 'rgba(0, 255, 157, 1)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'black', fontWeight: 600, mb: 1 }}>
            No Matching Candidates Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'black', maxWidth: '400px' }}>
            We couldn't find any candidates that match your job requirements. Try adjusting your filters or requirements to find more matches.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {matchingProfiles.slice(0, displayCount).map((candidate: MatchingCandidate) => (
          <MatchCard key={candidate?.candidateId?._id || `temp-${Math.random()}`}>
            {/* Header Section */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3,
              pb: 2,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Avatar */}
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
                  {candidate?.candidateId?.username ? candidate.candidateId.username.charAt(0).toUpperCase() : '?'}
                </Box>
                {/* User Info */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ color: 'black', fontWeight: 600 }}>
                      {candidate?.candidateId?.username || 'Anonymous'}
                    </Typography>
                    {candidate?.candidateId?.isVerified && (
                      <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#4ade80',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <StarIcon sx={{ fontSize: 12, color: '#000' }} />
                      </Box>
                    )}
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#4ade80',
                      ml: 1
                    }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'black' }}>
                    {candidate?.candidateId?.email || 'No email provided'}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: 'black',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {candidate?.candidateId?.role || 'Role not specified'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: "10px" }}>
                {/* Current Bid */}
                <Box sx={{
                  background: 'rgba(0, 255, 157, 1)',
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
                    {candidate?.finalBid || 0}$
                  </Typography>
                  <Typography variant="caption" sx={{

                    color: 'black',
                    fontSize: '0.7rem'
                  }}>
                    Current Bid
                  </Typography>
                </Box>
                {/* Match Score */}
                <Box sx={{
                  background: 'rgba(0, 255, 157, 1)',
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
                    {candidate?.score || 0}%
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: 'black',
                    fontSize: '0.7rem'
                  }}>
                    Match Score
                  </Typography>
                </Box>
              </Box>

            </Box>
            {/* Skills Section */}
            < Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{
                color: 'black',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  background: 'rgba(0, 255, 157, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <StarIcon sx={{ fontSize: 16, color: 'black' }} />
                </Box>
                Matched Skills
              </Typography>
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                // border: '1px solid black',
                '& > *': {
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '200px'
                }
              }}>
                {(candidate?.matchedSkills || []).map((skill) => (
                  <Box
                    key={skill?._id || `skill-${Math.random()}`}
                    sx={{
                      backgroundColor: 'rgba(0, 255, 157, 1)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'black',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: 'black', fontWeight: 500 }}>
                        {skill?.name || 'Unnamed Skill'}
                      </Typography>
                      <Chip
                        label={skill?.experienceLevel || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(2,226,255,0.1)',
                          color: 'black',
                          height: '20px'
                        }}
                      />
                    </Box>
                    <Box sx={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${((skill?.proficiencyLevel || 0) / 5) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #02E2FF 0%, #00FFC3 100%)'
                      }} />
                    </Box>
                    {skill?.ScoreTest && (
                      <Typography variant="caption" sx={{
                        color: 'rgba(255,255,255,0.5)',
                        display: 'block',
                        mt: 1,
                        textAlign: 'right'
                      }}>
                        Test Score: {skill.ScoreTest}%
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
            {/* Required Skills Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{
                color: 'black',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  background: 'rgba(0, 255, 157, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WorkIcon sx={{ fontSize: 16, color: 'black' }} />
                </Box>
                Required Skills
              </Typography>
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {(candidate?.requiredSkills || []).map((skill) => (
                  <Chip
                    key={skill?._id || `req-skill-${Math.random()}`}
                    label={`${skill?.name || 'Unnamed'} (${skill?.level || 'N/A'})`}
                    size="small"
                    sx={{
                      background: 'rgba(0, 255, 157, 1)', color: 'black',
                      '& .MuiChip-label': {
                        px: 2
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
              mt: 'auto',
              pt: 2,
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<EmailIcon />}
                component="a"
                href={`mailto:${candidate?.candidateId?.email}`}
                sx={{
                  background: 'rgba(0, 255, 157, 1)',
                  color: '#ffffff',
                  '&:hover': {
                    background: 'rgba(0, 255, 157, 1)',
                  }
                }}
                disabled={!candidate?.candidateId?.email}
              >
                Contact
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AttachMoneyIcon />}
                onClick={() => handleBidDialogOpen(candidate)}
                sx={{

                  borderColor: 'rgba(0, 255, 157, 1)',
                  color: 'black',
                  '&:hover': {
                    borderColor: '#02E2FF',
                    backgroundColor: 'rgba(0, 255, 157, 1)'
                  }
                }}
                disabled={!candidate?.candidateId?._id || !selectedJob}
              >
                Place Bid
              </Button>
            </Box>
          </MatchCard >
        ))}

        {
          matchingProfiles.length > displayCount && (
            <Button
              variant="outlined"
              onClick={() => setDisplayCount(prev => prev + 3)}
              sx={{
                mt: 2,
                borderColor: 'rgba(2,226,255,0.5)',
                color: '#02E2FF',
                '&:hover': {
                  borderColor: '#02E2FF',
                  backgroundColor: 'rgba(2,226,255,0.1)'
                }
              }}
            >
              Show More
            </Button>
          )
        }
      </Box >
    );
  };

  // First, add this new function after handleCopyForLinkedIn function

  const handleShareLinkedIn = async () => {
    if (!generatedJob) return;

    // If this exact job has already been shared, show dialog instead of alert
    if (hasSharedToLinkedIn) {
      setLinkedinWarningOpen(true);
      return;
    }

    try {
      // Check if we have a LinkedIn token in localStorage
      const token = localStorage.getItem('linkedin_token');

      if (!token) {
        // Open LinkedIn authorization if no token is available
        window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
        // Alert the user to try sharing again after connecting
        alert('Please connect to LinkedIn first. After connecting, try sharing again.');
        return;
      }

      // Prepare the post message - use the finalPost from generatedJob if available
      const message = generatedJob.linkedinPost?.finalPost ||
        `🚀 Exciting Opportunity: ${generatedJob.jobDetails.title}

🏢 About the Role:
${generatedJob.jobDetails.description}

🎯 Key Responsibilities:
${generatedJob.jobDetails.responsibilities.map(resp => `• ${resp}`).join('\n')}

📋 Requirements:
${generatedJob.jobDetails.requirements.map(req => `• ${req}`).join('\n')}

🔧 Required Skills:
${generatedJob.skillAnalysis.requiredSkills.map(skill => `• ${skill.name} (Level ${skill.level})`).join('\n')}

💼 Employment Type: ${generatedJob.jobDetails.employmentType}
📍 Location: ${generatedJob.jobDetails.location}
💰 Salary Range: ${generatedJob.jobDetails.salary.currency}${generatedJob.jobDetails.salary.min}-${generatedJob.jobDetails.salary.max}

✨ Ready to make a difference? Pass the test and join our team at https://staging.talentai.bid/test

#Hiring #TechJobs #${generatedJob.jobDetails.title.replace(/\s+/g, '')} #RemoteWork #TechCareers`;

      // Set a loading state
      setIsPosting(true);

      // First try the standard sharing endpoint
      console.log('Trying the standard LinkedIn sharing endpoint...');

      let success = false;

      // Try the main directShare endpoint first
      try {
        const shareResponse = await fetch('/api/linkedin/directShare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            message
          })
        });

        const shareResult = await shareResponse.json();

        if (shareResponse.ok && shareResult.success) {
          success = true;
          setLinkedinCopySuccess(true);
          setTimeout(() => setLinkedinCopySuccess(false), 2000);
          console.log('Successfully shared to LinkedIn with directShare!');
          // Mark this job as shared
          setHasSharedToLinkedIn(true);
        } else if (shareResponse.status === 403) {
          console.log('Permission issue with directShare, will try other methods...');
        } else {
          // Check for duplicate post error
          const isDuplicateError =
            (shareResponse.status === 400 || shareResponse.status === 409) &&
            (typeof shareResult === 'object' &&
              shareResult !== null &&
              ((shareResult.details &&
                (typeof shareResult.details.message === 'string' &&
                  (shareResult.details.message.toLowerCase().includes('duplicate') ||
                    shareResult.details.message.toLowerCase().includes('same content')))) ||
                (typeof shareResult.error === 'string' &&
                  (shareResult.error.toLowerCase().includes('duplicate') ||
                    shareResult.error.toLowerCase().includes('same content')))));

          if (isDuplicateError) {
            // Show specific message for duplicate posts
            alert('LinkedIn does not allow posting duplicate content. Please modify your job post or try again later with different content.');

            // Still consider this a partial success and don't show further errors
            success = true;
            // Mark this job as shared since we detected it was already shared
            setHasSharedToLinkedIn(true);
          } else {
            console.error('LinkedIn directShare failed:', shareResult);
          }
        }
      } catch (err) {
        console.error('Error using directShare:', err);
      }

      // If directShare failed, try the shareText endpoint which uses cookies
      if (!success) {
        try {
          console.log('Trying the shareText endpoint...');

          const shareTextResponse = await fetch('/api/linkedin/shareText', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message
            })
          });

          const shareTextResult = await shareTextResponse.json();

          if (shareTextResponse.ok && shareTextResult.success) {
            success = true;
            setLinkedinCopySuccess(true);
            setTimeout(() => setLinkedinCopySuccess(false), 2000);
            console.log('Successfully shared to LinkedIn with shareText!');
            // Mark this job as shared
            setHasSharedToLinkedIn(true);
          } else {
            // Check for duplicate post error
            const isDuplicateError =
              (shareTextResponse.status === 400 || shareTextResponse.status === 409) &&
              (typeof shareTextResult === 'object' &&
                shareTextResult !== null &&
                ((shareTextResult.details &&
                  (typeof shareTextResult.details.message === 'string' &&
                    (shareTextResult.details.message.toLowerCase().includes('duplicate') ||
                      shareTextResult.details.message.toLowerCase().includes('same content')))) ||
                  (typeof shareTextResult.error === 'string' &&
                    (shareTextResult.error.toLowerCase().includes('duplicate') ||
                      shareTextResult.error.toLowerCase().includes('same content')))));

            if (isDuplicateError) {
              // Show specific message for duplicate posts
              alert('LinkedIn does not allow posting duplicate content. Please modify your job post or try again later with different content.');

              // Still consider this a partial success and don't show further errors
              success = true;
              // Mark this job as shared since we detected it was already shared
              setHasSharedToLinkedIn(true);
            } else {
              console.error('LinkedIn shareText failed:', shareTextResult);
            }
          }
        } catch (err) {
          console.error('Error using shareText:', err);
        }
      }

      // If both previous methods failed, try the directShareSimple endpoint
      if (!success) {
        try {
          console.log('Trying the directShareSimple endpoint as last resort...');

          const simpleResponse = await fetch('/api/linkedin/directShareSimple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              message
            })
          });

          const simpleResult = await simpleResponse.json();

          if (simpleResponse.ok && simpleResult.success) {
            success = true;
            setLinkedinCopySuccess(true);
            setTimeout(() => setLinkedinCopySuccess(false), 2000);
            console.log('Successfully shared to LinkedIn with directShareSimple!');
            // Mark this job as shared
            setHasSharedToLinkedIn(true);
          } else if (simpleResponse.status === 401) {
            // Token expired - clear it and ask user to reconnect
            localStorage.removeItem('linkedin_token');
            alert('Your LinkedIn session has expired. Please reconnect to LinkedIn and try again.');
            window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
          } else if (simpleResponse.status === 403) {
            // Permission issue
            alert('LinkedIn requires additional permissions. Please reconnect with expanded permissions.');
            localStorage.removeItem('linkedin_token');
            window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
          } else {
            // Check for duplicate post error - LinkedIn returns a 400 status for duplicate posts
            // The error message might contain words like "duplicate" or "same content"
            const isDuplicateError =
              (simpleResponse.status === 400 || simpleResponse.status === 409) &&
              (typeof simpleResult === 'object' &&
                simpleResult !== null &&
                ((simpleResult.details &&
                  (typeof simpleResult.details.message === 'string' &&
                    (simpleResult.details.message.toLowerCase().includes('duplicate') ||
                      simpleResult.details.message.toLowerCase().includes('same content')))) ||
                  (typeof simpleResult.error === 'string' &&
                    (simpleResult.error.toLowerCase().includes('duplicate') ||
                      simpleResult.error.toLowerCase().includes('same content')))));

            if (isDuplicateError) {
              // Show specific message for duplicate posts
              alert('LinkedIn does not allow posting duplicate content. Please modify your job post or try again later with different content.');

              // Still consider this a partial success and don't show the reconnect dialog
              success = true;
              // Mark this job as shared since we detected it was already shared
              setHasSharedToLinkedIn(true);
            } else {
              // Other error
              console.error('LinkedIn sharing failed with all methods:', simpleResult);

              // Suggest reconnecting with expanded permissions
              if (window.confirm('Failed to share to LinkedIn. Would you like to try reconnecting with expanded permissions?')) {
                localStorage.removeItem('linkedin_token');
                window.open('/api/linkedin/auth/start', '_blank', 'width=600,height=700');
              } else {
                alert(`Unable to share to LinkedIn. As a fallback, the job post has been copied to your clipboard.`);
                navigator.clipboard.writeText(message);
              }
            }
          }
        } catch (error) {
          console.error('Error in directShareSimple:', error);
        }
      }

      // If all attempts failed but we didn't already handle reconnection, show generic error
      if (!success) {
        alert('Could not share to LinkedIn. The job post has been copied to your clipboard instead.');
        navigator.clipboard.writeText(message);
      }
    } catch (error) {
      console.error('Error in LinkedIn sharing flow:', error);
      alert('Error sharing to LinkedIn. Please try again or use the "Copy Text" button instead.');
      setIsPosting(false);
    } finally {
      setIsPosting(false);
    }
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

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Add function to fetch company profiles
  const fetchCompanyProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      setProfilesError(null);
      const token = localStorage.getItem('token');

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
    fetchCompanyProfiles();
  }, []);

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
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
            No Assessments Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'black', maxWidth: '400px' }}>
            There are no assessments available at the moment.
          </Typography>
        </Box>
      );
    }

    const visibleAssessments = companyProfiles.slice(0, displayedAssessments);
    const hasMore = companyProfiles.length > displayedAssessments;

    return (
      <>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                      <Typography>
                        {assessment.condidateId.userId.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#000' }}>
                    {new Date(assessment.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ color: '#000' }}>
                    {assessment.analysis.overallScore}%
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
                      onClick={() => handleViewAssessmentDetails(assessment)}
                      sx={{
                        backgroundColor: 'rgba(0, 255, 157, 1)',
                        borderColor: '',
                        color: 'black',
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
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setDisplayedAssessments(prev => prev + 10)}
              sx={{
                color: '#02E2FF',
                borderColor: '#02E2FF',
                '&:hover': {
                  borderColor: '#02E2FF',
                  backgroundColor: 'rgba(2, 226, 255, 0.04)'
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '1px solid rgba(2,226,255,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ color: 'black', borderBottom: '1px solid rgba(2,226,255,0.1)' }}>
        Assessment Details
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {selectedAssessment && (
          <Box sx={{ color: '#fff' }}>
            {/* Candidate Info */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>Candidate Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'black' }}>Skills</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {selectedAssessment.condidateId.skills.map((skill: any) => (
                      <Chip
                        key={skill._id}
                        label={`${skill.name} (${skill.experienceLevel})`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(0, 255, 157, 1)',
                          color: 'black',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'black' }}>Assessment Date</Typography>
                  <Typography sx={{ color: 'black' }}>{new Date(selectedAssessment.timestamp).toLocaleDateString()}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Assessment Results */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>Assessment Results</Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'black' }}>Overall Score</Typography>
                  <Typography sx={{ color: 'black' }}>{selectedAssessment.analysis.overallScore}%</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'black' }}>Job Match Status</Typography>
                  <Typography sx={{ color: 'black' }}>{selectedAssessment.analysis.jobMatch.status}</Typography>
                </Box>
              </Box>
            </Box>


            {/* Skill Analysis */}
            <Box sx={{ mb: 4, backgroundColor: 'white', borderRadius: '16px', padding: '16px', border: '2px solid rgba(0, 255, 157, 1)' }}>
              <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>Skill Analysis</Typography>
              {selectedAssessment.analysis.skillAnalysis.map((skill: any, index: number) => (
                <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'white', borderRadius: '8px' }}>
                  <Typography variant="subtitle1" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 1 }}>{skill.skillName}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: '#000' }}>Required Level</Typography>
                      <Typography sx={{ color: '#000' }}>{skill.requiredLevel}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: '#000' }}>Demonstrated Level</Typography>
                      <Typography sx={{ color: '#000' }}>{skill.demonstratedLevel}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: '#000' }}>Match Status</Typography>
                      <Typography sx={{ color: '#000' }}>{skill.match}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Recommendations */}
            <Box>
              <Typography variant="h6" sx={{ color: 'rgba(0, 255, 157, 1)', mb: 2 }}>Recommendations</Typography>
              <List>
                {selectedAssessment.analysis.recommendations.map((rec: string, index: number) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <ArrowForwardIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                    </ListItemIcon>
                    <ListItemText primary={rec} sx={{ color: 'black' }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(2,226,255,0.1)' }}>
        <Button
          onClick={() => setAssessmentModalOpen(false)}
          sx={{
            color: 'rgba(0, 255, 157, 1)',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 157, 1)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handleEdit = () => {
    if (!generatedJob || !generatedJob.jobDetails) return;
    setEditedJob({
      ...generatedJob,
      jobDetails: {
        ...generatedJob.jobDetails,
        salary: {
          ...generatedJob.jobDetails.salary
        }
      },
      skillAnalysis: {
        ...generatedJob.skillAnalysis,
        requiredSkills: [...generatedJob.skillAnalysis.requiredSkills]
      }
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleSave = () => {
    if (!editedJob || !editedJob.jobDetails) return;
    
    // Update the generatedJob with the edited job data
    setGeneratedJob({
      ...editedJob,
      skillAnalysis: {
        ...editedJob.skillAnalysis,
        requiredSkills: editedJob.skillAnalysis.requiredSkills,
        skillSummary: {
          ...editedJob.skillAnalysis.skillSummary,
          mainTechnologies: editedJob.skillAnalysis.requiredSkills.map((skill: { name: string; level: string; importance: string; category: string }) => skill.name)
        }
      },
      linkedinPost: {
        ...editedJob.linkedinPost,
        formattedContent: {
          ...editedJob.linkedinPost.formattedContent,
          skillsRequired: `💻 Required Skills: ${editedJob.skillAnalysis.requiredSkills.map((skill: { name: string; level: string; importance: string; category: string }) => skill.name).join(', ')}.`
        }
      }
    });
    setIsEditing(false);
    setEditedJob(null);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedJob || !editedJob.jobDetails) return;

    if (field === 'salary') {
      setEditedJob((prev: any) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          salary: {
            ...prev.jobDetails.salary,
            ...value
          }
        }
      }));
    } else {
      setEditedJob((prev: any) => ({
        ...prev,
        jobDetails: {
          ...prev.jobDetails,
          [field]: value
        }
      }));
    }
  };

  useEffect(() => {
    setLocalRequiredSkills(profile?.requiredSkills || []);
  }, [profile]);

  const getExperienceLevelFromNumber = (level: string | number): string => {
    const numLevel = typeof level === 'string' ? parseInt(level) : level;
    switch (numLevel) {
      case 1:
        return 'Entry Level';
      case 2:
        return 'Junior';
      case 3:
        return 'Mid Level';
      case 4:
        return 'Senior';
      case 5:
        return 'Expert';
      default:
        return 'Entry Level';
    }
  };

  const handleEditSkill = (index: number, skill: { name: string; level: string; importance: string; category: string }) => {
    setEditingSkillIndex(index);
    setEditingSkillName(skill.name);
  };

  const handleSaveSkill = () => {
    if (editingSkillIndex === null || !editedJob) return;
    
    const updatedSkills = [...editedJob.skillAnalysis.requiredSkills];
    updatedSkills[editingSkillIndex] = {
      ...updatedSkills[editingSkillIndex],
      name: editingSkillName.trim(),
      category: editingSkillName.includes('React') || editingSkillName.includes('JavaScript') ? 'Frontend' :
        editingSkillName.includes('Git') ? 'Version Control' :
          'General'
    };

    setEditedJob({
      ...editedJob,
      skillAnalysis: {
        ...editedJob.skillAnalysis,
        requiredSkills: updatedSkills
      }
    });
    setEditingSkillIndex(null);
    setEditingSkillName('');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: 'white',

      py: 4,
    }}>
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

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mb: 3,
          position: 'relative'
        }}>
          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            variant="contained"
            sx={{
              background: 'rgba(0, 255, 157, 1)',
              color: '#0f172a',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(0, 255, 157, 1)',
                boxShadow: '0 4px 12px rgba(2, 226, 255, 0.3)'
              },
              textTransform: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(2, 226, 255, 0.2)'
            }}
          >
            Logout
          </Button>
        </Box>

        <ProfileHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#000000' }}>
                {profile?.companyDetails?.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, color: '#000000' }}>
                {profile?.type} • {profile?.userId.role}
              </Typography>
            </Box>

          </Box>
          <StatsContainer>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#000000' }}>
                Industry
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                {profile?.companyDetails?.industry}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#000000' }}>
                Company Size
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                {profile?.companyDetails?.size}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#000000' }}>
                Location
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                {profile?.companyDetails?.location}
              </Typography>
            </StatCard>
          </StatsContainer>
        </ProfileHeader>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <CompanyInfoCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionTitle>Company Information</SectionTitle>
                {profile?.userId.isVerified && (
                  <Chip
                    label="Verified Company"
                    color="success"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  />
                )}
              </Box>

              <InfoRow>
                <BusinessIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                <Typography sx={{ color: '#000000', fontWeight: 500 }}>{profile?.companyDetails?.name}</Typography>
              </InfoRow>

              <InfoRow>
                <CategoryIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                <Typography sx={{ color: '#000000', fontWeight: 500 }}>{profile?.companyDetails?.industry}</Typography>
              </InfoRow>

              <InfoRow>
                <GroupsIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                <Typography sx={{ color: '#000000', fontWeight: 500 }}>{profile?.companyDetails?.size} employees</Typography>
              </InfoRow>

              <InfoRow>
                <LocationOnIcon sx={{ color: 'rgba(0, 255, 157, 1)' }} />
                <Typography sx={{ color: '#000000', fontWeight: 500 }}>{profile?.companyDetails?.location}</Typography>
              </InfoRow>
            </CompanyInfoCard>

            <StyledCard>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}>
                <SectionTitle>Required Skills</SectionTitle>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {localRequiredSkills.map((skill, index) => (
                  <SkillChip
                    key={index}
                    label={`${skill} (${generatedJob?.jobDetails?.experienceLevel || 'Entry Level'})`}
                    onDelete={isEditing ? () => {
                      setLocalRequiredSkills(localRequiredSkills.filter((_, i) => i !== index));
                    } : undefined}
                    deleteIcon={isEditing ? <DeleteIcon sx={{ color: 'red' }} /> : undefined}
                  />
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                {/* <Typography variant="subtitle2" sx={{ color: 'black', mb: 1 }}>
                  Required Experience Level
                </Typography> */}
                <SectionTitle> Required Experience</SectionTitle>

                <Chip
                  label={profile?.requiredExperienceLevel}
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 255, 157, 1)',
                    color: 'black',
                    fontWeight: 600
                  }}
                />
              </Box>
            </StyledCard>
          </Box>

          <Box sx={{ flex: 2 }}>
            {!selectedJob ? (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ color: 'black', fontWeight: 700 }}>
                    My Job Posts
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setJobPostDialog(true)}
                    sx={{
                      background: 'rgba(0, 255, 157, 1)',
                      color: 'black',
                      '&:hover': {
                        background: 'rgba(0, 255, 157, 1)',
                      },
                    }}
                  >
                    Post New Job
                  </Button>
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
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    width: '100%'
                  }}>
                    {myJobs.slice(0, displayCount).map((job: any) => (
                      <Box key={job._id} sx={{
                        width: '100%',
                        display: 'flex',
                        background: 'white',

                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}>
                        <JobCard sx={{
                          width: '100%',
                          maxWidth: '100%',
                          flex: '1 1 100%'
                        }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WorkIcon sx={{ color: 'rgba(0, 255, 157, 1)', fontSize: 28 }} />
                              <Typography variant="h6" sx={{ color: '#000000', fontWeight: 700 }}>
                                {job.jobDetails.title}
                              </Typography>
                            </Box>
                            {job.createdAt && (
                              <Typography variant="caption" sx={{ color: 'black', fontWeight: 500, ml: 2 }}>
                                Posted: {new Date(job.createdAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                          {/* Meta Chips */}
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            <Chip
                              icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
                              label={job.jobDetails.location}
                              size="small"
                              sx={{ backgroundColor: 'rgba(0, 255, 157, 1)', color: 'black', fontWeight: 600 }}
                            />
                            <Chip
                              label={job.jobDetails.employmentType}
                              size="small"
                              sx={{ backgroundColor: 'rgba(0, 255, 157, 1)', color: 'black', fontWeight: 600 }}
                            />
                            <Chip
                              label={`${job.jobDetails.salary.currency}${job.jobDetails.salary.min}-${job.jobDetails.salary.max}`}
                              size="small"
                              sx={{ backgroundColor: 'rgba(0, 255, 157, 1)', color: 'black', fontWeight: 600 }}
                            />
                          </Box>
                          {/* Description */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'black ',
                              mb: 2,
                              minHeight: 40,
                              fontWeight: 500,
                              lineHeight: 1.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
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
                                  backgroundColor: 'rgba(0, 255, 157, 1)',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.87rem',
                                  letterSpacing: 0.2,
                                  px: 1,
                                }}
                              />
                            ))}
                          </Box>
                          {/* Actions */}
                          <Box sx={{ display: 'flex', gap: 2, mt: 'auto', pt: 2, borderTop: '1px solid rgba(2,226,255,0.08)' }}>
                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => {
                                setSelectedJob(job._id);
                                handleFilterDialogOpen();
                              }}
                              sx={{
                                borderColor: 'rgba(0, 255, 157, 1)',
                                color: 'rgba(0, 255, 157, 1)',
                                '&:hover': {
                                  borderColor: 'rgba(0, 255, 157, 1)',
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
                                borderRadius: '8px',
                                textTransform: 'none',
                                letterSpacing: 0.5,
                                boxShadow: 'none',
                                '&:hover': {
                                  borderColor: '#ff3b30',
                                  background: 'rgba(255,59,48,0.08)'
                                },
                              }}
                              onClick={() => {
                                setJobToDelete(job._id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </JobCard>
                      </Box>
                    ))}

                    {myJobs.length > displayCount && (
                      <Button
                        variant="contained"
                        onClick={() => setDisplayCount(prev => prev + 3)}
                        sx={{
                          backgroundColor: 'rgba(0, 255, 157, 1)',
                          mt: 2,
                          borderColor: 'rgba(0, 255, 157, 1)',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'rgba(0, 255, 157, 1)',
                          }
                        }}
                      >
                        Show More
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600 }}>
                    Matching Candidates
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<WorkIcon />}
                      onClick={() => setSelectedJob('')}
                      sx={{
                        color: 'rgba(0, 255, 157, 1)',
                        borderColor: 'rgba(0, 255, 157, 1)',

                      }}
                    >
                      Return to Jobs
                    </Button>

                  </Box>
                </Box>
                {renderMatchingProfiles()}
              </Box>
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
            <Button
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
            </Button>
          </DialogActions>
        </Dialog>

        {renderJobPostDialog()}

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
                {postedJobId
                  ? `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000'}/testjob/${postedJobId}`
                  : ''}
              </Typography>
              <Tooltip title={copySuccess ? 'Copied!' : 'Copy'}>
                <IconButton
                  onClick={() => {
                    if (!postedJobId) return;
                    const url = `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000'}/testjob/${postedJobId}`;
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
                    router.push('/dashboardCompany');
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

        {/* Add Company Profiles Section */}
        <Box sx={{ mt: 6, mb: 6 }}>
          <Typography variant="h5" sx={{ color: 'black', fontWeight: 700, mb: 3 }}>
            Company Profiles & Assessments
          </Typography>
          {renderCompanyProfilesTable()}
        </Box>
      </Container>
    </Box>
  );
}

export default DashboardCompany;