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
import QuickActions from '@/components/dashboard-hackathon/QuickActions';
import TeamMembers from '@/components/dashboard-hackathon/TeamMembers';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
import { styled } from '@mui/material/styles';
import { logout } from '@/store/slices/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import { TextField } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { evaluateProjectCode, getProjectById } from '@/store/slices/projectSlice';
import CodeAnalysisModal from '@/components/dashboard-hackathon/CodeAnalysisModal';
import { validateGithubLink } from '@/utils/functions';

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

const HackathonDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = router.query;
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { currentProject, loading } = useSelector((state: RootState) => state.project);
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
  const assessment = currentProject?.assessment || null;
  const hasBusinessData = !!assessment?.businessData;
  const hasTechnicalData = !!assessment?.technicalData;
  const hasCodeAnalysis = !!assessment?.codeAnalysis;
  const availableMeetings = (!hasBusinessData ? 1 : 0) + (!hasTechnicalData ? 1 : 0);
  const techScore = assessment?.technicalData?.overallScore;
  const bizScore = assessment?.businessData?.overallScore;
  const overallScore = assessment?.overallScore;
  const codeAnalysisScore =
  assessment?.codeAnalysis?.analysis?.quality?.overall != null
    ? assessment.codeAnalysis.analysis.quality.overall
    : codeQualityScore;
  const [mounted, setMounted] = useState(false);

  const handleCodeEvalSubmit = async () => {
    if(!currentProject?._id){
      return;
    }
    if (!githubLink) {
      setGithubLinkError('Please enter a valid GitHub repository URL'); 
      return;
    }
    if (!validateGithubLink(githubLink)) {isProjectComplete
      setGithubLinkError('Please enter a valid GitHub repository URL (e.g. https://github.com/user/repo)');
      return;
    }

    setEvaluating(true);
    setCodeEvalMessage('Evaluating code quality. This may take a moment...');
    try {
      const result = await dispatch(evaluateProjectCode({ projectId: currentProject._id, githubLink })).unwrap();
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

  useEffect(() => {
    if(typeof id === 'string' && id){
    dispatch(getProjectById(id)).unwrap();
    }
  }, [id]);
  useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

  if (typeof loading === 'undefined' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#8310FF' }} />
      </Box>
    );
  }

  if (!currentProject && !loading) {
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
    if (score == null) {
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

  // --- Main Render ---
  // Determine current user email from Redux only
  const currentUserEmail = user?.email;
  const isTeamMember = !!(currentUserEmail && currentProject && currentProject.team.some(member => member.email === currentUserEmail));
  const isLeader = !!(currentUserEmail && currentProject && currentProject.leader && currentProject.leader.email === currentUserEmail);
  // Change the logic for project complete:
  const isProjectComplete = hasBusinessData && hasTechnicalData && hasCodeAnalysis;
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
      {currentProject && (
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
                {currentProject.name}
              </Typography>
              <Typography variant="body1" sx={{ color: '#2E3A59', mb: 1.2, fontSize: '1.08rem', fontWeight: 500 }}>
                {currentProject.description}
              </Typography>
              {currentProject.track && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#F3F6FD', color: '#7C4DFF', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: '0.98rem', mb: 0.5 }}>
                  <RocketLaunchIcon sx={{ fontSize: 18, mr: 1 }} />
                  Track: {currentProject.track}
                </Box>
              )}
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Copy Project ID">
                  <IconButton size="small" onClick={() => { navigator.clipboard.writeText(currentProject._id) }}>
                    <ContentCopyIcon sx={{ fontSize: 18, color: '#7C4DFF' }} />
                  </IconButton>
                </Tooltip>
                <Typography variant="caption" sx={{ color: '#7C4DFF', fontWeight: 700 }}>
                  Project ID: {currentProject._id.slice(0, 8)}...{currentProject._id.slice(-4)}
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
                {currentProject.leader && currentProject.leader.FirstName && currentProject.leader.LastName
                  ? `${currentProject.leader.FirstName} ${currentProject.leader.LastName}`
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
              {renderScoreChip(codeAnalysisScore*10)}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {!hasCodeAnalysis && (
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
                )}
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
      <CodeAnalysisModal
        open={openCodeAnalysisModal}
        onClose={() => setOpenCodeAnalysisModal(false)}
        analysis={assessment?.codeAnalysis?.analysis}
      />
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
              currentProject && currentProject.team.length > 0 && currentProject.description ?
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
              currentProject && currentProject.team.length > 0 && currentProject.description ?
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
                  projectId={currentProject && (currentProject as any)._id}
                  disableBusiness={hasBusinessData}
                  disableTechnical={hasTechnicalData}
                  onEvaluateCode={() => setOpenCodeEvalModal(true)}
                  disableEvaluateCode={hasCodeAnalysis}
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
                    {Math.max(0, Math.ceil((new Date(currentProject?.createdAt || '').getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)))}
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
                    {isProjectComplete ? '✔' : '…'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E3A59', fontWeight: 700 }}>
                    {isProjectComplete ? 'Project Complete!' : 'In Progress'}
                  </Typography>
                </Box>
                {/* Code Evaluation Status */}
                <Box sx={{
                  flex: 1,
                  minWidth: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: '#F3F6FD',
                  boxShadow: '0 2px 8px #33333308',
                  mb: { xs: 2, md: 0 },
                }}>
                  {hasCodeAnalysis ? (
                    <CheckCircleIcon sx={{ color: '#43e97b', fontSize: 36, mb: 1 }} />
                  ) : (
                    <WarningAmberIcon sx={{ color: '#e53935', fontSize: 36, mb: 1 }} />
                  )}
                  <Typography variant="h4" sx={{ fontWeight: 900, color: hasCodeAnalysis ? '#43e97b' : '#e53935', mb: 0.5 }}>
                    {hasCodeAnalysis ? '✔' : '…'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2E3A59', fontWeight: 700 }}>
                    {hasCodeAnalysis ? 'Code Evaluated' : 'Code Not Evaluated'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* Right: Team Members */}
          <TeamMembers teamMembers={currentProject?.team} projectId={currentProject?._id} isOwner={isLeader} />
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
