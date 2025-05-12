import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile, clearProfile } from '../store/features/profileSlice';
import { AppDispatch } from '../store/store';
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

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'rgba(30, 41, 59, 0.7)',
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
  color: '#ffffff',
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
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
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
    background: 'radial-gradient(circle at top right, rgba(2,226,255,0.1) 0%, transparent 60%)',
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
  border: '1px solid rgba(255,255,255,0.1)'
}));

const CompanyInfoCard = styled(Box)(({ theme }) => ({
  background: 'rgba(30, 41, 59, 0.6)',
  borderRadius: '16px',
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
  backgroundColor: 'rgba(2, 226, 255, 0.1)',
  color: '#02E2FF',
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
  background: 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.1)',
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
  const { profile, loading, error } = useSelector(selectProfile);
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
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [bidHistory] = useState<BidHistoryItem[]>([
    {
      candidate: {
        _id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        role: 'Frontend Developer',
      },
      status: 'win',
      bidAmount: 12000,
      jobTitle: 'React Developer',
      createdAt: '2024-06-01T10:00:00Z',
    },
    {
      candidate: {
        _id: '2',
        username: 'jane_smith',
        email: 'jane@example.com',
        role: 'Backend Developer',
      },
      status: 'lose',
      bidAmount: 11000,
      jobTitle: 'Node.js Engineer',
      createdAt: '2024-06-02T14:30:00Z',
    },
    {
      candidate: {
        _id: '3',
        username: 'alice_wong',
        email: 'alice@example.com',
        role: 'Full Stack Developer',
      },
      status: 'win',
      bidAmount: 13000,
      jobTitle: 'Full Stack Engineer',
      createdAt: '2024-06-03T09:15:00Z',
    },
  ]);
  const [isLoadingBids] = useState(false);
  const [bidError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch matching profiles
  const fetchMatchingProfiles = async () => {
    const token = Cookies.get('api_token');

    if (!token) {
      setMatchError('Authentication token not found. Please log in again.');
      setIsLoadingMatches(false);
      return;
    }

    try {
      setIsLoadingMatches(true);
      setMatchError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}evaluation/match-profiles-with-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch matching profiles (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setMatchingProfiles(data.matches || []);
      } else {
        throw new Error(data.error || 'Failed to fetch matches');
      }
    } catch (err) {
      console.error('Error fetching matching profiles:', err);
      setMatchError(err instanceof Error ? err.message : 'An error occurred while fetching matches');
    } finally {
      setIsLoadingMatches(false);
      setIsInitialLoad(false);
    }
  };

  // Fetch matching profiles on component mount
  useEffect(() => {
    fetchMatchingProfiles();
  }, []);

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

  const handleLogout = () => {
    try {
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

      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  // Add this function to handle job generation
  const handleGenerateJob = async (type: 'quick' | 'detailed') => {
    try {
      setGenerationType(type);
      if (type === 'quick') {
        setIsQuickGenerating(true);
      } else {
        setIsDetailedGenerating(true);
      }
      setJobPostError(null);
      
      const token = Cookies.get('api_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}linkedinPost/generate-job-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          description: jobDescription,
          type: type // Send the generation type to the API
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

  // Add this function to handle job posting
  const handleCopyForLinkedIn = () => {
    if (generatedJob) {
      const linkedinFormat = `🚀 Exciting Opportunity: ${generatedJob.jobDetails.title}

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

      navigator.clipboard.writeText(linkedinFormat)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy LinkedIn format: ', err);
        });
    }
  };

  const handleCopyJobData = () => {
    if (generatedJob) {
      const jobData = {
        jobDetails: generatedJob.jobDetails,
        skillAnalysis: generatedJob.skillAnalysis,
        linkedinPost: generatedJob.linkedinPost
      };

      navigator.clipboard.writeText(JSON.stringify(jobData, null, 2))
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Update the saveJob function to handle the job data properly
  const saveJob = async () => {
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
          requiredSkills: generatedJob.skillAnalysis.requiredSkills.map((skill: any) => ({
            name: skill.name,
            level: skill.level.toString(),
            importance: "Required",
            category: skill.name.includes('React') || skill.name.includes('JavaScript') ? 'Frontend' : 
                     skill.name.includes('Git') ? 'Version Control' : 
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
            mainTechnologies: generatedJob.skillAnalysis.requiredSkills.map((skill: any) => skill.name),
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
            skillsRequired: `💻 Required Skills: ${generatedJob.skillAnalysis.requiredSkills.map((skill: any) => skill.name).join(', ')}.`,
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

💻 Required Skills: ${generatedJob.skillAnalysis.requiredSkills.map((skill: any) => skill.name).join(', ')}.

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
        console.log('Job saved successfully:', savedJob);
        
        // Close the dialog after successful save
        setJobPostDialog(false);
        
        // Reset the form
        setJobDescription('');
        setGeneratedJob(undefined);
        
      } catch (error) {
        console.error('Error saving job:', error);
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

  const renderFilterDialog = () => (
    <Dialog
      open={filterDialog}
      onClose={() => setFilterDialog(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }}
    >
      <DialogTitle sx={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: '#ffffff'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Filter by Job</Typography>
          <IconButton
            onClick={() => setFilterDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff' }}>
          Select Job
        </Typography>
        {isLoadingJobs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} sx={{ color: '#02E2FF' }} />
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
              color: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.2)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#02E2FF'
              },
              backgroundColor: 'rgba(30,41,59,0.98)'
            }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(30,41,59,1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(2,226,255,0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(2,226,255,0.3)',
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
              <MenuItem key={job._id} value={job._id} sx={{ backgroundColor: 'rgba(30,41,59,0.98)' }}>
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
            color: 'rgba(255,255,255,0.8)',
            mr: 1
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleFilterApply}
          sx={{
            background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
            }
          }}
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add this render function for bid history
  const renderBidHistory = () => (
    <StyledCard sx={{ mt: 4 }}>
      <SectionTitle>Bid History</SectionTitle>
      {isLoadingBids ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: '#02E2FF' }} />
        </Box>
      ) : bidError ? (
        <Alert severity="error" sx={{ mb: 2 }}>{bidError}</Alert>
      ) : bidHistory.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>No bid history found.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bidHistory.map((bid) => (
            <Box key={bid.candidate._id + bid.createdAt} sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(30,41,59,0.5)',
              borderRadius: '10px',
              p: 2,
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>{bid.candidate.username}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{bid.candidate.email}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{bid.jobTitle}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={bid.status === 'win' ? 'Won' : 'Lost'}
                  color={bid.status === 'win' ? 'success' : 'error'}
                  sx={{ fontWeight: 700 }}
                />
                <Typography sx={{ color: '#02E2FF', fontWeight: 600 }}>
                  ${bid.bidAmount}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                  {new Date(bid.createdAt).toLocaleDateString()}
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
          background: '#17203D',
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
        color: '#fff', 
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
              backgroundColor: 'rgba(2,226,255,0.1)', 
              color: '#02E2FF',
              height: '20px'
            }} 
          />
        </Box>
        <IconButton
          onClick={() => setJobPostDialog(false)}
          sx={{ 
            color: 'rgba(255,255,255,0.5)',
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
            color: '#fff', 
            mb: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            Job Description
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.7)', 
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
            sx={{
              flex: 1,
              minHeight: { xs: '200px', sm: '300px', md: '400px' },
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                height: '100%',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(2,226,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#02E2FF',
                },
                '& textarea': {
                  height: '100% !important',
                }
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              fullWidth
              onClick={() => handleGenerateJob('quick')}
              disabled={!jobDescription.trim() || isQuickGenerating || isDetailedGenerating}
              variant="contained"
              sx={{
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                borderRadius: '12px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              {isQuickGenerating ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                  <span>Quick Generating...</span>
                </Box>
              ) : (
                'Quick Generate'
              )}
            </Button>

            <Button
              fullWidth
              onClick={() => handleGenerateJob('detailed')}
              disabled={!jobDescription.trim() || isQuickGenerating || isDetailedGenerating}
              variant="outlined"
              sx={{
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: '#02E2FF',
                borderColor: 'rgba(2,226,255,0.5)',
                borderRadius: '12px',
                '&:hover': {
                  borderColor: '#02E2FF',
                  background: 'rgba(2,226,255,0.1)',
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              {isDetailedGenerating ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#02E2FF' }} />
                  <span>Detailed Analysis...</span>
                </Box>
              ) : (
                'Detailed Analysis'
              )}
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
          backgroundColor: 'rgba(0,0,0,0.2)'
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
                backgroundColor: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WorkIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Generated job post will appear here
              </Typography>
              <Typography variant="body2" sx={{ 
                maxWidth: '80%',
                fontSize: { xs: '0.875rem', sm: '1rem' }
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
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#02E2FF', 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                  >
                    {generatedJob.jobDetails.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<LinkedInIcon />}
                      onClick={handleShareLinkedIn}
                      disabled={isPosting}
                      sx={{
                        background: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #006097 0%, #0077B5 100%)',
                        }
                      }}
                    >
                      {isPosting ? 'Sharing...' : linkedinCopySuccess ? 'Shared!' : 'Share on LinkedIn'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyForLinkedIn}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '&:hover': {
                          borderColor: '#00A0DC',
                          backgroundColor: 'rgba(0,160,220,0.1)'
                        }
                      }}
                    >
                      {copySuccess ? 'Copied!' : 'Copy Text'}
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<LocationOnIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                    label={generatedJob.jobDetails.location}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  />
                  <Chip
                    label={generatedJob.jobDetails.employmentType}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  />
                  <Chip
                    label={`${generatedJob.jobDetails.salary.currency}${generatedJob.jobDetails.salary.min}-${generatedJob.jobDetails.salary.max}`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: '#00FFC3', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Overview
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  {generatedJob.jobDetails.description}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: '#00FFC3', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Requirements
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
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
                        backgroundColor: 'rgba(2,226,255,0.1)',
                        color: '#02E2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {index + 1}
                      </Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {req}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: '#00FFC3', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Responsibilities
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
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
                        backgroundColor: 'rgba(2,226,255,0.1)',
                        color: '#02E2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {index + 1}
                      </Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {resp}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ 
                  color: '#00FFC3', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {generatedJob.skillAnalysis.requiredSkills.map((skill: RequiredSkill, index: number) => (
                    <Chip
                      key={index}
                      label={`${skill.name} (Level ${skill.level})`}
                      sx={{
                        backgroundColor: 'rgba(2,226,255,0.1)',
                        color: '#02E2FF',
                        '& .MuiChip-label': {
                          px: 2
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ 
                  color: '#00FFC3', 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Application Link
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'rgba(2,226,255,0.1)',
                  borderRadius: '12px',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <LinkIcon sx={{ color: '#02E2FF' }} />
                  <Typography 
                    component="a" 
                    href="https://staging.talentai.bid/test" 
                    target="_blank"
                    sx={{ 
                      color: '#02E2FF',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Pass the test at: https://staging.talentai.bid
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={saveJob}
                sx={{
                  mt: 4,
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  borderRadius: '12px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  }
                }}
              >
                Save Job
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );

  // Update the renderMatchingProfiles function
  const renderMatchingProfiles = () => {
    if (!selectedJob) {
      return (
        <Box 
          sx={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '12px',
            p: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            background: 'rgba(2,226,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <WorkIcon sx={{ fontSize: 32, color: '#02E2FF' }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#02E2FF',
              mb: 1
            }}
          >
            Select a Job to View Matches
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, maxWidth: '400px' }}>
            Click the "Filter by Job" button above to select a job posting and view matching candidates.
          </Typography>
          <Button
            variant="outlined"
            onClick={handleFilterDialogOpen}
            startIcon={<AddIcon />}
            sx={{
              borderColor: 'rgba(2,226,255,0.5)',
              color: '#02E2FF',
              '&:hover': {
                borderColor: '#02E2FF',
                backgroundColor: 'rgba(2,226,255,0.1)'
              }
            }}
          >
            Filter by Job
          </Button>
        </Box>
      );
    }

    if (matchError) {
      return (
        <Box 
          sx={{ 
            backgroundColor: 'rgba(255,59,48,0.1)', 
            borderRadius: '12px',
            p: 3,
            border: '1px solid rgba(255,59,48,0.2)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ff3b30',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ErrorIcon /> Error Loading Profiles
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {matchError}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setIsInitialLoad(true);
              fetchMatchingProfiles();
            }}
            sx={{
              mt: 2,
              borderColor: 'rgba(255,59,48,0.5)',
              color: '#ff3b30',
              '&:hover': {
                borderColor: '#ff3b30',
                backgroundColor: 'rgba(255,59,48,0.1)'
              }
            }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    if (!isLoadingMatches && (!matchingProfiles || matchingProfiles.length === 0)) {
      return (
        <Box 
          sx={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '12px',
            p: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#02E2FF',
              mb: 1
            }}
          >
            No Matches Found
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            We couldn't find any matching profiles for your requirements at the moment.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setIsInitialLoad(true);
              fetchMatchingProfiles();
            }}
            sx={{
              borderColor: 'rgba(2,226,255,0.5)',
              color: '#02E2FF',
              '&:hover': {
                borderColor: '#02E2FF',
                backgroundColor: 'rgba(2,226,255,0.1)'
              }
            }}
          >
            Refresh Matches
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {matchingProfiles
          .filter(candidate => candidate?.candidateId?.username && candidate.candidateId.username !== 'Anonymous')
          .map((candidate) => (
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
                  color: '#02E2FF'
                }}>
                  {candidate?.candidateId?.username ? candidate.candidateId.username.charAt(0).toUpperCase() : '?'}
                </Box>
                {/* User Info */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
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
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {candidate?.candidateId?.email || 'No email provided'}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {candidate?.candidateId?.role || 'Role not specified'}
                  </Typography>
                </Box>
              </Box>
              {/* Match Score */}
              <Box sx={{
                background: 'linear-gradient(135deg, rgba(2,226,255,0.1) 0%, rgba(0,255,195,0.1) 100%)',
                padding: '8px',
                borderRadius: '8px',
                minWidth: '70px',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#02E2FF',
                  fontSize: '1.25rem',
                  lineHeight: 1
                }}>
                  {candidate?.score || 0}%
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.7rem'
                }}>
                  Match Score
                </Typography>
              </Box>
            </Box>
            {/* Skills Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                color: '#ffffff', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  background: 'rgba(2,226,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <StarIcon sx={{ fontSize: 16, color: '#02E2FF' }} />
                </Box>
                Matched Skills
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                '& > *': {
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '200px'
                }
              }}>
                {(candidate?.matchedSkills || []).map((skill) => (
                  <Box
                    key={skill?._id || `skill-${Math.random()}`}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>
                        {skill?.name || 'Unnamed Skill'}
                      </Typography>
                      <Chip
                        label={skill?.experienceLevel || 'N/A'}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(2,226,255,0.1)',
                          color: '#02E2FF',
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
                color: '#ffffff', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '6px',
                  background: 'rgba(2,226,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WorkIcon sx={{ fontSize: 16, color: '#02E2FF' }} />
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
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.8)',
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
                sx={{
                  background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                  color: '#ffffff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                  }
                }}
                disabled={!candidate?.candidateId?.email}
              >
                Contact
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PersonIcon />}
                sx={{
                  borderColor: 'rgba(2,226,255,0.5)',
                  color: '#02E2FF',
                  '&:hover': {
                    borderColor: '#02E2FF',
                    backgroundColor: 'rgba(2,226,255,0.1)'
                  }
                }}
                disabled={!candidate?.candidateId?._id}
              >
                View Profile
              </Button>
            </Box>
          </MatchCard>
        ))}
      </Box>
    );
  };

  // First, add this new function after handleCopyForLinkedIn function

  const handleShareLinkedIn = async () => {
    if (!generatedJob) return;
    
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
        } else if (shareResponse.status === 403) {
          console.log('Permission issue with directShare, will try other methods...');
        } else {
          console.error('LinkedIn directShare failed:', shareResult);
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
          } else {
            console.error('LinkedIn shareText failed:', shareTextResult);
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

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 50%)
        `,
      py: 4
    }}>
      <Container maxWidth="lg">
        {renderFilterDialog()}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setJobPostDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
              },
            }}
          >
            Post New Job
          </Button>
        </Box>
        
        <ProfileHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
                {profile?.companyDetails?.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, color: '#ffffff' }}>
                {profile?.type} • {profile?.userId.role}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: 'rgba(255,255,255,0.9)',
                borderColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.1)'
                },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Logout
            </Button>
          </Box>
          <StatsContainer>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Industry
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {profile?.companyDetails?.industry}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Company Size
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                {profile?.companyDetails?.size}
              </Typography>
            </StatCard>
            <StatCard>
              <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
                Location
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
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
                <BusinessIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile?.companyDetails?.name}</Typography>
              </InfoRow>

              <InfoRow>
                <CategoryIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile?.companyDetails?.industry}</Typography>
              </InfoRow>

              <InfoRow>
                <GroupsIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile?.companyDetails?.size} employees</Typography>
              </InfoRow>

              <InfoRow>
                <LocationOnIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile?.companyDetails?.location}</Typography>
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
                {profile?.requiredSkills.map((skill, index) => (
                  <SkillChip key={index} label={skill} />
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Required Experience Level
                </Typography>
                <Chip
                  label={profile?.requiredExperienceLevel}
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: 'rgba(2, 226, 255, 0.1)',
                    color: '#02E2FF',
                    fontWeight: 600
                  }}
                />
              </Box>
            </StyledCard>
          </Box>

          <Box sx={{ flex: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                Matching Candidates
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleFilterDialogOpen}
                sx={{
                  color: '#02E2FF',
                  borderColor: 'rgba(2,226,255,0.5)',
                  '&:hover': {
                    borderColor: '#02E2FF',
                    background: 'rgba(2,226,255,0.1)'
                  }
                }}
              >
                Filter by Job
              </Button>
            </Box>
            {renderMatchingProfiles()}
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
      </Container>
    </Box>
  );
}

export default DashboardCompany; 