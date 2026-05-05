import { Box, Typography, CircularProgress } from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { InterviewAnalysis } from './types';
import { useTranslation } from 'react-i18next';

interface ResultsHeaderProps {
  analysis: InterviewAnalysis;
}

export default function ResultsHeader({ analysis }: ResultsHeaderProps) {
  const { t } = useTranslation('modules/interview/results');

  const formatDuration = (duration: number) => {
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes} min ${seconds}s` : `${seconds}s`;
  };

  const getAssessmentTitle = () => {
    if (analysis.skillScores.length > 0 && analysis.skillScores[0].skill !== 'General Interview') {
      return `${analysis.skillScores[0].skill} Assessment Results`;
    }
    return `${analysis.interviewType.replace('_', ' ')} Assessment Results`;
  };

  return (
    <Box
      sx={{
        background: 'rgba(255, 255, 255, 1)',
        px: 5,
        py: 3,
        mb: 2,
        borderRadius: '12px',
        border: '1px solid rgba(84,98,116,0.1)',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 4,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      {/* Left Section */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <TrophyIcon sx={{ fontSize: 32, color: '#ffd700' }} />
          <Typography
            variant="h4"
            sx={{
              color: '#000000',
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontFamily: 'Poppins',
              fontWeight: 600,
            }}
          >
            {t('header.complete')}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            fontSize: '14px',
            mb: 3,
            fontWeight: 400,
          }}
        >
          {getAssessmentTitle()}
        </Typography>

        {/* Info Row */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 3 },
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ color: 'rgba(189, 133, 255, 1)', fontSize: '1.1rem' }} />
            <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.875rem' }}>
              {new Date(analysis.completedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ color: 'rgba(189, 133, 255, 1)', fontSize: '1.1rem' }} />
            <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.875rem' }}>
              {formatDuration(analysis.duration)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: 'rgba(189, 133, 255, 1)', fontSize: '1.1rem' }} />
            <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.875rem' }}>
              {t('header.level')} {analysis.overallLevel}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Section - Score Card */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={100}
              thickness={5}
              sx={{ color: '#f0f0f0' }}
            />
            <CircularProgress
              variant="determinate"
              value={analysis.overallScore}
              size={100}
              thickness={5}
              sx={{
                position: 'absolute',
                left: 0,
                color: '#667eea',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#667eea' }}>
                {Math.round(analysis.overallScore)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 600 }}>
                {t('header.score')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
