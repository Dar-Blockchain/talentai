import React from 'react';
import { Box } from '@mui/material';

const CardHeader: React.FC<{
  gradient: string;
  glow: string;
  iconBg: string;
  icon: React.ReactNode;
  height?: number;
}> = ({ gradient, glow, iconBg, icon, height = 88 }) => (
  <>
    <Box sx={{ height, background: gradient, borderBottom: '1px solid #F1F5F9', position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: glow }} />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: '-32px', mb: 2.5, position: 'relative', zIndex: 1 }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: '16px',
        bgcolor: iconBg, border: '3px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        {icon}
      </Box>
    </Box>
  </>
);

export default CardHeader;
