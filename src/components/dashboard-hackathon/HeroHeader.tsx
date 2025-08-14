import { Box, Typography, IconButton, Button, Tooltip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';

interface ProjectData {
  name: string;
  createdAt: string;
  track?: string;
}

interface HeroHeaderProps {
  projectData: ProjectData;
  handleLogout: () => void;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ projectData, handleLogout }) => (
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
        {projectData.name}
      </Typography>
      {projectData.track && (
        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 0.5, fontSize: { xs: '1.08rem', sm: '1.18rem' }, fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: 0.2 }}>
          Track: {projectData.track}
        </Typography>
      )}
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
);

export default HeroHeader; 