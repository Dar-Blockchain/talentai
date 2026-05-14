import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { formatDuration, NAVY, GRAY, GRAY2, BORDER, T, TBG, TBRD } from './helpers';

interface AssessmentHeaderProps {
  assessment: any;
  container?: boolean;
}

const STAT_COLORS = ['#6366f1', '#0D9488', '#f59e0b', '#8b5cf6'];

const StatBox: React.FC<{ icon: React.ReactElement; value: string | number; label: string; color: string }> = ({
  icon, value, label, color,
}) => (
  <Box sx={{
    borderRadius: '14px', p: '14px 16px',
    bgcolor: `${color}10`, border: `1px solid ${color}28`,
    display: 'flex', alignItems: 'center', gap: 1.5,
  }}>
    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {React.cloneElement(icon, { sx: { fontSize: 18, color } } as any)}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.68rem', color: GRAY2, fontWeight: 500, mt: 0.25 }}>{label}</Typography>
    </Box>
  </Box>
);

const InfoPill: React.FC<{ label: string; icon: React.ReactElement; color?: string; bg?: string; border?: string }> = ({
  label, icon, color = GRAY, bg = '#F8FAFC', border = BORDER,
}) => (
  <Chip
    label={label}
    size="small"
    icon={React.cloneElement(icon, { sx: { fontSize: '13px !important', color: `${color} !important` } } as any)}
    sx={{
      height: 26, fontSize: '0.72rem', fontWeight: 600,
      bgcolor: bg, color, border: `1px solid ${border}`,
      '& .MuiChip-icon': { ml: '6px' },
    }}
  />
);

const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({ assessment, container = true }) => {
  const { t, i18n } = useTranslation('dashboard');
  const s = (k: string, opts?: any) => t(`candidate.assessment_detail.${k}`, opts) as string;

  const candidateName  = assessment?.candidate?.username || s('unknown_user');
  const companyName    = assessment?.company?.username   || '';
  const jobTitle       = assessment?.post?.jobDetails?.title || s('unknown_job');
  const interviewType  = assessment?.interviewData?.interviewType || 'HR_INTERVIEW';
  const timestamp      = assessment?.createdAt || new Date().toISOString();
  const analytics      = assessment?.interviewData?.analytics || {};
  const postStatus     = assessment?.post?.status;

  const Content = (
    <Box>
      {/* Info pills row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
        <Chip
          label={interviewType.replace(/_/g, ' ')}
          size="small"
          sx={{ height: 26, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}
        />
        <InfoPill label={candidateName} icon={<PersonIcon />} />
        {companyName && (
          <InfoPill label={companyName} icon={<BusinessIcon />} color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />
        )}
        <InfoPill label={jobTitle} icon={<WorkIcon />} color={T} bg={TBG} border={TBRD} />
        <InfoPill
          label={new Date(timestamp).toLocaleDateString(i18n.language || 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          icon={<CalendarMonthIcon />}
        />
        {postStatus && (
          <Chip
            label={postStatus}
            size="small"
            sx={{
              height: 26, fontSize: '0.72rem', fontWeight: 700,
              bgcolor: postStatus === 'open' ? '#F0FDF4' : '#FEF2F2',
              color:   postStatus === 'open' ? '#059669' : '#DC2626',
              border:  `1px solid ${postStatus === 'open' ? '#BBF7D0' : '#FECACA'}`,
              textTransform: 'capitalize',
            }}
          />
        )}
      </Box>

      {/* Divider label */}
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: GRAY2, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5 }}>
        {s('header.analytics')}
      </Typography>

      {/* Stats grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        <StatBox icon={<AccessTimeIcon />}  value={formatDuration(analytics.duration || 0)} label={s('summary.duration')}      color={STAT_COLORS[0]} />
        <StatBox icon={<ChatIcon />}         value={analytics.messageCount || 0}              label={s('summary.messages')}      color={STAT_COLORS[1]} />
        <StatBox icon={<AssessmentIcon />}   value={`${analytics.completedAreas || 0}/${analytics.totalAreas || 4}`} label={s('summary.areas_covered')} color={STAT_COLORS[2]} />
        <StatBox icon={<TrendingUpIcon />}   value={`${Math.round(analytics.coveragePercentage || 0)}%`} label={s('header.coverage')} color={STAT_COLORS[3]} />
      </Box>
    </Box>
  );

  return container ? (
    <Box sx={{ bgcolor: '#fff', borderRadius: '18px', border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <Box sx={{ height: 3, background: 'linear-gradient(90deg, #0D9488, #14B8A6)' }} />
      <Box sx={{ p: 2.5 }}>{Content}</Box>
    </Box>
  ) : <>{Content}</>;
};

export default React.memo(AssessmentHeader);
