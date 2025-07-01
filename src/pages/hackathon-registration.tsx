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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leaderFirstName, setLeaderFirstName] = useState('');
  const [leaderLastName, setLeaderLastName] = useState('');
  const steps = ['Leader Info', 'Project Info', 'Team Members'];
  const [activeStep, setActiveStep] = useState(0);

  // Animated gradient blob keyframes
  const blobAnimation = keyframes`
    0% { transform: scale(1) translateY(0px); }
    50% { transform: scale(1.1) translateY(20px); }
    100% { transform: scale(1) translateY(0px); }
  `;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isAuthenticated) {
    return null;
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

  const handleStepSubmit = () => {
    if (!leaderFirstName || !leaderLastName || !projectName || !projectDescription || teamMembers.length === 0) {
      setError('Please fill all required fields');
      return;
    }
    try {
      const projectData = {
        leaderFirstName,
        leaderLastName,
        projectName,
        projectDescription,
        teamMembers,
        progress: 0,
        submissionStatus: 'Not Submitted',
        deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('hackathonProject', JSON.stringify(projectData));
      router.push('/hackathon-dashboard');
    } catch (err) {
      setError('Failed to save project data. Please try again.');
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
              <ProjectInfoStep projectName={projectName} projectDescription={projectDescription} setProjectName={setProjectName} setProjectDescription={setProjectDescription} />
            )}
            {activeStep === 2 && (
              <TeamMembersStep newMember={newMember} setNewMember={setNewMember} teamMembers={teamMembers} handleAddMember={handleAddMember} handleRemoveMember={handleRemoveMember} />
            )}
            <RegistrationNavigation activeStep={activeStep} steps={steps} handleBack={handleBack} handleNext={handleNext} handleStepSubmit={handleStepSubmit} />
          </Paper>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={1200}
            message="Logged out successfully"
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          />
        </Box>
      </Fade>
    </Container>
  );
};

export default HackathonRegistration; 