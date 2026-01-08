import React, { memo } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

interface TeamMembersHeaderProps {
  showActivateButton: boolean;
  activating: boolean;
  onActivateAccount: () => void;
  onAddMember: () => void;
}

const TeamMembersHeader: React.FC<TeamMembersHeaderProps> = ({
  showActivateButton,
  activating,
  onActivateAccount,
  onAddMember,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
          Team Members
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Manage your team members and their permissions
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {showActivateButton ? (
          <Button
            variant="contained"
            onClick={onActivateAccount}
            disabled={activating}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
              },
              '&.Mui-disabled': {
                background: '#e2e8f0',
                color: '#94a3b8',
              },
            }}
          >
            {activating ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1, color: 'white' }} />
                Activating...
              </>
            ) : (
              'Activate Shared Account'
            )}
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={onAddMember}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
              boxShadow: '0 4px 12px rgba(131, 16, 255, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6b0fd9 0%, #9333ea 100%)',
                boxShadow: '0 6px 16px rgba(131, 16, 255, 0.4)',
              },
            }}
          >
            Add Member
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default memo(TeamMembersHeader);
