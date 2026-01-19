import { Box, Typography, CircularProgress } from '@mui/material';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';

export default function LoadingState() {
  return (
    <PageContainer>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 12,
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: '#667eea', mb: 3 }}
        />
        <Typography variant="h6" sx={{ color: '#6b7280' }}>
          Loading your results...
        </Typography>
      </Box>
    </PageContainer>
  );
}
