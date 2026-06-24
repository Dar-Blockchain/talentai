import { Box, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';

interface StatCardConfig {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
}

const CardWrapper = styled(Box)({
  background: '#ffffff',
  padding: '24px',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(131,16,255,0.06)',
  border: '1px solid #ece6fa',
  transition: 'all 0.3s ease',
  cursor: 'default',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(131,16,255,0.12)',
  },
});

const IconCircle = styled(Box)<{ accentbg: string }>(({ accentbg }) => ({
  width: 56,
  height: 56,
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: accentbg,
  flexShrink: 0,
}));

const AdminStatsCards = ({ stats }: { stats: any }) => {
  const cards: StatCardConfig[] = [
    {
      label: 'Total Users',
      value: stats.users?.toLocaleString?.() ?? 0,
      icon: <PeopleIcon sx={{ fontSize: 28, color: '#8310FF' }} />,
      accentColor: '#8310FF',
      accentBg: 'linear-gradient(135deg, #ece6fa 0%, #f3eeff 100%)',
    },
    {
      label: 'Job Assessments',
      value: stats.jobAssessments ?? 0,
      icon: <AssessmentIcon sx={{ fontSize: 28, color: '#6366f1' }} />,
      accentColor: '#6366f1',
      accentBg: 'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)',
    },
    {
      label: 'Total Posts',
      value: stats.posts?.toLocaleString?.() ?? 0,
      icon: <BarChartIcon sx={{ fontSize: 28, color: '#0ea5e9' }} />,
      accentColor: '#0ea5e9',
      accentBg: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    },
    {
      label: 'Total Skills',
      value: stats.totalSkills?.toLocaleString?.() ?? 0,
      icon: <WorkIcon sx={{ fontSize: 28, color: '#10b981' }} />,
      accentColor: '#10b981',
      accentBg: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
    },
    {
      label: 'Average Score',
      value: `${stats.avgOverallScore?.toFixed?.(1) ?? '0.0'}%`,
      icon: <ShowChartIcon sx={{ fontSize: 28, color: '#f59e0b' }} />,
      accentColor: '#f59e0b',
      accentBg: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
    },
    {
      label: 'Completion Rate',
      value: `${stats.jobAssessmentsWithScorePercentage?.toFixed?.(1) ?? '0.0'}%`,
      icon: <CheckCircleIcon sx={{ fontSize: 28, color: '#ec4899' }} />,
      accentColor: '#ec4899',
      accentBg: 'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: 3,
        mb: 4,
      }}
    >
      {cards.map((card) => (
        <CardWrapper key={card.label}>
          <IconCircle accentbg={card.accentBg}>
            {card.icon}
          </IconCircle>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}
            >
              {card.value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6c6c80', mt: 0.5 }}>
              {card.label}
            </Typography>
          </Box>
        </CardWrapper>
      ))}
    </Box>
  );
};

export default AdminStatsCards;
