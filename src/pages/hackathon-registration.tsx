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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Cookies from 'js-cookie';

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    // Remove all cookies
    Object.keys(Cookies.get()).forEach(function(cookieName) {
      Cookies.remove(cookieName);
    });
    setSnackbarOpen(true);
    setTimeout(() => {
      router.push('/signin');
    }, 1200);
  };

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

  const handleSubmit = () => {
    if (!projectName || !projectDescription || teamMembers.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    try {
      // Store project data in localStorage
      const projectData = {
        projectName,
        projectDescription,
        teamMembers,
        progress: 0,
        submissionStatus: 'Not Submitted',
        deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('hackathonProject', JSON.stringify(projectData));

      // Redirect to hackathon dashboard
      router.push('/hackathon-dashboard');
    } catch (err) {
      setError('Failed to save project data. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 4, mb: 0 }}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          sx={{ borderColor: '#F44336', color: '#F44336', fontWeight: 600, '&:hover': { bgcolor: '#FFEBEE', borderColor: '#D32F2F', color: '#D32F2F' } }}
          onClick={handleLogout}
          disabled={snackbarOpen}
        >
          Logout
        </Button>
      </Box>
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" sx={{ color: '#2E3A59', fontWeight: 700, mb: 2, letterSpacing: 0.2 }}>
          Hackathon Registration
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ color: '#8F9BB3', mb: 2 }}>
          Register your project and team for the hackathon
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, border: '1px solid #EDF1F7', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Project Info Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 600, mb: 2 }}>
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
            />
            <TextField
              label="Project Description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Team Members Section */}
        <Box>
          <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 600, mb: 2 }}>
            Team Members
          </Typography>

          {/* Add Member Row */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#F7F9FC', border: '1px solid #EDF1F7' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                size="small"
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Email (Optional)"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                size="small"
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Role"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                size="small"
                fullWidth
                variant="outlined"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
                <IconButton 
                  onClick={handleAddMember}
                  sx={{ 
                    bgcolor: '#2196F3',
                    color: '#fff',
                    border: '1px solid #2196F3',
                    '&:hover': { bgcolor: '#1976D2', borderColor: '#1976D2' },
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(33,150,243,0.08)'
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Stack>
          </Paper>

          {/* Team Members List */}
          <Stack spacing={2}>
            {teamMembers.map((member, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  border: '1px solid #EDF1F7',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#FAFAFA',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#E3F2FD', color: '#2196F3', width: 36, height: 36, fontWeight: 600 }}>
                    {member.name[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#2E3A59', fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8F9BB3' }}>
                      {member.role}
                    </Typography>
                    {member.email && (
                      <Typography variant="body2" sx={{ color: '#8F9BB3' }}>
                        {member.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton 
                  onClick={() => handleRemoveMember(index)}
                  size="small"
                  sx={{ color: '#F44336', '&:hover': { bgcolor: '#FFEBEE' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              mt: 4,
              bgcolor: '#673AB7',
              '&:hover': { bgcolor: '#5E35B1' },
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              minWidth: '200px',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(103,58,183,0.08)',
              transition: 'all 0.2s',
            }}
          >
            Register Project
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1200}
        message="Logged out successfully"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Container>
  );
};

export default HackathonRegistration; 