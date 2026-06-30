import React from 'react';
import { Box, Typography } from '@mui/material';
import { TEAL } from './constants';

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
  last?: boolean;
}> = ({ icon, label, value, iconColor = TEAL, last = false }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: 2,
    py: 1.75, px: 2.5,
    borderBottom: last ? 'none' : '1px solid #F1F5F9',
  }}>
    <Box sx={{ color: iconColor, display: 'flex', flexShrink: 0, '& svg': { fontSize: 18 } }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        {label}
      </Typography>
      {typeof value === 'string'
        ? <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
            {value}
          </Typography>
        : value}
    </Box>
  </Box>
);

export default InfoRow;
