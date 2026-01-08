import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

const TeamMembersEmptyState: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 4,
        backgroundColor: '#f8fafc',
        borderRadius: 3,
      }}
    >
      <PeopleIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
      <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
        No Team Members Yet
      </Typography>
      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
        Start building your team by inviting members
      </Typography>
    </Box>
  );
};

export default memo(TeamMembersEmptyState);
