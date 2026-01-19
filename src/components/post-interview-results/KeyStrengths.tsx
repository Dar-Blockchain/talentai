import { Box, Typography, Stack } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface KeyStrengthsProps {
  strengths: string[];
}

export default function KeyStrengths({ strengths }: KeyStrengthsProps) {
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
            background: '#43e97b',
            borderRadius: '2px',
          },
        }}
      >
        Key Strengths
      </Typography>

      <Stack spacing={2}>
        {strengths.slice(0, 5).map((strength, index) => (
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
                boxShadow: '0 4px 12px rgba(67, 233, 123, 0.15)',
              },
            }}
          >
            <CheckCircleIcon sx={{ color: '#43e97b', fontSize: 20, mt: 0.5 }} />
            <Typography variant="body2" sx={{ color: '#424242', lineHeight: 1.6 }}>
              {strength}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
