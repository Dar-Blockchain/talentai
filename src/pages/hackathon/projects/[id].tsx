import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
  LinearProgress,
  IconButton,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import Cookies from 'js-cookie';
import { keyframes } from '@mui/system';
import HeroHeader from '@/components/dashboard-hackathon/HeroHeader';
import StatsCards from '@/components/dashboard-hackathon/StatsCards';
import QuickActions from '@/components/dashboard-hackathon/QuickActions';
import ProjectDetails from '@/components/dashboard-hackathon/ProjectDetails';
import TeamMembers from '@/components/dashboard-hackathon/TeamMembers';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CelebrationIcon from '@mui/icons-material/Celebration';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StarIcon from '@mui/icons-material/Star';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import { logout } from '@/store/slices/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import { TextField } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { evaluateProjectCode } from '@/store/slices/projectSlice';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import VerifiedIcon from '@mui/icons-material/Verified';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoIcon from '@mui/icons-material/Info';

interface TeamMember {
  name: string;
  email: string;
  role: string;
  validated?: boolean;
}

interface Leader {
  FirstName: string;
  LastName: string;
  email: string;
  // add other fields if needed
}

interface ProjectAPIData {
  _id: string;
  name: string;
  description: string;
  team: { name?: string; role?: string; email: string; validated?: boolean; _id?: string }[];
  leader: string;
  createdAt: string;
  updatedAt: string;
  track?: string;
}

interface Assessment {
  _id: string;
  user: string;
  project: string;
  technicalData?: any; // You can further type this if needed
  createdAt: string;
  updatedAt: string;
  __v?: number;
  businessData?: any;
  overallScore?: number;
  codeAnalysis?: any; // Add codeAnalysis field
}

interface ProjectData {
  name: string;
  projectDescription: string;
  teamMembers: TeamMember[];
  createdAt: string;
  _id: string;
  track?: string;
  assessment?: Assessment;
  leader?: Leader;
}

const blobAnimation = keyframes`
  0% { transform: scale(1) translateY(0px); }
  50% { transform: scale(1.1) translateY(20px); }
  100% { transform: scale(1) translateY(0px); }
`;

const steps = [
  { label: 'Register', icon: <RocketLaunchIcon /> },
  { label: 'Submit Project', icon: <AssignmentTurnedInIcon /> },
  { label: 'Evaluation Meetings', icon: <EventAvailableIcon /> },
  { label: 'Await Results', icon: <EmojiEventsIcon /> },
];

// --- Custom Step Icon ---
const GlassStepIconRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'completed',
})<{
  active?: boolean;
  completed?: boolean;
}>(({ active, completed }) => ({
  background: active || completed
    ? 'linear-gradient(120deg, #7C4DFF 0%, #00B8D4 100%)'
    : 'linear-gradient(120deg, #E3EAFD 0%, #E0F7FA 100%)',
  color: active || completed ? '#fff' : '#7C4DFF',
  boxShadow: active || completed ? '0 4px 16px #7C4DFF33' : '0 2px 8px #E3EAFD',
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  fontSize: 28,
  border: active ? '2.5px solid #FFD600' : '2px solid #E3EAFD',
  transition: 'all 0.2s',
  position: 'relative',
  zIndex: 1,
}));

function GlassStepIcon(props: any) {
  const { active, completed, icon } = props;
  const icons = [
    <RocketLaunchIcon fontSize="inherit" />, // Register
    <AssignmentTurnedInIcon fontSize="inherit" />, // Submit
    <EventAvailableIcon fontSize="inherit" />, // Evaluation Meetings
    <EmojiEventsIcon fontSize="inherit" />, // Await Results
  ];
  return (
    <GlassStepIconRoot active={active} completed={completed}>
      {completed ? <CheckCircleIcon fontSize="inherit" sx={{ color: '#FFD600', fontSize: 32 }} /> : icons[Number(icon) - 1]}
    </GlassStepIconRoot>
  );
}

// --- Github Link Validation Function ---
function validateGithubLink(link: string): boolean {
  // Accepts: https://github.com/user/repo or http://github.com/user/repo or github.com/user/repo
  // Optionally with .git at the end, and optional trailing slash
  // Does not accept github.com/user or github.com/user/repo/extra
  // Only public repo URLs
  const regex = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/)?(\.git)?$/i;
  // Remove trailing slash for .git check
  let normalized = link.trim();
  if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
  // Remove .git for trailing slash check
  if (normalized.endsWith('.git')) normalized = normalized.slice(0, -4);
  // Now check if it matches the pattern
  const match = /^((https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+)$/.test(normalized);
  return match;
}

