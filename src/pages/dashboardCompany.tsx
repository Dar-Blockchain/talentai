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
  candidateId: string;
  name: string;
  score: number;
  matchedSkills: Array<{
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
  }>;
  requiredSkills: Array<{
    name: string;
    level: string;
    importance: string;
    category: string;
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

  // Fetch matching profiles
  const fetchMatchingProfiles = async () => {
    const token = Cookies.get('api_token');

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
      throw new Error('Failed to fetch matching profiles');
    }

    const data = await response.json();
    if (data.success) {
      setMatchingProfiles(data.matches);
    } else {
      throw new Error(data.error || 'Failed to fetch matches');
    }
  } catch (err) {
    setMatchError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsLoadingMatches(false);
  }
};

// Fetch matching profiles on component mount
useEffect(() => {
  // fetchMatchingProfiles();
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
const handleGenerateJob = async () => {
  try {
    setIsGenerating(true);
    setJobPostError(null);
    
    const token = Cookies.get('api_token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}linkedinPost/generate-job-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ description: jobDescription })
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
          callToAction: "✨ Ready to make a difference? Apply now and let's build something amazing together."
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

✨ Ready to make a difference? Apply now and let's build something amazing together.

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
    setIsGenerating(false);
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

#hiring #jobs #career #opportunity

Interested candidates can apply through our platform or send their resumes directly.`;

    navigator.clipboard.writeText(linkedinFormat)
      .then(() => {
        setLinkedinCopySuccess(true);
        setTimeout(() => setLinkedinCopySuccess(false), 2000);
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
          callToAction: "✨ Ready to make a difference? Apply now and let's build something amazing together."
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

✨ Ready to make a difference? Apply now and let's build something amazing together.

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
            }
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
                      backgroundColor: 'rgba(2,226,255,0.1)',
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
            <MenuItem key={job._id} value={job._id}>
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

if (loading) {
  return (
    <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#02E2FF' }} />
    </Container>
  );
}

if (error) {
  return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
    </Container>
  );
}

if (!profile) {
  return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="info" sx={{ borderRadius: '12px' }}>No profile data available</Alert>
    </Container>
  );
}

// Add this before the return statement
const renderMatchingProfiles = () => {
  console.log('Current matching profiles:', matchingProfiles);

  if (isLoadingMatches) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress sx={{ color: '#02E2FF' }} />
      </Box>
    );
  }

  if (matchError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {matchError}
      </Alert>
    );
  }

  if (!matchingProfiles || matchingProfiles.length === 0) {
    return (
      <Alert severity="info" sx={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        color: '#ffffff',
        border: '1px solid rgba(255,255,255,0.1)',
        '& .MuiAlert-icon': {
          color: '#02E2FF'
        }
      }}>
        No matching profiles found for this job posting. Check back later for potential matches.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {matchingProfiles.map((candidate) => (
        <CandidateCard key={candidate.candidateId}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                {candidate.name}
              </Typography>
              <Typography variant="body2" sx={{
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <LocationOnIcon sx={{ fontSize: 16 }} />
                Candidate ID: {candidate.candidateId}
              </Typography>
            </Box>
            <Chip
              label={`${candidate.score}%`}
              sx={{
                background: 'linear-gradient(135deg, rgba(2,226,255,0.15) 0%, rgba(0,255,195,0.15) 100%)',
                color: '#02E2FF',
                fontWeight: 600,
                borderRadius: '8px'
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 1 }}>
              Matched Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {candidate.matchedSkills.map((skill, index) => (
                <SkillChip
                  key={index}
                  label={`${skill.name} (${skill.experienceLevel})`}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #02E2FF 0%, #00FFC3 100%)',
                color: '#ffffff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00C3FF 0%, #00E2B8 100%)',
                }
              }}
            >
              Contact
            </Button>
          </Box>
        </CandidateCard>
      ))}
    </Box>
  );
};

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
        <Button
          fullWidth
          onClick={handleGenerateJob}
          disabled={!jobDescription.trim() || isGenerating}
          variant="contained"
          sx={{
            mt: 2,
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
          {isGenerating ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: '#fff' }} />
              <span>Generating...</span>
            </Box>
          ) : (
            'Generate Job Post'
          )}
        </Button>
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
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyForLinkedIn}
                    sx={{
                      background: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #006097 0%, #0077B5 100%)',
                      }
                    }}
                  >
                    {linkedinCopySuccess ? 'Copied!' : 'Copy for LinkedIn'}
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
              {profile.companyDetails?.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3, color: '#ffffff' }}>
              {profile.type} • {profile.userId.role}
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
              {profile.companyDetails?.industry}
            </Typography>
          </StatCard>
          <StatCard>
            <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
              Company Size
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
              {profile.companyDetails?.size}
            </Typography>
          </StatCard>
          <StatCard>
            <Typography variant="overline" sx={{ opacity: 0.7, color: '#ffffff' }}>
              Location
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
              {profile.companyDetails?.location}
            </Typography>
          </StatCard>
        </StatsContainer>
      </ProfileHeader>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <CompanyInfoCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <SectionTitle>Company Information</SectionTitle>
              {profile.userId.isVerified && (
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
              <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.name}</Typography>
            </InfoRow>

            <InfoRow>
              <CategoryIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
              <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.industry}</Typography>
            </InfoRow>

            <InfoRow>
              <GroupsIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
              <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.size} employees</Typography>
            </InfoRow>

            <InfoRow>
              <LocationOnIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
              <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{profile.companyDetails?.location}</Typography>
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
              {profile.requiredSkills.map((skill, index) => (
                <SkillChip key={index} label={skill} />
              ))}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Required Experience Level
              </Typography>
              <Chip
                label={profile.requiredExperienceLevel}
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
            <SectionTitle>Matching Candidates</SectionTitle>
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