import React from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  connectionStatus: string;
}

const MESSAGES: Record<string, string> = {
  connecting:   'Connecting to interview system…',
  error:        'Connection error — please refresh',
  disconnected: 'Disconnected — attempting to reconnect…',
};

const InterviewConnectionBanner: React.FC<Props> = ({ connectionStatus }) => (
  <Box sx={{
    bgcolor: 'rgba(245,158,11,0.1)',
    borderBottom: '1px solid rgba(245,158,11,0.2)',
    px: { xs: 2, md: 4 },
    py: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
  }}>
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#F59E0B', flexShrink: 0 }} />
    <Typography sx={{ fontSize: 12, color: '#92400E' }}>
      {MESSAGES[connectionStatus] ?? 'Connection issue — please wait…'}
    </Typography>
  </Box>
);

export default InterviewConnectionBanner;
