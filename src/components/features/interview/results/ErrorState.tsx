import { Box, Typography, Button, Stack, Avatar } from '@mui/material';
import {
  Home as HomeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';

interface ErrorStateProps {
  error: string | null;
}

export default function ErrorState({ error }: ErrorStateProps) {
  const router = useRouter();

  return (
    <PageContainer>
      <Header />
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 1)',
          px: 5,
          py: 4,
          borderRadius: '12px',
          border: '1px solid rgba(84,98,116,0.1)',
          textAlign: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            backgroundColor: '#fff3e0',
            margin: '0 auto 16px',
          }}
        >
          <WarningIcon sx={{ fontSize: 40, color: '#fa709a' }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
          No Analysis Data Available
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, maxWidth: 400, mx: 'auto' }}>
          {error || 'No interview data found. This could be because the interview was not completed or the session has expired.'}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => {
              window.location.href = '/dashboard/candidate';
            }}
            sx={{
              background: 'rgba(163, 98, 239, 1)',
              color: '#ffffff',
              fontWeight: 600,
              borderRadius: '38px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(163, 98, 239, 0.8)',
              },
            }}
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/interview')}
            sx={{
              border: '1px solid rgba(25, 25, 25, 1)',
              color: '#000000',
              fontWeight: 600,
              borderRadius: '38px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(25, 25, 25, 1)',
                background: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Take New Interview
          </Button>
        </Stack>
      </Box>
    </PageContainer>
  );
}
