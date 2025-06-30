import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Badge,
  Snackbar,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import Cookies from 'js-cookie';

interface TeamMember {
  name: string;
  email?: string;
  role: string;
}

interface ProjectData {
  projectName: string;
  projectDescription: string;
  teamMembers: TeamMember[];
  createdAt: string;
}

const HackathonDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, router]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const loadProjectData = () => {
      try {
        const storedData = localStorage.getItem('hackathonProject');
        if (storedData) {
          setProjectData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading project data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjectData();
  }, []);

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
    localStorage.clear();
    sessionStorage.clear();
    Object.keys(Cookies.get()).forEach(function(cookieName) {
      Cookies.remove(cookieName);
    });
    router.push('/signin');
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      <Container maxWidth={false}>
        <Box sx={{ py: 3 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 3,
            mb: 4,
            borderBottom: '2px solid #EDF1F7',
            px: { xs: 0, sm: 2, md: 0 },
            background: '#fff',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}>
            <Box>
              <Typography variant="h5" sx={{ color: '#2E3A59', fontWeight: 700, mb: 0.5, letterSpacing: 0.2 }}>
                {projectData.projectName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#8F9BB3', mt: 0.5 }}>
                Last updated: {new Date(projectData.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Settings">
                <IconButton sx={{ color: '#2E3A59', ml: 2, p: 1.2, border: '1px solid #EDF1F7', bgcolor: '#FAFAFA', '&:hover': { bgcolor: '#F5F5F5' } }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ ml: 2, borderColor: '#F44336', color: '#F44336', fontWeight: 600, '&:hover': { bgcolor: '#FFEBEE', borderColor: '#D32F2F', color: '#D32F2F' } }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', border: '1px solid #EDF1F7' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#E3F2FD', width: 40, height: 40 }}>
                    <PersonIcon sx={{ color: '#2196F3' }} />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography sx={{ color: '#8F9BB3' }} variant="body2">Team Size</Typography>
                    <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 600 }}>
                      {projectData.teamMembers.length} Members
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', border: '1px solid #EDF1F7' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#E8F5E9', width: 40, height: 40 }}>
                    <CalendarTodayIcon sx={{ color: '#4CAF50' }} />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography sx={{ color: '#8F9BB3' }} variant="body2">Project Created</Typography>
                    <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 600 }}>
                      {new Date(projectData.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', border: '1px solid #EDF1F7' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#EDE7F6', width: 40, height: 40 }}>
                    <WorkIcon sx={{ color: '#673AB7' }} />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography sx={{ color: '#8F9BB3' }} variant="body2">AI Meetings</Typography>
                    <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 600 }}>
                      2 Available
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
            {/* Left Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Quick Actions */}
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', border: '1px solid #EDF1F7' }}>
                <CardHeader 
                  title="AI Meetings" 
                  titleTypographyProps={{ 
                    variant: 'subtitle1', 
                    fontWeight: 600,
                    color: '#2E3A59'
                  }}
                  sx={{ pb: 1 }}
                />
                <Divider sx={{ borderColor: '#EDF1F7' }} />
                <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                  <Button
                    variant="outlined"
                    startIcon={<BusinessIcon sx={{ color: '#2196F3' }} />}
                    size="small"
                    sx={{ 
                      borderColor: '#2196F3',
                      color: '#2196F3',
                      '&:hover': { 
                        borderColor: '#1976D2', 
                        bgcolor: 'rgba(33, 150, 243, 0.04)',
                        color: '#1976D2'
                      }
                    }}
                  >
                    Business Meeting
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CodeIcon sx={{ color: '#673AB7' }} />}
                    size="small"
                    sx={{ 
                      borderColor: '#673AB7',
                      color: '#673AB7',
                      '&:hover': { 
                        borderColor: '#5E35B1', 
                        bgcolor: 'rgba(103, 58, 183, 0.04)',
                        color: '#5E35B1'
                      }
                    }}
                  >
                    Technical Meeting
                  </Button>
                </CardContent>
              </Card>

              {/* Project Description */}
              <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', border: '1px solid #EDF1F7' }}>
                <CardHeader 
                  title="Project Details" 
                  titleTypographyProps={{ 
                    variant: 'subtitle1', 
                    fontWeight: 600,
                    color: '#2E3A59'
                  }}
                  sx={{ pb: 1 }}
                />
                <Divider sx={{ borderColor: '#EDF1F7' }} />
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" sx={{ color: '#2E3A59', whiteSpace: 'pre-wrap' }}>
                    {projectData.projectDescription}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Right Column - Team Members */}
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', bgcolor: '#FFFFFF', border: '1px solid #EDF1F7' }}>
              <CardHeader 
                title="Team Members" 
                titleTypographyProps={{ 
                  variant: 'subtitle1', 
                  fontWeight: 600,
                  color: '#2E3A59'
                }}
                sx={{ pb: 1 }}
              />
              <Divider sx={{ borderColor: '#EDF1F7' }} />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                {projectData.teamMembers.map((member, index) => (
                  <Box key={index}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: '#E3F2FD',
                          color: '#2196F3',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}
                      >
                        {member.name[0].toUpperCase()}
                      </Avatar>
                      <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ color: '#2E3A59', fontWeight: 600 }} noWrap>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8F9BB3' }} noWrap>
                          {member.role}
                        </Typography>
                      </Box>
                    </Box>
                    {index < projectData.teamMembers.length - 1 && (
                      <Divider sx={{ borderColor: '#EDF1F7' }} />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HackathonDashboard; 