import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { PURPLE } from '../../constants/colors';

interface Props {
  overall: number;
  label: string;
}

export default function InterviewProgressBar({ overall, label }: Props) {
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e8e2f5', px: { xs: 2.5, md: 3.5 }, py: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem', color: PURPLE }}>
          {Math.round(overall)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(overall, 100)}
        sx={{ height: 6, borderRadius: 4, bgcolor: 'rgba(131,16,255,0.08)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#8310FF,#a855f7)', borderRadius: 4 } }}
      />
    </Box>
  );
}
