import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface DashboardHeaderProps {
  onBrowseJobs: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onBrowseJobs }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        borderRadius: 4,
        p: 4,
        mb: 4,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      
    </Box>
  );
};

export default React.memo(DashboardHeader);
