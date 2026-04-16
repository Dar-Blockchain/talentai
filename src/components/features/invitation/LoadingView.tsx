import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import Shell from './Shell';
import { TEAL } from './constants';

const LoadingView: React.FC = () => (
  <Shell>
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <CircularProgress size={32} thickness={3} sx={{ color: TEAL, mb: 2 }} />
      <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>
        Loading invitation…
      </Typography>
    </Box>
  </Shell>
);

export default LoadingView;
