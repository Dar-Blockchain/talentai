import { Box, Typography } from '@mui/material';
import React from 'react';

const RegistrationHeader: React.FC = () => (
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
      <Typography sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5, mb: 0.5, fontFamily: 'Nunito, Quicksand, Arial Rounded MT Bold, Arial, sans-serif', fontSize: { xs: '1.5rem', sm: '2.5rem' } }}>
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
);

export default RegistrationHeader; 