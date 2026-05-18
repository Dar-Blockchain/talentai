import React from 'react';
import { Box, Typography } from '@mui/material';
import { PURPLE, PURPLE_LIGHT, PURPLE_BORDER } from '../../constants';

export const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', p: { xs: 2.5, md: 3 } }}>
    {children}
  </Box>
);

export const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PURPLE, flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Poppins' }}>
      {title}
    </Typography>
  </Box>
);

export const MetaBadge: React.FC<{ icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = ({ icon, label, color, bg, border }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2, px: 1.5, py: 0.75 }}>
    <Box sx={{ fontSize: 14, color, display: 'flex' }}>{icon}</Box>
    <Typography sx={{ fontSize: '12px', fontWeight: 600, color, fontFamily: 'Poppins' }}>{label}</Typography>
  </Box>
);
