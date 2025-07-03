import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, Fade } from '@mui/material';
import ActionButton from '@/components/ActionButton';
import UsersIcon from '@/components/icons/UsersIcon';
import VerifiedIcon from '@/components/icons/VerifiedIcon';
import FeedBackIcon from '@/components/icons/FeedBackIcon';
import { useDispatch, useSelector } from 'react-redux';
import { getMyProfile, selectProfile } from '@/store/slices/profileSlice';
import { AppDispatch, RootState } from '@/store/store';

// Activation page for project invitations
// TODO: Fetch real project and sender data using projectId and token from backend
// Route: /projects/activate/?projectId=...&token=...

const bgUrl = '/backgroundPurple.png';

const ProjectActivatePage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector(selectProfile);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { projectId, token } = router.query;
  const [projectName, setProjectName] = useState('Hackathon Project');
  const [senderName, setSenderName] = useState('John Doe');

  useEffect(() => {
    // If not authenticated, redirect to signin with callback to this page
    if (isAuthenticated === false) {
      const callbackUrl = `/projects/activate?projectId=${projectId}&token=${token}`;
      router.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    if (isAuthenticated) {
      dispatch(getMyProfile());
    }
    // Fetch project name by projectId
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const token1 = localStorage.getItem('api_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/getProjectById/${projectId}`, {
          headers: token1 ? { Authorization: `Bearer ${token1}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();
        setProjectName(data.name || data.Name || 'Hackathon Project');
      } catch (err) {
        setProjectName('Hackathon Project');
      }
    };
    fetchProject();
  }, [dispatch, isAuthenticated, projectId, token, router]);

  // Get user's name from profile
  const userFirstName = profile?.userId?.FirstName || '';
  const userLastName = profile?.userId?.LastName || '';
  const userFullName = userFirstName || userLastName ? `${userFirstName} ${userLastName}`.trim() : 'Your Name';

  const handleJoin = async () => {
    if (!projectId || !token) {
      window.alert('Missing projectId or token.');
      return;
    }
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/';
      const url = `${apiBase}project/activate`;
      const token = localStorage.getItem('api_token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId, token }),
      });
      if (!res.ok) throw new Error('Activation failed');
      window.alert('Project activated successfully!');
      // Optionally redirect or update UI here
    } catch (err) {
      window.alert('Failed to activate project.');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
      }}
    >
      {/* Glassmorphism Card, centered */}
      <Fade in timeout={600}>
        <Paper
          elevation={6}
          sx={{
            position: 'relative',
            zIndex: 2,
            minWidth: { xs: 320, sm: 400 },
            maxWidth: 420,
            px: { xs: 3, sm: 5 },
            py: { xs: 5, sm: 6 },
            borderRadius: 5,
            boxShadow: '0 4px 24px 0 rgba(80,40,180,0.08)',
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(18px) saturate(1.1)',
            border: '1px solid rgba(162,89,255,0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          {/* Floating Verified Badge */}
          <Box sx={{ position: 'absolute', top: -32, right: 20, zIndex: 3 }}>
            <VerifiedIcon />
          </Box>
          {/* Main Icon */}
          <Box sx={{ mb: 2, mt: 1 }}>
            <UsersIcon />
          </Box>
          <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ color: '#3a2c5c', textShadow: '0 1px 6px #a259ff22' }}>
            You&apos;ve Been Invited!
          </Typography>
          <Typography variant="subtitle1" fontWeight={400} textAlign="center" sx={{ color: '#5e5e7a', mb: 1 }}>
            <b>{userFullName}</b> has invited you to join the hackathon project <b>{projectName}</b>.
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ color: '#7b7b8b', mb: 2 }}>
            Accept the invitation to collaborate and make an impact.<br />
            Join a talented team and build something amazing!
          </Typography>
          <ActionButton
            icon={<FeedBackIcon />}
            label="Accept Invitation"
            tooltip="Join this hackathon project"
            onClick={handleJoin}
          />
        </Paper>
      </Fade>
      {/* Subtle glowing Accept button style */}
    
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          py: 2,
          px: 2,
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(20,20,40,0.10)',
            borderRadius: 3,
            px: 2.5,
            py: 1,
            boxShadow: '0 1px 6px 0 #0002',
            color: '#5e5e7a',
            fontSize: { xs: 13, sm: 15 },
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: 340,
          }}
        >
          Powered by <b>TalentAI Hackathon Platform</b>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectActivatePage; 