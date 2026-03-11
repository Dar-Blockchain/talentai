import React from 'react';
import Image from 'next/image';
import { Box, Container, Typography } from '@mui/material';

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{
    minHeight: '100vh', bgcolor: '#F8FAFC',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    pt: { xs: 4, sm: 7 }, pb: 6, px: 2,
  }}>
    <Container maxWidth="sm" sx={{ flex: 1 }}>{children}</Container>

    <Box sx={{ mt: 5, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Image src="/logo-purple.svg" alt="TalentAI" width={90} height={20} />
      <Typography sx={{ color: '#CBD5E1', fontSize: '0.75rem' }}>
        © {new Date().getFullYear()} TalentAI
      </Typography>
    </Box>
  </Box>
);

export default Shell;
