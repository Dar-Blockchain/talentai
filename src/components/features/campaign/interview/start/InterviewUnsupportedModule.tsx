import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackOutlined   from '@mui/icons-material/ArrowBackOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';

interface Props {
  moduleType: string;
  onBack: () => void;
}

const InterviewUnsupportedModule: React.FC<Props> = ({ moduleType, onBack }) => (
  <Box sx={{ textAlign: 'center', py: 10 }}>
    <WarningAmberOutlined sx={{ fontSize: 52, color: '#F59E0B', mb: 2 }} />
    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#111827', mb: 1 }}>
      Module not supported here
    </Typography>
    <Typography sx={{ fontSize: 14, color: '#6B7280', mb: 4 }}>
      The <strong>{moduleType}</strong> module cannot be taken through this interface.
    </Typography>
    <Button
      variant="outlined"
      startIcon={<ArrowBackOutlined />}
      onClick={onBack}
      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
    >
      Back to Campaign
    </Button>
  </Box>
);

export default InterviewUnsupportedModule;