const HackathonDashboard = () => {
  // All hooks at the top, before any return!
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);
  // --- Modal State ---
  const [openTechModal, setOpenTechModal] = useState(false);
  const [openBizModal, setOpenBizModal] = useState(false);
  const [openFullModal, setOpenFullModal] = useState(false);
  const [openCodeEvalModal, setOpenCodeEvalModal] = useState(false);
  const [openCodeAnalysisModal, setOpenCodeAnalysisModal] = useState(false); // NEW: code analysis modal
  const [githubLink, setGithubLink] = useState('');
  const [codeQualityScore, setCodeQualityScore] = useState<number | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [codeEvalMessage, setCodeEvalMessage] = useState('');
  const [githubLinkError, setGithubLinkError] = useState('');
  // After projectData is loaded, extract assessment if available
  // For demo, let's mock assessment as an object on projectData (replace with real data as needed)
  const assessment = projectData?.assessment || null;
  const hasBusinessData = !!assessment?.businessData;
  const hasTechnicalData = !!assessment?.technicalData;
  const hasCodeAnalysis = !!assessment?.codeAnalysis;
  const availableMeetings = (!hasBusinessData ? 1 : 0) + (!hasTechnicalData ? 1 : 0);
  // --- Extracted Scores ---
  const techScore = assessment?.technicalData?.overallScore;
  const bizScore = assessment?.businessData?.overallScore;
  const overallScore = assessment?.overallScore;
  // If codeAnalysis exists, prefer its score for code quality
  const codeAnalysisScore = assessment?.codeAnalysis?.overallScore ?? codeQualityScore;

  const handleCodeEvalSubmit = async () => {
    if(!projectData?._id){
      return;
    }
    if (!githubLink) {
      setGithubLinkError('Please enter a valid GitHub repository URL'); 
      return;
    }
    if (!validateGithubLink(githubLink)) {
      setGithubLinkError('Please enter a valid GitHub repository URL (e.g. https://github.com/user/repo)');
      return;
    }

    setEvaluating(true);
    setCodeEvalMessage('Evaluating code quality. This may take a moment...');
    try {
      const result = await dispatch(evaluateProjectCode({ projectId: projectData._id, githubLink })).unwrap();
      setCodeQualityScore(result.codeQualityScore);
      setCodeEvalMessage('Code evaluation complete!');
    } catch (error) {
      setCodeEvalMessage('Code evaluation failed. Please try again.');
      console.error(error);
    } finally {
      setEvaluating(false);
      setTimeout(() => setCodeEvalMessage(''), 2500);
      setOpenCodeEvalModal(false);
    }
  };
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin/?source=hackathon');
    }
  }, [isAuthenticated, router]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('api_token');
        let project: ProjectAPIData | null = null;
        if (id) {
          // Fetch by id from URL
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/getProjectById/${id}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (!res.ok) throw new Error('Failed to fetch project by id');
          project = await res.json();
        } 
        if (project) {
          // Map API team to required TeamMember[]
          const teamMembers: TeamMember[] = project.team.map((member, idx) => ({
            name: member?.name || member.email.split('@')[0] || `Member${idx + 1}`,
            email: member.email,
            role: member?.role ? member.role : 'Member',
            validated: member.validated,
          }));
          setProjectData({
            name: project.name,
            projectDescription: project.description,
            teamMembers,
            createdAt: project.createdAt,
            _id: project._id,
            track: project.track,
            assessment: (project as any).assessment,
            leader: (project as any).leader,
          });
        } else {
          setProjectData(null);
        }
      } catch (error) {
        setProjectData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Only after all hooks:
  if (!mounted || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#8310FF' }} />
      </Box>
    );
  }

  if (!projectData) {
    return (
      <Container>
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No project found
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/hackathon-registration')}
            sx={{ bgcolor: '#8310FF', '&:hover': { bgcolor: '#6b0cd6' } }}
          >
            Register Project
          </Button>
        </Box>
      </Container>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/signin?source=hackathon');
  };

  // --- Score Chip Helper ---
  const renderScoreChip = (score: number | undefined | null) => {
    if (score === undefined || score === null) {
      return (
        <Chip
          label="N/A"
          size="medium"
          sx={{
            bgcolor: '#e0e0e0',
            color: '#757575',
            fontWeight: 700,
            fontSize: 15,
            px: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
            border: '1.5px solid #e0e0e0',
          }}
        />
      );
    }
    let chipGradient = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
    let chipText = '#fff';
    let icon = <StarIcon sx={{ color: chipText, fontSize: 20, ml: 1 }} />;
    let tooltip = 'Excellent';
    if (score < 50) {
      chipGradient = 'linear-gradient(90deg, #e53935 0%, #ff6a00 100%)';
      icon = <WarningAmberIcon sx={{ color: chipText, fontSize: 20, ml: 1 }} />;
      tooltip = 'Needs Improvement';
    } else if (score < 80) {
      chipGradient = 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)';
      icon = <TrendingUpIcon sx={{ color: chipText, fontSize: 20, ml: 1 }} />;
      tooltip = 'Good';
    }
    return (
      <Tooltip title={tooltip} arrow>
        <Chip
          icon={icon}
          label={<span style={{ fontWeight: 700, fontSize: 15 }}>{score}%</span>}
          size="medium"
          sx={{
            background: chipGradient,
            color: chipText,
            fontWeight: 700,
            fontSize: 15,
            px: 2.5,
            borderRadius: 3,
            boxShadow: '0 4px 16px 0 rgba(67,233,123,0.18)',
            minWidth: 60,
            justifyContent: 'left',
            border: '2px solid #fff',
          }}
        />
      </Tooltip>
    );
  };

  // --- Code Analysis Modal Content Helper ---
  // This modal displays all details from the codeAnalysisModel.js schema.


  // Helper to render a list of strings
  const renderStringList = (arr: string[] | undefined) =>
    Array.isArray(arr) && arr.length > 0 ? (
      <Box component="ul" sx={{ pl: 3, mb: 1 }}>
        {arr.map((item, idx) => (
          <li key={idx}>
            <Typography variant="body2">{item}</Typography>
          </li>
        ))}
      </Box>
    ) : null;

  // Helper to render an object as key-value pairs (never as JSON)
  const renderObjectDetails = (obj: any) =>
    obj && typeof obj === 'object' ? (
      <Box component="ul" sx={{ pl: 3, mb: 1 }}>
        {Object.entries(obj).map(([key, value]) => (
          <li key={key}>
            <Typography variant="body2">
              <strong>{key}:</strong> {Array.isArray(value)
                ? (
                  <Box component="ul" sx={{ pl: 3, mb: 1 }}>
                    {value.map((item, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{typeof item === 'object' ? renderObjectDetails(item) : String(item)}</Typography>
                      </li>
                    ))}
                  </Box>
                )
                : value && typeof value === 'object'
                  ? renderObjectDetails(value)
                  : String(value)}
            </Typography>
          </li>
        ))}
      </Box>
    ) : null;

  const renderProjectPurpose = (purpose: any) => {
    if (!purpose) return null;
    return (
      <Box sx={{
        mb: 3,
        p: 3,
        bgcolor: '#F3F6FD',
        borderRadius: 3,
        boxShadow: '0 2px 8px #7C4DFF11',
        border: '1.5px solid #E3EAFD'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WebAssetIcon sx={{ color: '#7C4DFF', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>
            Project Purpose
          </Typography>
        </Box>
        {/* Key-value pairs */}
        {/* <Box sx={{ mb: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Domain: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{purpose.domain || 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Type: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{purpose.type || 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Complexity: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{purpose.complexity || 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Target: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{purpose.target || 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Confidence: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{typeof purpose.confidence === 'number' ? `${purpose.confidence * 100}%` : 'N/A'}</Typography>
          </Box>
        </Box> */}
        {/* Description */}
        {purpose.description && (
          <Box sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2.2,
            bgcolor: '#F7F8FA',
            borderLeft: '5px solid #7C4DFF',
            borderRadius: 2,
            boxShadow: '0 1px 4px #7C4DFF11',
          }}>
            <DescriptionIcon sx={{ color: '#7C4DFF', mt: 0.5, fontSize: 28 }} />
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.08rem', lineHeight: 1.7, color: '#2E3A59', wordBreak: 'break-word' }}>
              {purpose.description}
            </Typography>
          </Box>
        )}
        {/* Features */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7C4DFF', mb: 1 }}>
            Features
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.isArray(purpose.features) && purpose.features.length > 0 ? (
              purpose.features.map((feature: string, idx: number) => (
                <Chip key={idx} icon={<DoneAllIcon sx={{ color: '#7C4DFF' }} />} label={feature} sx={{ bgcolor: '#F3E5F5', color: '#7C4DFF', fontWeight: 700 }} />
              ))
            ) : (
              <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
            )}
          </Box>
        </Box>
        {/* Technologies */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00B8D4', mb: 1 }}>
            Technologies
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.isArray(purpose.technologies) && purpose.technologies.length > 0 ? (
              purpose.technologies.map((tech: string, idx: number) => (
                <Chip key={idx} icon={<CodeIcon sx={{ color: '#00B8D4' }} />} label={tech} sx={{ bgcolor: '#E0F7FA', color: '#00B8D4', fontWeight: 700 }} />
              ))
            ) : (
              <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
            )}
          </Box>
        </Box>
        {/* Key Files */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4527A0', mb: 1 }}>
            Key Files
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.isArray(purpose.keyFiles) && purpose.keyFiles.length > 0 ? (
              purpose.keyFiles.map((file: string, idx: number) => (
                <Chip key={idx} icon={<DescriptionIcon sx={{ color: '#4527A0' }} />} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
              ))
            ) : (
              <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
            )}
          </Box>
        </Box>
        {/* Conclusion */}
        <Box sx={{ mt: 2, p: 2, bgcolor: '#E8F5E9', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#388E3C', mb: 1 }}>
            Conclusion
          </Typography>
          <Typography variant="body2" sx={{ color: '#388E3C', fontWeight: 600 }}>
            {purpose.conclusion || 'N/A'}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderArchitecture = (architecture: any) => {
    if (!architecture) return null;
    return (
      <Box sx={{ mb: 3, p: 3, bgcolor: '#F3F6FD', borderRadius: 3, boxShadow: '0 2px 8px #7C4DFF11', border: '1.5px solid #E3EAFD' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CategoryIcon sx={{ color: '#7C4DFF', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>Architecture</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Pattern: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{architecture.pattern || 'N/A'}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Quality: </Typography>
          <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{architecture.quality !== undefined ? architecture.quality : 'N/A'}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7C4DFF', mb: 1 }}>Layers</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.isArray(architecture.layers) && architecture.layers.length > 0 ? (
              architecture.layers.map((layer: string, idx: number) => (
                <Chip key={idx} label={layer} sx={{ bgcolor: '#E1F5FE', color: '#7C4DFF', fontWeight: 700 }} />
              ))
            ) : (
              <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
            )}
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#00B8D4', mb: 1 }}>Patterns</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.isArray(architecture.patterns) && architecture.patterns.length > 0 ? (
              architecture.patterns.map((pattern: string, idx: number) => (
                <Chip key={idx} label={pattern} sx={{ bgcolor: '#E0F7FA', color: '#00B8D4', fontWeight: 700 }} />
              ))
            ) : (
              <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
            )}
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#388E3C', mb: 1 }}>Strengths</Typography>
          <Box component="ul" sx={{ pl: 3, mb: 1 }}>
            {Array.isArray(architecture.strengths) && architecture.strengths.length > 0 ? (
              architecture.strengths.map((s: string, idx: number) => (
                <li key={idx}><Typography variant="body2" sx={{ color: '#388E3C' }}>{s}</Typography></li>
              ))
            ) : (
              <li><Typography variant="body2">N/A</Typography></li>
            )}
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 1 }}>Weaknesses</Typography>
          <Box component="ul" sx={{ pl: 3, mb: 1 }}>
            {Array.isArray(architecture.weaknesses) && architecture.weaknesses.length > 0 ? (
              architecture.weaknesses.map((w: string, idx: number) => (
                <li key={idx}><Typography variant="body2" sx={{ color: '#E65100' }}>{w}</Typography></li>
              ))
            ) : (
              <li><Typography variant="body2">N/A</Typography></li>
            )}
          </Box>
        </Box>
        {/* Structure */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4527A0', mb: 1 }}>Structure</Typography>
          {architecture.structure && (
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Root Files:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {Array.isArray(architecture.structure.rootFiles) && architecture.structure.rootFiles.length > 0 ? (
                  architecture.structure.rootFiles.map((file: string, idx: number) => (
                    <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                  ))
                ) : (
                  <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
                )}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Config Files:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {Array.isArray(architecture.structure.configFiles) && architecture.structure.configFiles.length > 0 ? (
                  architecture.structure.configFiles.map((file: string, idx: number) => (
                    <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                  ))
                ) : (
                  <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
                )}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Documentation:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {Array.isArray(architecture.structure.documentation) && architecture.structure.documentation.length > 0 ? (
                  architecture.structure.documentation.map((file: string, idx: number) => (
                    <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                  ))
                ) : (
                  <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
                )}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Testing:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {Array.isArray(architecture.structure.testing) && architecture.structure.testing.length > 0 ? (
                  architecture.structure.testing.map((file: string, idx: number) => (
                    <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                  ))
                ) : (
                  <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
                )}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>Deployment:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {Array.isArray(architecture.structure.deployment) && architecture.structure.deployment.length > 0 ? (
                  architecture.structure.deployment.map((file: string, idx: number) => (
                    <Chip key={idx} label={file} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700 }} />
                  ))
                ) : (
                  <Chip label="N/A" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700 }} />
                )}
              </Box>
              {/* srcStructure */}
              {architecture.structure.srcStructure && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', mt: 1 }}>srcStructure:</Typography>
                  {Object.entries(architecture.structure.srcStructure).map(([k, v]) => (
                    <Box key={k} sx={{ mb: 1, ml: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>{k}: </Typography>
                      {Array.isArray(v) && v.length > 0 ? (
                        v.map((item: string, idx: number) => (
                          <Chip key={idx} label={item} sx={{ bgcolor: '#EDE7F6', color: '#4527A0', fontWeight: 700, ml: 1 }} />
                        ))
                      ) : (
                        <Chip label="None" sx={{ bgcolor: '#E0E0E0', color: '#757575', fontWeight: 700, ml: 1 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderCoherence = (coherence: any) => {
    if (!coherence) return null;
    return (
      <Box sx={{ mb: 3, p: 3, bgcolor: '#F3F6FD', borderRadius: 3, boxShadow: '0 2px 8px #7C4DFF11', border: '1.5px solid #E3EAFD' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BarChartIcon sx={{ color: '#7C4DFF', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>Coherence</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Consistency: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.consistency !== undefined ? coherence.consistency : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Naming: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.naming !== undefined ? coherence.naming : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Structure: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.structure !== undefined ? coherence.structure : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Patterns: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{coherence.patterns !== undefined ? coherence.patterns : 'N/A'}</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderQuality = (quality: any) => {
    if (!quality) return null;
    return (
      <Box sx={{ mb: 3, p: 3, bgcolor: '#F3F6FD', borderRadius: 3, boxShadow: '0 2px 8px #7C4DFF11', border: '1.5px solid #E3EAFD' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StarIcon sx={{ color: '#7C4DFF', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#7C4DFF' }}>Quality</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Overall: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.overall !== undefined ? quality.overall : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Maintainability: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.maintainability !== undefined ? quality.maintainability : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Readability: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.readability !== undefined ? quality.readability : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Performance: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.performance !== undefined ? quality.performance : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Security: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.security !== undefined ? quality.security : 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4527A0', display: 'inline' }}>Testability: </Typography>
            <Typography variant="body2" sx={{ display: 'inline', ml: 0.5 }}>{quality.testability !== undefined ? quality.testability : 'N/A'}</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderSecurity = (security: any) => {
    if (!security) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Security</Typography>
        {renderStringList(security.issues)}
        {renderStringList(security.recommendations)}
        {typeof security.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {security.score}</Typography>}
      </Box>
    );
  };

  const renderTesting = (testing: any) => {
    if (!testing) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Testing</Typography>
        {renderStringList(testing.coverage)}
        {renderStringList(testing.issues)}
        {renderStringList(testing.recommendations)}
        {typeof testing.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {testing.score}</Typography>}
      </Box>
    );
  };

  const renderDocumentation = (documentation: any) => {
    if (!documentation) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Documentation</Typography>
        {renderStringList(documentation.files)}
        {renderStringList(documentation.issues)}
        {renderStringList(documentation.recommendations)}
        {typeof documentation.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {documentation.score}</Typography>}
      </Box>
    );
  };

  const renderMaintainability = (maintainability: any) => {
    if (!maintainability) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Maintainability</Typography>
        {renderStringList(maintainability.issues)}
        {renderStringList(maintainability.recommendations)}
        {typeof maintainability.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {maintainability.score}</Typography>}
      </Box>
    );
  };

  const renderDependencies = (dependencies: any) => {
    if (!dependencies) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Dependencies</Typography>
        {renderStringList(dependencies.list)}
        {renderStringList(dependencies.issues)}
        {renderStringList(dependencies.recommendations)}
        {typeof dependencies.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {dependencies.score}</Typography>}
      </Box>
    );
  };

  const renderPerformance = (performance: any) => {
    if (!performance) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Performance</Typography>
        {renderStringList(performance.issues)}
        {renderStringList(performance.recommendations)}
        {typeof performance.score === 'number' && <Typography variant="body2"><strong>Score:</strong> {performance.score}</Typography>}
      </Box>
    );
  };

  const renderOtherSections = (codeAnalysis: any) => {
    // Render any additional fields not covered above
    const knownKeys = [
      'summary', 'overallScore', 'metrics', 'issues', 'recommendations', 'createdAt',
      'projectPurpose', 'architecture', 'coherence', 'security', 'testing', 'documentation',
      'maintainability', 'dependencies', 'performance'
    ];
    return Object.entries(codeAnalysis)
      .filter(([key]) => !knownKeys.includes(key))
      .map(([key, value]) => (
        <Box key={key} sx={{ mb: 2, p: 2, bgcolor: '#F7F8FA', borderRadius: 2, border: '1.5px solid #E3EAFD' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#7C4DFF' }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
          {Array.isArray(value) ? (
            <Box component="ul" sx={{ pl: 3, mb: 1 }}>
              {value.map((item, idx) => (
                <li key={idx}>
                  <Typography variant="body2">{typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}</Typography>
                </li>
              ))}
            </Box>
          ) : value && typeof value === 'object' ? (
            <Box component="ul" sx={{ pl: 3, mb: 1 }}>
              {Object.entries(value).map(([k, v]) => (
                <li key={k}>
                  <Typography variant="body2"><strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</Typography>
                </li>
              ))}
            </Box>
          ) : (
            <Typography variant="body2">{String(value)}</Typography>
          )}
        </Box>
      ));
  };

  const renderCodeAnalysisModalContent = (analysis: any) => {
    if (!analysis) {
      return <Typography>No code analysis available.</Typography>;
    }
    const hasAnySection = !!(
      analysis.summary ||
      analysis.metrics ||
      (Array.isArray(analysis.issues) && analysis.issues.length > 0) ||
      (Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0) ||
      analysis.projectPurpose ||
      analysis.architecture ||
      analysis.coherence ||
      analysis.quality ||
      analysis.security ||
      analysis.testing ||
      analysis.documentation ||
      analysis.maintainability ||
      analysis.dependencies ||
      analysis.performance
    );
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 900, color: '#7C4DFF', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Code Analysis Report
        </Typography>
        {analysis.summary && (
          <Box sx={{ mb: 3, p: 2.5, bgcolor: '#F3F6FD', borderRadius: 2, border: '1.5px solid #E3EAFD' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#7C4DFF', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ color: '#7C4DFF' }} /> Summary
            </Typography>
            <Typography>{analysis.summary}</Typography>
          </Box>
        )}
        {analysis.metrics && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F7F8FA', borderRadius: 2, border: '1.5px solid #E3EAFD' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#4527A0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon sx={{ color: '#4527A0' }} /> Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              {Object.entries(analysis.metrics).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{key}:</Typography>
                  <Typography variant="body2">{typeof value === 'number' ? value.toFixed(2) : String(value)}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        {Array.isArray(analysis.issues) && analysis.issues.length > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#FFF3E0', borderRadius: 2, border: '1.5px solid #FFB300' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#E65100', display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon sx={{ color: '#E65100' }} /> Detected Issues
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              {analysis.issues.map((issue: any, idx: number) => (
                <li key={idx}>
                  <Typography variant="body2" color="error">
                    {issue.description || issue}
                  </Typography>
                </li>
              ))}
            </Box>
          </Box>
        )}
        {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#E3F2FD', borderRadius: 2, border: '1.5px solid #64B5F6' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#0277BD', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ color: '#0277BD' }} /> Recommendations
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              {analysis.recommendations.map((rec: any, idx: number) => (
                <li key={idx}>
                  <Typography variant="body2" color="primary">
                    {rec}
                  </Typography>
                </li>
              ))}
            </Box>
          </Box>
        )}
        {renderProjectPurpose(analysis.projectPurpose)}
        {renderArchitecture(analysis.architecture)}
        {renderCoherence(analysis.coherence)}
        {renderQuality(analysis.quality)}
        {renderSecurity(analysis.security)}
        {renderTesting(analysis.testing)}
        {renderDocumentation(analysis.documentation)}
        {renderMaintainability(analysis.maintainability)}
        {renderDependencies(analysis.dependencies)}
        {renderPerformance(analysis.performance)}
        {!hasAnySection && (
          <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 2 }}>
            No code analysis data available.
          </Typography>
        )}
        {analysis.createdAt && (
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block', textAlign: 'right' }}>
            Created: {new Date(analysis.createdAt).toLocaleString()}
          </Typography>
        )}
      </Box>
    );
  };

  // --- Main Render ---
  // Determine current user email from Redux only
  const currentUserEmail = user?.email;
  // console.log(currentUserEmail,"lalalala")
  const isTeamMember = !!(currentUserEmail && projectData && projectData.teamMembers.some(member => member.email === currentUserEmail));
  const isLeader = !!(currentUserEmail && projectData && projectData.leader && projectData.leader.email === currentUserEmail);
  return (
    <Box sx={{ bgcolor: 'linear-gradient(120deg, #F3E5F5 0%, #E1F5FE 100%)', minHeight: '100vh', pb: 6 }}>
      {/* Navbar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.7)",
          color: "#191919",
          boxShadow: "0 4px 24px 0 rgba(124,77,255,0.10)",
          mb: 3,
          borderRadius: 3,
          backdropFilter: "blur(16px)",
          width: 'unset',
          mx: { xs: 1, sm: 4 },
          mt: 2,
          px: { xs: 1, sm: 3 },
          py: 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: { xs: 56, sm: 72 },
            px: '0 !important',
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              component="img"
              src="/logo.svg"
              alt="TalentAI Logo"
              sx={{ height: { xs: 28, sm: 32 }, mr: 1, cursor: "pointer", transition: "transform 0.2s", '&:hover': { transform: 'scale(1.07)' } }}
              onClick={() => router.push("/")}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                color: "#7C4DFF",
                textShadow: "0 2px 8px #7C4DFF11",
                display: { xs: "none", sm: "block" },
              }}
            >
              Project Dashboard
            </Typography>
          </Box>
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
              <Avatar
                sx={{
                  bgcolor: "linear-gradient(135deg, #7C4DFF 60%, #00B8D4 100%)",
                  color: "#fff",
                  width: 44,
                  height: 44,
                  fontWeight: 700,
                  fontSize: 22,
                  boxShadow: "0 2px 8px #7C4DFF22",
                  border: "2px solid #fff",
                }}
              >
                {user.FirstName?.[0] || user.firstName?.[0] || user.email?.[0] || "U"}
              </Avatar>
              {!isMobile && (
                <>
                  <Box sx={{ textAlign: "right", minWidth: 120 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#222", fontSize: 17, lineHeight: 1.1 }}>
                      {user.FirstName || user.firstName || ""} {user.LastName || user.lastName || ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mx: 1, height: 36, borderLeft: "1.5px solid #E0E0E0" }} />
                </>
              )}
              {isMobile ? (
                <IconButton 
                  onClick={handleLogout}
                  sx={{
                    background: "linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)",
                    color: "#fff",
                    width: 44, height: 44,
                    '&:hover': {
                      background: "linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)",
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
                    background: "linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 3,
                    py: 1.2,
                    boxShadow: "0 2px 8px #00B8D422",
                    textTransform: "none",
                    fontSize: 16,
                    letterSpacing: 0.2,
                    transition: "background 0.2s, box-shadow 0.2s",
                    '&:hover': {
                      background: "linear-gradient(90deg, #00B8D4 0%, #7C4DFF 100%)",
                      boxShadow: "0 4px 16px #00B8D433",
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
      {/* Banner - REPLACED WITH NAVBAR */}
      {/* Project Summary Card */}
      {projectData && (
        <Container maxWidth="lg" sx={{ mb: 3, zIndex: 2, position: 'relative' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'stretch',
            borderRadius: 4,
            boxShadow: '0 2px 12px 0 rgba(124,77,255,0.08)',
            background: '#fff',
            p: 0,
            mb: 2,
            overflow: 'hidden',
            borderLeft: '6px solid #7C4DFF',
            transition: 'box-shadow 0.2s, transform 0.2s',
            '&:hover': {
              boxShadow: '0 6px 24px 0 rgba(124,77,255,0.13)',
              transform: 'translateY(-2px) scale(1.01)',
            },
          }}>
            {/* Project Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, py: { xs: 2, sm: 3 }, bgcolor: 'transparent' }}>
              <Avatar sx={{ bgcolor: '#F3F6FD', width: 56, height: 56, boxShadow: '0 2px 8px #7C4DFF11' }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 32, color: '#7C4DFF' }} />
              </Avatar>
            </Box>
            {/* Project Info */}
            <Box sx={{ flex: 1, py: { xs: 2, sm: 3 }, pr: { xs: 2, sm: 4 }, pl: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#7C4DFF', mb: 0.5, letterSpacing: 0.2 }}>
                {projectData.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#2E3A59', mb: 1.2, fontSize: '1.08rem', fontWeight: 500 }}>
                {projectData.projectDescription}
              </Typography>
              {projectData.track && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#F3F6FD', color: '#7C4DFF', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: '0.98rem', mb: 0.5 }}>
                  <RocketLaunchIcon sx={{ fontSize: 18, mr: 1 }} />
                  Track: {projectData.track}
                </Box>
              )}
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Copy Project ID">
                  <IconButton size="small" onClick={() => { navigator.clipboard.writeText(projectData._id) }}>
                    <ContentCopyIcon sx={{ fontSize: 18, color: '#7C4DFF' }} />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ color: '#7C4DFF', fontWeight: 700 }}>
                  Project ID: {projectData._id.slice(0, 8)}...{projectData._id.slice(-4)}
                </Typography>
              </Box>
            </Box>
            {/* Leader Info */}
            <Box sx={{ minWidth: 210, bgcolor: '#F3F6FD', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: { xs: 2, sm: 3 }, borderLeft: '1.5px solid #E1BEE7' }}>
              <Avatar sx={{ bgcolor: '#7C4DFF', width: 44, height: 44, mb: 1 }}>
                <PersonIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Avatar>
              <Typography variant="subtitle2" sx={{ color: '#7C4DFF', fontWeight: 700, mb: 0.2, letterSpacing: 0.2 }}>
                Leader
              </Typography>
              <Typography variant="body1" sx={{ color: '#2E3A59', fontWeight: 700, fontSize: '1.08rem' }}>
                {projectData.leader && projectData.leader.FirstName && projectData.leader.LastName
                  ? `${projectData.leader.FirstName} ${projectData.leader.LastName}`
                  : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Container>
      )}
      {/* Scores Section */}
      {assessment && (
        <Container maxWidth="lg" sx={{ mb: 3, zIndex: 2, position: 'relative' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 0,
            p: 0,
            mb: 2,
            borderRadius: 5,
            background: '#fff',
            boxShadow: '0 2px 12px #7C4DFF11',
            border: '1.5px solid #E3EAFD',
            overflow: 'hidden',
          }}>
            {/* Technical Score */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2, gap: 1 }}>
              <ScienceIcon sx={{ color: '#2196F3', fontSize: 44, mb: 1, filter: 'drop-shadow(0 2px 8px #2196F311)' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7C4DFF', letterSpacing: 0.2 }}>Technical Score</Typography>
              {renderScoreChip(techScore)}
              <Button size="small" variant="outlined" sx={{ mt: 2, fontWeight: 700, borderRadius: 2, color: '#7C4DFF', borderColor: '#E3EAFD', background: '#F7F8FA', '&:hover': { background: '#F3F6FD', borderColor: '#7C4DFF' } }} onClick={() => setOpenTechModal(true)} disabled={!hasTechnicalData}>
                View Technical Report
              </Button>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 0, borderColor: '#E3EAFD', borderRightWidth: 2 }} />
            {/* Business Score */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2, gap: 1 }}>
              <BusinessCenterIcon sx={{ color: '#FFB300', fontSize: 44, mb: 1, filter: 'drop-shadow(0 2px 8px #FFB30011)' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7C4DFF', letterSpacing: 0.2 }}>Business Score</Typography>
              {renderScoreChip(bizScore)}
              <Button size="small" variant="outlined" sx={{ mt: 2, fontWeight: 700, borderRadius: 2, color: '#7C4DFF', borderColor: '#E3EAFD', background: '#F7F8FA', '&:hover': { background: '#F3F6FD', borderColor: '#7C4DFF' } }} onClick={() => setOpenBizModal(true)} disabled={!hasBusinessData}>
                View Business Report
              </Button>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0, borderColor: '#E0F7FA', borderRightWidth: 2 }} />
            {/* Code Quality Score */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2, gap: 1 }}>
              <CodeIcon sx={{ color: '#333', fontSize: 44, mb: 1, filter: 'drop-shadow(0 2px 8px #33333311)' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7C4DFF', letterSpacing: 0.2 }}>Code Quality</Typography>
              {renderScoreChip(codeAnalysisScore)}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    background: '#333',
                    color: '#fff',
                    boxShadow: '0 2px 8px #33333322',
                    '&:hover': { background: '#000' }
                  }}
                  onClick={() => setOpenCodeEvalModal(true)}
                  disabled={!!codeAnalysisScore || evaluating}
                >
                  Evaluate Code
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    color: '#7C4DFF',
                    borderColor: '#E3EAFD',
                    background: '#F7F8FA',
                    '&:hover': { background: '#F3F6FD', borderColor: '#7C4DFF' }
                  }}
                  onClick={() => setOpenCodeAnalysisModal(true)}
                  disabled={!hasCodeAnalysis}
                >
                  View Code Analysis
                </Button>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 0, borderColor: '#E0F7FA', borderRightWidth: 2 }} />
            {/* Overall Score */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2, gap: 1 }}>
              <TrendingUpIcon sx={{ color: '#00BFAE', fontSize: 44, mb: 1, filter: 'drop-shadow(0 2px 8px #00BFAE11)' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7C4DFF', letterSpacing: 0.2 }}>Overall Score</Typography>
              {renderScoreChip(overallScore)}
              <Button size="small" variant="contained" sx={{ mt: 2, fontWeight: 700, borderRadius: 2, background: '#7C4DFF', color: '#fff', boxShadow: '0 2px 8px #7C4DFF22', '&:hover': { background: '#5E35B1' } }} onClick={() => setOpenFullModal(true)}>
                View Full Report
              </Button>
            </Box>
          </Box>
        </Container>
      )}
      {/* Code Evaluation Modal */}
      <Dialog open={openCodeEvalModal} onClose={() => setOpenCodeEvalModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Evaluate Code Quality</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Enter the public URL of your GitHub repository. Our AI will analyze your code for best practices, complexity, and maintainability.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="github-link"
            label="GitHub Repository URL"
            type="url"
            fullWidth
            variant="outlined"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            disabled={evaluating}
          />
          {githubLinkError && (
            <Typography sx={{ mt: 2, color: evaluating ? '#7C4DFF' : '#d32f2f', fontWeight: 600 }}>
              {githubLinkError}
            </Typography>
          )}
          {codeEvalMessage && (
            <Typography sx={{ mt: 2, color: evaluating ? '#7C4DFF' : '#d32f2f', fontWeight: 600 }}>
              {codeEvalMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCodeEvalModal(false)} disabled={evaluating}>Cancel</Button>
          <Button onClick={handleCodeEvalSubmit} variant="contained" disabled={evaluating || !!codeQualityScore}>
            {evaluating ? <CircularProgress size={24} /> : 'Evaluate'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Code Analysis Modal */}
      <Dialog open={openCodeAnalysisModal} onClose={() => setOpenCodeAnalysisModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Code Analysis Details</DialogTitle>
        <DialogContent dividers>
          {renderCodeAnalysisModalContent(assessment?.codeAnalysis.analysis)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCodeAnalysisModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Technical Report Modal */}
      <Dialog open={openTechModal} onClose={() => setOpenTechModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Technical Report Details</DialogTitle>
        <DialogContent dividers>
          {assessment?.technicalData ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
              <Typography sx={{ mb: 2 }}>{assessment.technicalData.summary || 'No summary provided.'}</Typography>
              {/* Tech Stack */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Tech Stack</strong></Typography>
              {Array.isArray(assessment.technicalData.techStack) && assessment.technicalData.techStack.length > 0 ? (
                assessment.technicalData.techStack.map((stack: any, idx: number) => (
                  <Box key={idx} sx={{ mb: 2, p: 2, background: '#f0f4ff', borderRadius: 2 }}>
                    <Typography variant="body2">{stack.title} ({stack.componentType})</Typography>
                    <Typography variant="body2">Complexity: {stack.complexity}, Modernity: {stack.modernity}</Typography>
                    {stack.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(stack.score)}</Typography>}
                    {stack.choiceExplanation && stack.choiceExplanation.length > 0 && (
                      <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                        {stack.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                      </Box>
                    )}
                    {stack.strengths && stack.strengths.length > 0 && (
                      <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                        <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                        {stack.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                      </Box>
                    )}
                    {stack.weaknesses && stack.weaknesses.length > 0 && (
                      <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                        <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                        {stack.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                      </Box>
                    )}
                    {stack.recommendation && stack.recommendation.length > 0 && (
                      <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                        <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                        {stack.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                      </Box>
                    )}
                  </Box>
                ))
              ) : <Typography variant="body2">No tech stack data.</Typography>}
              {/* Architecture */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Architecture</strong></Typography>
              {assessment.technicalData.architecture ? (
                <Box>
                  <Typography variant="body2">{assessment.technicalData.architecture.title} ({assessment.technicalData.architecture.type})</Typography>
                  {assessment.technicalData.architecture.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(assessment.technicalData.architecture.score)}</Typography>}
                  {assessment.technicalData.architecture.choiceExplanation && assessment.technicalData.architecture.choiceExplanation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      {assessment.technicalData.architecture.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.technicalData.architecture.strengths && assessment.technicalData.architecture.strengths.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                      {assessment.technicalData.architecture.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.technicalData.architecture.weaknesses && assessment.technicalData.architecture.weaknesses.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                      {assessment.technicalData.architecture.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.technicalData.architecture.recommendation && assessment.technicalData.architecture.recommendation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                      {assessment.technicalData.architecture.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                    </Box>
                  )}
                </Box>
              ) : <Typography variant="body2">No architecture data.</Typography>}
              {/* Scalability Approach */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Scalability Approach</strong></Typography>
              {assessment.technicalData.scalabilityApproach ? (
                <Box>
                  <Typography variant="body2">{assessment.technicalData.scalabilityApproach.strategy}</Typography>
                  {assessment.technicalData.scalabilityApproach.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(assessment.technicalData.scalabilityApproach.score)}</Typography>}
                  {assessment.technicalData.scalabilityApproach.choiceExplanation && assessment.technicalData.scalabilityApproach.choiceExplanation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      {assessment.technicalData.scalabilityApproach.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.technicalData.scalabilityApproach.strengths && assessment.technicalData.scalabilityApproach.strengths.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                      {assessment.technicalData.scalabilityApproach.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.technicalData.scalabilityApproach.weaknesses && assessment.technicalData.scalabilityApproach.weaknesses.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                      {assessment.technicalData.scalabilityApproach.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.technicalData.scalabilityApproach.recommendation && assessment.technicalData.scalabilityApproach.recommendation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                      {assessment.technicalData.scalabilityApproach.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                    </Box>
                  )}
                </Box>
              ) : <Typography variant="body2">No scalability data.</Typography>}
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2 }}>Created: {assessment.technicalData.createdAt ? new Date(assessment.technicalData.createdAt).toLocaleString() : 'No date'}</Typography>
            </Box>
          ) : (
            <Typography>No technical report available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTechModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Business Report Modal */}
      <Dialog open={openBizModal} onClose={() => setOpenBizModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Business Report Details</DialogTitle>
        <DialogContent dividers>
          {assessment?.businessData ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
              <Typography sx={{ mb: 2 }}>{assessment.businessData.summary || 'No summary provided.'}</Typography>
              {/* Business Model */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Business Model</strong></Typography>
              {assessment.businessData.businessModel ? (
                <Box>
                  <Typography variant="subtitle2">{assessment.businessData.businessModel.model}</Typography>
                  {assessment.businessData.businessModel.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(assessment.businessData.businessModel.score)}</Typography>}
                  {assessment.businessData.businessModel.choiceExplanation && assessment.businessData.businessModel.choiceExplanation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      {assessment.businessData.businessModel.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.businessData.businessModel.strengths && assessment.businessData.businessModel.strengths.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                      {assessment.businessData.businessModel.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.businessData.businessModel.weaknesses && assessment.businessData.businessModel.weaknesses.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                      {assessment.businessData.businessModel.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.businessData.businessModel.recommendation && assessment.businessData.businessModel.recommendation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                      {assessment.businessData.businessModel.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                    </Box>
                  )}
                </Box>
              ) : <Typography variant="body2">No business model data.</Typography>}
              {/* Market Potential */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Market Potential</strong></Typography>
              {assessment.businessData.marketPotential ? (
                <Box>
                  <Typography variant="body2">Range: {assessment.businessData.marketPotential.range}</Typography>
                  <Typography variant="body2">Estimated Market Size: {assessment.businessData.marketPotential.estimatedMarketSize}</Typography>
                  <Typography variant="body2">Target Region: {assessment.businessData.marketPotential.targetRegion}</Typography>
                  {assessment.businessData.marketPotential.score !== undefined && <Typography variant="body2">Score: {renderScoreChip(assessment.businessData.marketPotential.score)}</Typography>}
                  {assessment.businessData.marketPotential.choiceExplanation && assessment.businessData.marketPotential.choiceExplanation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      {assessment.businessData.marketPotential.choiceExplanation.map((ex: string, i: number) => <li key={i}><Typography variant="body2">{ex}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.businessData.marketPotential.strengths && assessment.businessData.marketPotential.strengths.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Strengths:</Typography>
                      {assessment.businessData.marketPotential.strengths.map((s: string, i: number) => <li key={i}><Typography variant="body2">{s}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.businessData.marketPotential.weaknesses && assessment.businessData.marketPotential.weaknesses.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Weaknesses:</Typography>
                      {assessment.businessData.marketPotential.weaknesses.map((w: string, i: number) => <li key={i}><Typography variant="body2">{w}</Typography></li>)}
                    </Box>
                  )}
                  {assessment.businessData.marketPotential.recommendation && assessment.businessData.marketPotential.recommendation.length > 0 && (
                    <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Recommendations:</Typography>
                      {assessment.businessData.marketPotential.recommendation.map((r: string, i: number) => <li key={i}><Typography variant="body2">{r}</Typography></li>)}
                    </Box>
                  )}
                </Box>
              ) : <Typography variant="body2">No market potential data.</Typography>}
              {/* Target Users */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Target Users</strong></Typography>
              {Array.isArray(assessment.businessData.targetUsers) && assessment.businessData.targetUsers.length > 0 ? (
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  {assessment.businessData.targetUsers.map((u: string, i: number) => <li key={i}><Typography variant="body2">{u}</Typography></li>)}
                </Box>
              ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
              {/* Added Values */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Added Values</strong></Typography>
              {Array.isArray(assessment.businessData.addedValues) && assessment.businessData.addedValues.length > 0 ? (
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  {assessment.businessData.addedValues.map((v: string, i: number) => <li key={i}><Typography variant="body2">{v}</Typography></li>)}
                </Box>
              ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
              {/* Competitors */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1 }}><strong>Competitors</strong></Typography>
              {Array.isArray(assessment.businessData.competitors) && assessment.businessData.competitors.length > 0 ? (
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  {assessment.businessData.competitors.map((c: string, i: number) => <li key={i}><Typography variant="body2">{c}</Typography></li>)}
                </Box>
              ) : <Typography variant="body2" sx={{ mb: 2 }}>No data</Typography>}
              {/* Innovation, Track Alignment, Hedera Ecosystem Impact, etc. */}
              {/* ...copy structure from DetailsModal as needed... */}
            </Box>
          ) : (
            <Typography>No business report available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBizModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Full Report Modal */}
      <Dialog open={openFullModal} onClose={() => setOpenFullModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Full Project Report</DialogTitle>
        <DialogContent dividers>
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: '#7C4DFF' }}>Technical Summary</Typography>
            <Typography sx={{ mb: 3 }}>{assessment?.technicalData?.summary || 'No technical summary.'}</Typography>
            <Typography variant="h6" sx={{ mb: 2, color: '#00B8D4' }}>Business Summary</Typography>
            <Typography sx={{ mb: 3 }}>{assessment?.businessData?.summary || 'No business summary.'}</Typography>
            {/* You can add more combined details here if needed */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFullModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Progress Stepper */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{
          mb: 2,
          mt: 1,
          px: 2,
          py: 2,
          borderRadius: 3,
          background: 'linear-gradient(120deg, #F3E5F5 0%, #E1F5FE 100%)',
          boxShadow: '0 2px 12px #7C4DFF22',
        }}>
          <Stepper
            alternativeLabel
            activeStep={
              projectData && projectData.teamMembers.length > 0 && projectData.projectDescription ?
                (hasBusinessData && hasTechnicalData ? 3 : (hasBusinessData || hasTechnicalData ? 2 : 1)) : 0
            }
            connector={null}
            sx={{
              pb: 2,
              '& .MuiStepLabel-label': {
                fontWeight: 700,
                fontSize: '1.08rem',
                color: '#4527A0',
                opacity: 0.95,
                letterSpacing: 0.2,
              },
            }}
          >
            {steps.map((step, idx) => (
              <Step key={step.label}>
                <StepLabel StepIconComponent={GlassStepIcon}>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <LinearProgress
            variant="determinate"
            value={
              projectData && projectData.teamMembers.length > 0 && projectData.projectDescription ?
                (hasBusinessData && hasTechnicalData ? 100 : (hasBusinessData || hasTechnicalData ? 66 : 33)) : 0
            }
            sx={{
              mt: 3,
              height: 16,
              borderRadius: 8,
              background: 'linear-gradient(90deg, #F3E5F5 0%, #E1F5FE 100%)',
              boxShadow: '0 2px 12px #7C4DFF22',
              overflow: 'hidden',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #7C4DFF 0%, #00B8D4 100%)',
                borderRadius: 8,
                boxShadow: '0 4px 16px 0 rgba(124,77,255,0.13)',
              },
            }}
          />
        </Box>
      </Container>
      {/* Main Content Grid */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          {/* Left: Quick Actions & Stats */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Quick Actions */}
            {(isLeader || isTeamMember) && (
              <Box sx={{ borderRadius: 4, background: 'linear-gradient(120deg, #E1F5FE 0%, #F3E5F5 100%)', boxShadow: '0 2px 12px #7C4DFF22', p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#7C4DFF', fontWeight: 800, mb: 2, letterSpacing: 0.2 }}>
                  Quick Actions
                </Typography>
                <QuickActions
                  projectId={projectData && (projectData as any)._id}
                  disableBusiness={hasBusinessData}
                  disableTechnical={hasTechnicalData}
                  onEvaluateCode={() => setOpenCodeEvalModal(true)}
                />
              </Box>
            )}

            {/* Stats/Analytics */}
            <Box sx={{
              borderRadius: 5,
              background: '#fff',
              boxShadow: '0 8px 32px 0 rgba(124,77,255,0.13)',
              border: '1.5px solid #E3EAFD',
              backdropFilter: 'blur(8px)',
              p: 3,
              mb: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              <Typography variant="h6" sx={{ color: '#7C4DFF', fontWeight: 900, mb: 2, letterSpacing: 0.2, fontSize: '1.25rem' }}>
                Project Stats
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {/* Days Left */}
                <Box sx={{
                  flex: 1,
                  minWidth: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: '#F3F6FD',
                  boxShadow: '0 2px 8px #7C4DFF08',
                  mb: { xs: 2, md: 0 },
                }}>
                  <AccessTimeIcon sx={{ color: '#7C4DFF', fontSize: 36, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#7C4DFF', mb: 0.5 }}>
                    {Math.max(0, Math.ceil((new Date(projectData.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)))}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E3A59', fontWeight: 700 }}>Days Left</Typography>
                </Box>
                {/* Meetings Left */}
                <Box sx={{
                  flex: 1,
                  minWidth: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: '#F3F6FD',
                  boxShadow: '0 2px 8px #00B8D408',
                  mb: { xs: 2, md: 0 },
                }}>
                  <EventAvailableIcon sx={{ color: '#7C4DFF', fontSize: 36, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#7C4DFF', mb: 0.5 }}>
                    {hasBusinessData && hasTechnicalData ? '0' : availableMeetings}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E3A59', fontWeight: 700 }}>
                    {hasBusinessData && hasTechnicalData ? 'Meetings Completed' : `Meetings Left`}
                  </Typography>
                </Box>
                {/* Project Status */}
                <Box sx={{
                  flex: 1,
                  minWidth: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: '#F3F6FD',
                  boxShadow: '0 2px 8px #FFD60008',
                  mb: { xs: 2, md: 0 },
                }}>
                  <EmojiEventsIcon sx={{ color: '#7C4DFF', fontSize: 36, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#7C4DFF', mb: 0.5, textShadow: '0 1px 4px #7C4DFF11' }}>
                    {hasBusinessData && hasTechnicalData ? '✔' : '…'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E3A59', fontWeight: 700 }}>
                    {hasBusinessData && hasTechnicalData ? 'Project Complete!' : 'In Progress'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* Right: Team Members */}
          <TeamMembers teamMembers={projectData.teamMembers} projectId={projectData._id} />
        </Box>
      </Container>
      {/* Footer */}
      <Box sx={{ mt: 8, textAlign: 'center', py: 3, color: '#7C4DFF', fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: 0.5, background: 'rgba(255,255,255,0.85)', borderTop: '2px solid #EDE7F6' }}>
        <Box component="img" src="/logo.svg" alt="TalentAI Hackathon" sx={{ height: 36, mb: 1 }} />
        <Typography variant="body2" sx={{ color: '#7C4DFF', fontWeight: 700 }}>
          Need help? <a href="mailto:support@talentai.ai" style={{ color: '#00B8D4', textDecoration: 'underline' }}>Contact Hackathon Support</a> &nbsp;|&nbsp; Good luck!
        </Typography>
      </Box>
    </Box>
  );
};
export default HackathonDashboard; 
