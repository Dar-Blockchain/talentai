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
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { keyframes } from '@mui/system';

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

const blobAnimation = keyframes`
  0% { transform: scale(1) translateY(0px); }
  50% { transform: scale(1.1) translateY(20px); }
  100% { transform: scale(1) translateY(0px); }
`;

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
    <Box >
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
      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero/Header */}
        <Box sx={{
          mt: 4,
          mb: 4,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(94,53,177,0.13)',
          background: 'linear-gradient(120deg, #7C4DFF 0%, #5E35B1 100%)',
          minHeight: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
          backdropFilter: 'blur(8px)',
          border: '1.5px solid #fff3',
        }}>
          <Box sx={{ zIndex: 2 }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5, mb: 0.5, fontFamily: 'Nunito, Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontSize: { xs: '1.5rem', sm: '2.2rem' } }}>
              <EmojiEventsIcon sx={{ fontSize: 36, mr: 1, verticalAlign: 'middle', color: '#FFD600' }} />
              {projectData.projectName}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#E1BEE7', fontWeight: 500, fontSize: { xs: '1.05rem', sm: '1.15rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
              Last updated: {new Date(projectData.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, zIndex: 1 }}>
            <svg width="90" height="90" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Settings">
              <IconButton sx={{ color: '#fff', ml: 2, p: 1.2, border: '1.5px solid #fff3', bgcolor: '#7C4DFF', '&:hover': { bgcolor: '#5E35B1' } }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ ml: 2, borderColor: '#FFD600', color: '#FFD600', fontWeight: 600, '&:hover': { bgcolor: '#FFF9C4', borderColor: '#FFD600', color: '#5E35B1' } }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
        {/* Glassmorphism Main Card */}
        <Box sx={{
          borderRadius: 4,
          background: 'rgba(255,255,255,0.75)',
          boxShadow: '0 8px 32px 0 rgba(94,53,177,0.10)',
          backdropFilter: 'blur(10px)',
          p: { xs: 2, sm: 4 },
        }}>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
            <Card sx={{ boxShadow: '0 4px 16px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 32px #7C4DFF22' } }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #7C4DFF 0%, #2196F3 100%)', width: 44, height: 44, boxShadow: '0 2px 8px #7C4DFF33' }}>
                    <PersonIcon sx={{ color: '#fff' }} />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography sx={{ color: '#8F9BB3' }} variant="body2">Team Size</Typography>
                    <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 700 }}>
                      {projectData.teamMembers.length} Members
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ boxShadow: '0 4px 16px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 32px #7C4DFF22' } }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #E040FB 0%, #4CAF50 100%)', width: 44, height: 44, boxShadow: '0 2px 8px #E040FB33' }}>
                    <CalendarTodayIcon sx={{ color: '#fff' }} />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography sx={{ color: '#8F9BB3' }} variant="body2">Project Created</Typography>
                    <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 700 }}>
                      {new Date(projectData.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ boxShadow: '0 4px 16px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 8px 32px #7C4DFF22' } }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #FFD600 0%, #7C4DFF 100%)', width: 44, height: 44, boxShadow: '0 2px 8px #FFD60033' }}>
                    <WorkIcon sx={{ color: '#7C4DFF' }} />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography sx={{ color: '#8F9BB3' }} variant="body2">AI Meetings</Typography>
                    <Typography variant="h6" sx={{ color: '#2E3A59', fontWeight: 700 }}>
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
              <Card sx={{ boxShadow: '0 2px 8px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' } }}>
                <CardHeader 
                  title="AI Meetings" 
                  titleTypographyProps={{ 
                    variant: 'subtitle1', 
                    fontWeight: 700,
                    color: '#7C4DFF',
                    fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif'
                  }}
                  sx={{ pb: 1 }}
                />
                <Divider sx={{ borderColor: '#EDE7F6' }} />
                <CardContent sx={{ display: 'flex', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
                  <Button
                    variant="outlined"
                    startIcon={<BusinessIcon sx={{ color: '#2196F3' }} />}
                    size="small"
                    sx={{ 
                      borderColor: '#2196F3',
                      color: '#2196F3',
                      fontWeight: 700,
                      borderRadius: 2,
                      fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                      boxShadow: '0 1px 4px #2196F322',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        borderColor: '#1976D2', 
                        bgcolor: 'rgba(33, 150, 243, 0.04)',
                        color: '#1976D2',
                        boxShadow: '0 2px 8px #2196F344',
                        transform: 'scale(1.05)'
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
                      fontWeight: 700,
                      borderRadius: 2,
                      fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                      boxShadow: '0 1px 4px #673AB722',
                      transition: 'all 0.2s',
                      '&:hover': { 
                        borderColor: '#5E35B1', 
                        bgcolor: 'rgba(103, 58, 183, 0.04)',
                        color: '#5E35B1',
                        boxShadow: '0 2px 8px #673AB744',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    Technical Meeting
                  </Button>
                </CardContent>
              </Card>
              {/* Project Description */}
              <Card sx={{ boxShadow: '0 2px 8px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' } }}>
                <CardHeader 
                  title="Project Details" 
                  titleTypographyProps={{ 
                    variant: 'subtitle1', 
                    fontWeight: 700,
                    color: '#7C4DFF',
                    fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif'
                  }}
                  sx={{ pb: 1 }}
                />
                <Divider sx={{ borderColor: '#EDE7F6' }} />
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" sx={{ color: '#2E3A59', whiteSpace: 'pre-wrap', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                    {projectData.projectDescription}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            {/* Right Column - Team Members */}
            <Card sx={{ boxShadow: '0 2px 8px #7C4DFF11', bgcolor: '#FFFFFF', border: '1.5px solid #EDE7F6', borderRadius: 3, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px #7C4DFF22' } }}>
              <CardHeader 
                title="Team Members" 
                titleTypographyProps={{ 
                  variant: 'subtitle1', 
                  fontWeight: 700,
                  color: '#7C4DFF',
                  fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif'
                }}
                sx={{ pb: 1 }}
              />
              <Divider sx={{ borderColor: '#EDE7F6' }} />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                {projectData.teamMembers.map((member, index) => (
                  <Box key={index}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Tooltip title={member.email || ''} placement="top" arrow>
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: 'linear-gradient(135deg, #7C4DFF 0%, #2196F3 100%)',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
                            boxShadow: '0 2px 8px #7C4DFF33',
                          }}
                        >
                          {member.name[0].toUpperCase()}
                        </Avatar>
                      </Tooltip>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ color: '#2E3A59', fontWeight: 700, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }} noWrap>
                          {member.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#8F9BB3', fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }} noWrap>
                            {member.role}
                          </Typography>
                          {member.email && (
                            <Box sx={{ ml: 1, px: 1, py: 0.2, bgcolor: '#E3F2FD', borderRadius: 1, fontSize: '0.8rem', color: '#2196F3', fontWeight: 600, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif' }}>
                              Email
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    {index < projectData.teamMembers.length - 1 && (
                      <Divider sx={{ borderColor: '#EDE7F6' }} />
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