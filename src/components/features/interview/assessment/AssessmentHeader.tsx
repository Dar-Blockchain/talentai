import React from 'react';
import { Box, Typography, Chip, CircularProgress, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { sectionStyle, sectionTitleStyle, formatDuration } from './helpers';

interface AssessmentHeaderProps {
  assessment: any;
  container?: boolean;
}

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({ assessment, container = true }) => {
  const { t, i18n } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;
  const candidateName = assessment?.candidate?.username || s('unknown_user');
  const companyName = assessment?.company?.username || '';
  const jobTitle = assessment?.post?.jobDetails?.title || s('unknown_job');
  const interviewType = assessment?.interviewData?.interviewType || 'HR_INTERVIEW';
  const coverageScore = assessment?.interviewData?.finalReport?.coverage?.overall || 0;
  const timestamp = assessment?.createdAt || new Date().toISOString();
  const analytics = assessment?.interviewData?.analytics || {};

  const Content = (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="h5" sx={sectionTitleStyle()}>
            {s('header.title')}
          </Typography>
          <Chip
            label={interviewType.replace(/_/g, ' ')}
            size="small"
            sx={{
              backgroundColor: 'rgba(131, 16, 255, 0.1)',
              color: '#8310FF',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
              border: '1px solid #8310FF',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={coverageScore}
              size={60}
              thickness={5}
              sx={{ color: coverageScore >= 50 ? '#10b981' : '#f59e0b' }}
            />
            <Box
              sx={{
                top: 0, left: 0, bottom: 0, right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" component="div" sx={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>
                {Math.round(coverageScore)}%
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            {s('header.overall_score')}
          </Typography>
        </Box>
      </Box>

      {/* Candidate & Job Info */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, fontSize: '15px', lineHeight: '42px', color: 'rgba(98, 111, 134, 1)' }}>
          {s('header.details')}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <InfoChip label={candidateName} icon={<PersonIcon />} />
          {companyName && (
            <Chip
              label={companyName}
              size="small"
              sx={{ backgroundColor: 'rgba(131, 16, 255, 0.08)', color: '#8310FF', fontWeight: 500, fontSize: '0.75rem', height: 24, border: '0.25px solid rgba(131, 16, 255, 0.4)' }}
              icon={<BusinessIcon sx={{ color: '#8310FF!important', width: '16px', height: '16px' }} />}
            />
          )}
          <InfoChip label={jobTitle} icon={<WorkIcon />} />
          <InfoChip
            label={new Date(timestamp).toLocaleDateString(i18n.language || 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            icon={<CalendarMonthIcon />}
          />
          <InfoChip label={formatDuration(analytics.duration || 0)} icon={<AccessTimeIcon />} />
          {assessment?.post?.status && (
            <Chip
              label={assessment.post.status}
              size="small"
              sx={{
                backgroundColor: assessment.post.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: assessment.post.status === 'open' ? '#10b981' : '#ef4444',
                fontWeight: 600, fontSize: '0.75rem', height: 24,
                border: `1px solid ${assessment.post.status === 'open' ? '#10b981' : '#ef4444'}`,
                textTransform: 'capitalize',
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Analytics Stats */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(98, 111, 134, 1)', fontSize: '15px', fontWeight: 500, mb: 1.5 }}>
          {s('header.analytics')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <StatBox icon={<AccessTimeIcon />} value={formatDuration(analytics.duration || 0)} label={s('summary.duration')} color="#6366f1" />
          <StatBox icon={<ChatIcon />} value={analytics.messageCount || 0} label={s('summary.messages')} color="#10b981" />
          <StatBox icon={<AssessmentIcon />} value={`${analytics.completedAreas || 0}/${analytics.totalAreas || 4}`} label={s('summary.areas_covered')} color="#f59e0b" />
          <StatBox icon={<TrendingUpIcon />} value={`${Math.round(analytics.coveragePercentage || 0)}%`} label={s('header.coverage')} color="#8b5cf6" />
        </Box>
      </Box>
    </>
  );

  return (
    container ? <Box sx={sectionStyle}>{Content}</Box> : <>{Content}</>
  );
};

const InfoChip: React.FC<{ label: string; icon: React.ReactElement }> = ({ label, icon }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      backgroundColor: 'rgba(95, 168, 211, 0.1)',
      color: 'rgba(84, 98, 116, 1)',
      fontWeight: 500, fontSize: '0.75rem', height: 24,
      border: '0.25px solid rgba(95, 168, 211, 1)',
    }}
    icon={React.cloneElement(icon, { sx: { color: 'rgba(95, 168, 211, 1)!important', width: '16px', height: '16px' } } as any)}
  />
);

const StatBox: React.FC<{ icon: React.ReactElement; value: string | number; label: string; color: string }> = ({ icon, value, label, color }) => (
  <Box
    sx={{
      backgroundColor: `${color}14`,
      borderRadius: '10px',
      padding: '14px',
      border: `1px solid ${color}33`,
      textAlign: 'center',
    }}
  >
    {React.cloneElement(icon, { sx: { color, fontSize: 24, mb: 0.5 } } as any)}
    <Typography variant="h6" sx={{ color, fontWeight: 700, fontSize: '16px' }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '11px' }}>{label}</Typography>
  </Box>
);

export default React.memo(AssessmentHeader);
