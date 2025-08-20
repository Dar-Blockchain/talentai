import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Chip,
  Stack,
  Alert,
  Avatar,
  Snackbar,
  Divider,
  Fade,
  Stepper,
  Step,
  StepLabel,
  Backdrop,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { keyframes } from '@mui/system';
import RegistrationHeader from '@/components/hackathon-registration/RegistrationHeader';
import RegistrationStepper from '@/components/hackathon-registration/RegistrationStepper';
import LeaderInfoStep from '@/components/hackathon-registration/LeaderInfoStep';
import ProjectInfoStep from '@/components/hackathon-registration/ProjectInfoStep';
import TeamMembersStep from '@/components/hackathon-registration/TeamMembersStep';
import RegistrationNavigation from '@/components/hackathon-registration/RegistrationNavigation';
import { logout } from '@/store/slices/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';
import { isValidName } from '@/utils/functions';


interface TeamMember {
  name: string;
  email: string;
  role: string;
}

const HackathonRegistration = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<TeamMember>({ name: '', email: '', role: '' });
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [mounted, setMounted] = useState(false);
  const [leaderFirstName, setLeaderFirstName] = useState('');
  const [leaderLastName, setLeaderLastName] = useState('');
  const [track, setTrack] = useState('');
  const steps = ['Leader Info', 'Project Info', 'Team Members'];
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingProject, setCheckingProject] = useState(true);

  // Animated gradient blob keyframes
  const blobAnimation = keyframes`
    0% { transform: scale(1) translateY(0px); }
    50% { transform: scale(1.1) translateY(20px); }
    100% { transform: scale(1) translateY(0px); }
  `;

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/signin?source=hackathon');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }
    const checkExistingProject = async () => {
      setCheckingProject(true);
      try {
        const token = localStorage.getItem('api_token');
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/'}project/getMyProjects`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            router.push(`/hackathon/projects/${data[0]._id}`);
            return;
          }
        }
      } catch (e) { /* ignore */ }
      setCheckingProject(false);
    };
    checkExistingProject();
  }, [isAuthenticated, router]);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  if (checkingProject) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          position: 'relative',
          // Remove background color
          animation: 'fadeIn 0.7s',
        }}
      >
        {/* Blurred gradient blob behind spinner */}
        <Box
          sx={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #7C4DFF 0%, #E040FB 80%)',
            filter: 'blur(60px)',
            opacity: 0.35,
            zIndex: 0,
          }}
        />
        <CircularProgress
          size={60}
          thickness={4.5}
          sx={{
            color: '#7C4DFF',
            zIndex: 1,
          }}
        />
        {/* Fade-in animation keyframes */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </Box>
    );
  }

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role) {
      setError('Please fill name and role fields');
      return;
    }
    setTeamMembers([...teamMembers, newMember]);
    setNewMember({ name: '', email: '', role: '' });
    setError('');
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    // Validation per step
    if (activeStep === 0 && (!leaderFirstName || !leaderLastName)) {
      setError('Please fill in leader first and last name');
      return;
    }
    if(!isValidName(leaderFirstName) || !isValidName(leaderLastName)){
      setError('Please enter a valid first name and last name (letters only, at least 2 characters).');
      return;
    }
    if (activeStep === 1 && (!projectName || !projectDescription)) {
      setError('Please fill in project name and description');
      return;
    }
    if (activeStep === 2 && teamMembers.length === 0) {
      setError('Please add at least one team member');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleStepSubmit = async () => {
    if (!leaderFirstName || !leaderLastName || !projectName || !projectDescription || teamMembers.length === 0) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('api_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/addProject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          FirstName: leaderFirstName,
          LastName: leaderLastName,
          Name: projectName,
          description: projectDescription,
          team: teamMembers, // send full objects
          track,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const createdProject = await res.json();
      const projectData = {
        leaderFirstName,
        leaderLastName,
        projectName,
        projectDescription,
        teamMembers,
        track,
        progress: 0,
        submissionStatus: 'Not Submitted',
        deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('hackathonProject', JSON.stringify(projectData));
      // After successful registration, redirect to the new dashboard route
      router.push(`/hackathon/projects/${createdProject._id}`);
    } catch (err: any) {
      setError('Failed to register project: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              Hackathon Registration
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
      <Container sx={{ mt: 4 }} >
        {/* Blurred floating gradient blobs for depth */}
        <Box sx={{
          position: 'absolute',
          top: -80,
          left: -100,
          width: 220,
          height: 220,
          zIndex: 0,
          filter: 'blur(60px)',
          opacity: 0.5,
          background: 'radial-gradient(circle at 30% 30%, #7C4DFF 0%, #E040FB 80%)',
          animation: `${blobAnimation} 8s ease-in-out infinite`,
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -60,
          right: -80,
          width: 180,
          height: 180,
          zIndex: 0,
          filter: 'blur(50px)',
          opacity: 0.4,
          background: 'radial-gradient(circle at 70% 70%, #00B8D4 0%, #7C4DFF 80%)',
          animation: `${blobAnimation} 10s ease-in-out infinite`,
        }} />
        <RegistrationHeader />
        {loading && (
          <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        <Fade in timeout={600}>
          <Box>
            <Paper elevation={0} sx={{
              mt: 2,
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 4,
              border: '1.5px solid #EDE7F6',
              background: 'rgba(255,255,255,0.65)',
              boxShadow: '0 8px 32px 0 rgba(94,53,177,0.13)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
            }}>
              <RegistrationStepper steps={steps} activeStep={activeStep} />
              {error && (
                <Alert severity="error" sx={{ mb: 2, fontSize: '0.95rem' }}>
                  {error}
                </Alert>
              )}
              <Divider sx={{ mb: 2, borderColor: '#D1C4E9' }} />
              {/* Step Content */}
              {activeStep === 0 && (
                <LeaderInfoStep leaderFirstName={leaderFirstName} leaderLastName={leaderLastName} setLeaderFirstName={setLeaderFirstName} setLeaderLastName={setLeaderLastName} />
              )}
              {activeStep === 1 && (
                <ProjectInfoStep 
                  projectName={projectName} 
                  projectDescription={projectDescription} 
                  setProjectName={setProjectName} 
                  setProjectDescription={setProjectDescription}
                  track={track}
                  setTrack={setTrack}
                />
              )}
              {activeStep === 2 && (
                <TeamMembersStep newMember={newMember} setNewMember={setNewMember} teamMembers={teamMembers} handleAddMember={handleAddMember} handleRemoveMember={handleRemoveMember} />
              )}
              <RegistrationNavigation activeStep={activeStep} steps={steps} handleBack={handleBack} handleNext={handleNext} handleStepSubmit={handleStepSubmit} loading={loading} />
            </Paper>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar(s => ({ ...s, open: false }))}
              message={snackbar.message}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              ContentProps={{ style: { background: snackbar.severity === 'success' ? '#43a047' : '#d32f2f', color: '#fff' } }}
            />
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default HackathonRegistration; 