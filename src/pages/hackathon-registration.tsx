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
import Cookies from 'js-cookie';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';

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
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 } }}>
      <Fade in timeout={600}>
        <Box>
          <Box sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" sx={{ color: '#5E35B1', fontWeight: 800, mb: 0.5, letterSpacing: 0.3, fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>
              Hackathon Registration
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#7C7C7C', mb: 1, fontWeight: 500, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
              Register your project and team for the hackathon
            </Typography>
          </Box>
          <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, border: '1px solid #EDE7F6', background: 'linear-gradient(135deg, #F3E5F5 0%, #E3F2FD 100%)', boxShadow: '0 2px 8px rgba(103,58,183,0.05)' }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: '0.95rem' }}>
                {error}
              </Alert>
            )}
            {/* Step Content */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Leader Info
                </Typography>
                <Stack spacing={1.2} direction={{ xs: 'column', sm: 'row', md: 'column' }}>
                  <TextField
                    label="Leader First Name"
                    value={leaderFirstName}
                    onChange={(e) => setLeaderFirstName(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    size="small"
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                  />
                  <TextField
                    label="Leader Last Name"
                    value={leaderLastName}
                    onChange={(e) => setLeaderLastName(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    size="small"
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                  />
                </Stack>
              </Box>
            )}
            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Project Info
                </Typography>
                <Stack spacing={1.2}>
                  <TextField
                    label="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    fullWidth
                    required
                    variant="outlined"
                    size="small"
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
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
                    size="small"
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                  />
                </Stack>
              </Box>
            )}
            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#4527A0', fontWeight: 700, mb: 1, letterSpacing: 0.1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Team Members
                </Typography>
                <Paper sx={{
                  p: 1.2,
                  mb: 2,
                  borderRadius: 1.5,
                  bgcolor: '#F3E5F5',
                  border: '1px solid #E1BEE7',
                  boxShadow: '0 1px 4px rgba(103,58,183,0.04)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  alignItems: 'center',
                }}>
                  <TextField
                    label="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    size="small"
                    fullWidth
                    variant="outlined"
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    InputProps={{ startAdornment: <PersonIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 18 }} /> }}
                  />
                  <TextField
                    label="Email (Optional)"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    size="small"
                    fullWidth
                    variant="outlined"
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    InputProps={{ startAdornment: <EmailIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 18 }} /> }}
                  />
                  <TextField
                    label="Role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    size="small"
                    fullWidth
                    variant="outlined"
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    InputProps={{ startAdornment: <WorkIcon sx={{ color: '#B39DDB', mr: 0.5, fontSize: 18 }} /> }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
                    <IconButton 
                      onClick={handleAddMember}
                      size="small"
                      sx={{ 
                        bgcolor: '#7C4DFF',
                        color: '#fff',
                        border: '1px solid #7C4DFF',
                        '&:hover': { bgcolor: '#5E35B1', borderColor: '#5E35B1' },
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 4px rgba(103,58,183,0.08)'
                      }}
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Paper>
                <Divider sx={{ my: 1.2, borderColor: '#D1C4E9' }} />
                <Stack spacing={1.2}>
                  {teamMembers.map((member, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1.2,
                        border: '1px solid #E1BEE7',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#fff',
                        boxShadow: '0 2px 8px rgba(103,58,183,0.04)',
                        transition: 'box-shadow 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(103,58,183,0.10)',
                          borderColor: '#7C4DFF',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar sx={{ bgcolor: '#EDE7F6', color: '#7C4DFF', width: 32, height: 32, fontWeight: 700, fontSize: 16 }}>
                          {member.name[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <PersonIcon sx={{ color: '#7C4DFF', fontSize: 16 }} />
                            <Typography variant="subtitle2" sx={{ color: '#4527A0', fontWeight: 700, fontSize: '0.98rem' }}>
                              {member.name}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 0.2 }}>
                            <WorkIcon sx={{ color: '#8F9BB3', fontSize: 14 }} />
                            <Typography variant="body2" sx={{ color: '#8F9BB3', fontWeight: 500, fontSize: '0.92rem' }}>
                              {member.role}
                            </Typography>
                          </Box>
                          {member.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 0.2 }}>
                              <EmailIcon sx={{ color: '#8F9BB3', fontSize: 14 }} />
                              <Typography variant="body2" sx={{ color: '#8F9BB3', fontSize: '0.92rem' }}>
                                {member.email}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <IconButton 
                        onClick={() => handleRemoveMember(index)}
                        size="small"
                        sx={{ color: '#F44336', '&:hover': { bgcolor: '#FFEBEE' } }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
            {/* Stepper Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                size="small"
                sx={{ minWidth: 90 }}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="small"
                  sx={{ minWidth: 90, bgcolor: '#7C4DFF', '&:hover': { bgcolor: '#5E35B1' } }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleStepSubmit}
                  size="small"
                  sx={{ minWidth: 90, bgcolor: '#7C4DFF', '&:hover': { bgcolor: '#5E35B1' } }}
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