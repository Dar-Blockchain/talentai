import React from 'react';
import { Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';

interface BackToDashboardButtonProps {
  profileType: 'Candidate' | 'Company';
}

const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({ profileType }) => {
  const router = useRouter();

  const handleClick = () => {
    const dashboardPath = profileType === 'Company'
      ? '/company/dashboard'
      : '/dashboard/candidate';
    router.push(dashboardPath);
  };

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={handleClick}
      sx={{
        mb: 3,
        color: '#8310FF',
        textTransform: 'none',
        fontWeight: 600,
        '&:hover': {
          backgroundColor: 'rgba(131, 16, 255, 0.08)',
        },
      }}
    >
      Back to Dashboard
    </Button>
  );
};

export default React.memo(BackToDashboardButton);
