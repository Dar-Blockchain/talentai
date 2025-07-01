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
import HeroHeader from '@/components/dashboard-hackathon/HeroHeader';
import StatsCards from '@/components/dashboard-hackathon/StatsCards';
import QuickActions from '@/components/dashboard-hackathon/QuickActions';
import ProjectDetails from '@/components/dashboard-hackathon/ProjectDetails';
import TeamMembers from '@/components/dashboard-hackathon/TeamMembers';


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
        <HeroHeader projectData={projectData} handleLogout={handleLogout} />
        <Box sx={{
          borderRadius: 4,
          background: 'rgba(255,255,255,0.75)',
          boxShadow: '0 8px 32px 0 rgba(94,53,177,0.10)',
          backdropFilter: 'blur(10px)',
          p: { xs: 2, sm: 4 },
        }}>
          <StatsCards projectData={projectData} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <QuickActions />
              <ProjectDetails projectDescription={projectData.projectDescription} />
            </Box>
            <TeamMembers teamMembers={projectData.teamMembers} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HackathonDashboard; 