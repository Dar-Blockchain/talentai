import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
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


interface TeamMember {
  name: string;
  email: string;
  role: string;
}

const HackathonRegistration = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<TeamMember>({ name: '', email: '', role: '' });
  const [error, setError] = useState('');
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }
    const checkExistingProject = async () => {
      setCheckingProject(true);
      try {
        const token = localStorage.getItem('api_token');
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/'}project/getMyProjects'`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            router.push('/hackathon-dashboard');
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
          team: teamMembers.map(m => m.email),
          track,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
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
      router.push('/hackathon-dashboard');
    } catch (err: any) {
      setError('Failed to register project: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default HackathonRegistration; 