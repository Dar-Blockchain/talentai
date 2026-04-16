import { Box, Typography, Stack, Chip, LinearProgress } from '@mui/material';
import { getScoreColor, getScoreBg } from './utils';

interface CoverageDetailsProps {
  coverage: { [key: string]: any };
}

export default function CoverageDetails({ coverage }: CoverageDetailsProps) {
  if (!coverage || Object.keys(coverage).length === 0) {
    return null;
  }

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
            background: '#667eea',
            borderRadius: '2px',
          },
        }}
      >
        Detailed Coverage Analysis
      </Typography>

      <Stack spacing={3}>
        {Object.entries(coverage).map(([areaName, areaData]: [string, any]) => (
          <Box key={areaName}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600} textTransform="capitalize">
                {areaName.replace(/_/g, ' ')}
              </Typography>
              <Chip
                label={`${Math.round(areaData.percentage || 0)}%`}
                size="small"
                sx={{
                  background: getScoreBg(areaData.percentage || 0),
                  color: '#1a1a1a',
                  fontWeight: 700,
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={areaData.percentage || 0}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(areaData.percentage || 0),
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
