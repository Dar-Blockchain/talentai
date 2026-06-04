import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  text: string;
}

export default function InterviewConnectionBanner({ text }: Props) {
  return (
    <Box sx={{ bgcolor: '#fefce8', borderBottom: '1px solid #fde047', px: { xs: 2, md: 4 }, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ca8a04', flexShrink: 0 }} />
      <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#854d0e' }}>
        {text}
      </Typography>
    </Box>
  );
}
