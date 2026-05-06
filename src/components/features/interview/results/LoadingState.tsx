import { Box, Typography, CircularProgress } from '@mui/material';
import PageContainer from '@/components/layout/PageContainer';
import Header from '@/components/layout/Header';
import { useTranslation } from 'react-i18next';

export default function LoadingState() {
  const { t } = useTranslation('modules/interview/results');

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
          {t('loading')}
        </Typography>
      </Box>
    </PageContainer>
  );
}
