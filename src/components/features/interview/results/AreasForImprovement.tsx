import { Box, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AreasForImprovementProps {
  weaknesses: string[];
}

export default function AreasForImprovement({ weaknesses }: AreasForImprovementProps) {
  const { t } = useTranslation('modules/interview/results');

  return (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 1)',
        px: 5,
        py: 3,
        mb: 2,
        borderRadius: '12px',
        border: '1px solid rgba(84,98,116,0.1)',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: '#000000',
          fontSize: '20px',
          mb: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-4px',
            left: 0,
            width: '38px',
            height: '5px',
            background: '#fa709a',
            borderRadius: '2px',
          },
        }}
      >
        {t('improvements.title')}
      </Typography>

      {weaknesses.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic', py: 2 }}>
          {t('improvements.empty')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {weaknesses.slice(0, 5).map((weakness, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(250, 112, 154, 0.15)',
                },
              }}
            >
              <Box
                sx={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'rgba(250, 112, 154, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#fa709a',
                  mt: 0.5,
                }}
              >
                {index + 1}
              </Box>
              <Typography variant="body2" sx={{ color: '#424242', lineHeight: 1.6 }}>
                {weakness}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
