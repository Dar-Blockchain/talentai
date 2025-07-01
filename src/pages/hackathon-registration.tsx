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
      {/* Visually rich header with illustration and glassmorphism */}
      <Box
        sx={{
          position: 'relative',
          mb: 3,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(94,53,177,0.13)',
          background: 'linear-gradient(120deg, #7C4DFF 0%, #5E35B1 100%)',
          minHeight: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
          backdropFilter: 'blur(8px)',
          border: '1.5px solid #fff3',
        }}
      >
        <Box sx={{ zIndex: 2 }}>
          <Typography  sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5, mb: 0.5, fontFamily: 'Nunito, Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontSize: { xs: 'rem', sm: '2.5rem' } }}>
            Hackathon Registration
          </Typography>
        
        </Box>
        {/* Abstract SVG illustration */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, zIndex: 1 }}>
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="50" fill="url(#paint0_radial)" fillOpacity="0.7" />
            <ellipse cx="55" cy="55" rx="30" ry="12" fill="#fff" fillOpacity="0.13" />
            <defs>
              <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(55 55) scale(50)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E040FB" />
                <stop offset="1" stopColor="#7C4DFF" />
              </radialGradient>
            </defs>
          </svg>
        </Box>
      </Box>
      <Fade in timeout={600}>
        <Box>
          {/* Glassmorphism Card */}
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
            {/* Stepper with animated gradient progress bar */}
            <Box sx={{ position: 'relative', mb: 3, pb: 1 }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1.5, '& .MuiStepIcon-root': { color: '#D1C4E9' }, '& .MuiStepIcon-root.Mui-active': { color: '#7C4DFF' }, '& .MuiStepIcon-root.Mui-completed': { color: '#5E35B1' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                {steps.map((label, idx) => (
                  <Step key={label}>
                    <StepLabel icon={idx === 0 ? <PersonIcon /> : idx === 1 ? <AssignmentIcon /> : <GroupAddIcon />}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {/* Animated gradient progress bar */}
              <Box sx={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: `${((activeStep + 1) / steps.length) * 100}%`,
                height: 5,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                zIndex: 2,
                boxShadow: '0 2px 8px #7C4DFF33',
              }} />
              <Box sx={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 5, borderRadius: 2, background: '#EDE7F6', zIndex: 1 }} />
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: '0.95rem' }}>
                {error}
              </Alert>
            )}
            <Divider sx={{ mb: 2, borderColor: '#D1C4E9' }} />
            {/* Step Content */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1.13rem', sm: '1.22rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                  Leader Info
                </Typography>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'row', md: 'column' }}>
                  <TextField
                    label="Leader First Name"
                    value={leaderFirstName}
                    onChange={(e) => setLeaderFirstName(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    size="medium"
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #7C4DFF11',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 3px #E040FB44',
                        borderColor: '#7C4DFF',
                      },
                    }}
                    helperText="Enter the first name of the team leader"
                  />
                  <TextField
                    label="Leader Last Name"
                    value={leaderLastName}
                    onChange={(e) => setLeaderLastName(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    size="medium"
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #7C4DFF11',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 3px #E040FB44',
                        borderColor: '#7C4DFF',
                      },
                    }}
                    helperText="Enter the last name of the team leader"
                  />
                </Stack>
              </Box>
            )}
            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1.13rem', sm: '1.22rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                  Project Info
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    size="medium"
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #7C4DFF11',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 3px #E040FB44',
                        borderColor: '#7C4DFF',
                      },
                    }}
                    helperText="Give your project a unique name"
                  />
                  <TextField
                    label="Project Description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    required
                    variant="outlined"
                    size="medium"
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #7C4DFF11',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 3px #E040FB44',
                        borderColor: '#7C4DFF',
                      },
                    }}
                    helperText="Describe your project in a few sentences"
                  />
                </Stack>
              </Box>
            )}
            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1.13rem', sm: '1.22rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                  Team Members
                </Typography>
                <Paper sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: '#F3E5F5',
                  border: '1.5px solid #E1BEE7',
                  boxShadow: '0 2px 8px #7C4DFF11',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                  alignItems: 'center',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' },
                }}>
                  <TextField
                    label="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    size="medium"
                    fullWidth
                    variant="outlined"
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #7C4DFF11',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 3px #E040FB44',
                        borderColor: '#7C4DFF',
                      },
                    }}
                    InputProps={{ startAdornment: <PersonIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
                    helperText="Full name of the member"
                  />
                  <TextField
                    label="Email (Optional)"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    size="medium"
                    fullWidth
                    variant="outlined"
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #7C4DFF11',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 3px #E040FB44',
                        borderColor: '#7C4DFF',
                      },
                    }}
                    InputProps={{ startAdornment: <EmailIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
                    helperText="Contact email (optional)"
                  />
                  <TextField
                    label="Role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    size="medium"
                    fullWidth
                    variant="outlined"
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px #7C4DFF11',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px #7C4DFF22' },
                      '& .MuiOutlinedInput-root.Mui-focused': {
                        boxShadow: '0 0 0 3px #E040FB44',
                        borderColor: '#7C4DFF',
                      },
                    }}
                    InputProps={{ startAdornment: <WorkIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 20 }} /> }}
                    helperText="e.g. Developer, Designer, PM"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
                    <IconButton 
                      onClick={handleAddMember}
                      size="medium"
                      sx={{ 
                        bgcolor: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
                        color: '#fff',
                        border: '1.5px solid #7C4DFF',
                        boxShadow: '0 2px 8px #7C4DFF22',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'linear-gradient(90deg, #7C4DFF 0%, #E040FB 100%)',
                          borderColor: '#E040FB',
                          transform: 'scale(1.08)',
                          boxShadow: '0 4px 16px #E040FB33',
                        },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Box>
                </Paper>
                <Divider sx={{ my: 1.5, borderColor: '#D1C4E9' }} />
                <Stack spacing={1.5}>
                  {teamMembers.map((member, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1.5,
                        border: '1.5px solid #E1BEE7',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#fff',
                        boxShadow: '0 2px 8px #7C4DFF11',
                        transition: 'box-shadow 0.2s, border-color 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 16px #7C4DFF22',
                          borderColor: '#7C4DFF',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#EDE7F6', color: '#7C4DFF', width: 36, height: 36, fontWeight: 700, fontSize: 18, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                          {member.name[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ color: '#7C4DFF', fontSize: 18 }} />
                            <Typography variant="subtitle2" sx={{ color: '#4527A0', fontWeight: 700, fontSize: '1.05rem', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                              {member.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                            <WorkIcon sx={{ color: '#8F9BB3', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: '#8F9BB3', fontWeight: 500, fontSize: '0.98rem', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                              {member.role}
                            </Typography>
                          </Box>
                          {member.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
                              <EmailIcon sx={{ color: '#8F9BB3', fontSize: 16 }} />
                              <Typography variant="body2" sx={{ color: '#8F9BB3', fontSize: '0.98rem', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                                {member.email}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <IconButton 
                        onClick={() => handleRemoveMember(index)}
                        size="medium"
                        sx={{ color: '#F44336', '&:hover': { bgcolor: '#FFEBEE', transform: 'scale(1.08)' } }}
                      >
                        <DeleteIcon sx={{ fontSize: 22 }} />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
            <Divider sx={{ mt: 3, mb: 2, borderColor: '#D1C4E9' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                size="medium"
                sx={{
                  minWidth: 100,
                  fontWeight: 700,
                  color: '#7C4DFF',
                  border: '1.5px solid #7C4DFF',
                  bgcolor: '#fff',
                  fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px #7C4DFF11',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#F3E5F5', transform: 'scale(1.05)' },
                }}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="medium"
                  sx={{
                    minWidth: 100,
                    fontWeight: 700,
                    bgcolor: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
                    color: '#fff',
                    fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px #7C4DFF22',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'linear-gradient(90deg, #7C4DFF 0%, #E040FB 100%)',
                      transform: 'scale(1.08)',
                      boxShadow: '0 4px 16px #E040FB33',
                    },
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleStepSubmit}
                  size="medium"
                  sx={{
                    minWidth: 100,
                    fontWeight: 700,
                    bgcolor: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
                    color: '#fff',
                    fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px #7C4DFF22',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'linear-gradient(90deg, #7C4DFF 0%, #E040FB 100%)',
                      transform: 'scale(1.08)',
                      boxShadow: '0 4px 16px #E040FB33',
                    },
                  }}
                >
                  Register
                </Button>
              )}
            </Box>
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