import { Box, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { styled } from '@mui/material/styles';

const GREEN_MAIN = '#8310FF';

const StatCard = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: theme.spacing(3),
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'default',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
    }
}));

const AdminStatsCards = ({ stats }: { stats: any }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
    <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
      <StatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
              {stats.totalUsers?.toLocaleString?.() ?? 0}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Users
            </Typography>
          </Box>
          <PeopleIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
        </Box>
      </StatCard>
    </Box>
    <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
      <StatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
              {stats.totalAssessments ?? 0}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Assessments
            </Typography>
          </Box>
          <AssessmentIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
        </Box>
      </StatCard>
    </Box>
    <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
      <StatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
              {stats.totalAttempts?.toLocaleString?.() ?? 0}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Resumes
            </Typography>
          </Box>
          <BarChartIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
        </Box>
      </StatCard>
    </Box>
    <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
      <StatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
              {stats.averageScore?.toFixed?.(2) ?? '0.00'}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Average Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ color: 'warning.main', fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'warning.main' }}>
                Good performance
              </Typography>
            </Box>
          </Box>
          <ShowChartIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
        </Box>
      </StatCard>
    </Box>
    <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
      <StatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
              {stats.totalSkills?.toLocaleString?.() ?? 0}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Skills
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ color: 'info.main', fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'info.main' }}>
                Skills tracked
              </Typography>
            </Box>
          </Box>
          <WorkIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
        </Box>
      </StatCard>
    </Box>
    <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
      <StatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
              {stats.posts?.toLocaleString?.() ?? 0}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Posts
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'success.main' }}>
                Active content
              </Typography>
            </Box>
          </Box>
          <BarChartIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
        </Box>
      </StatCard>
    </Box>
    <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
      <StatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: GREEN_MAIN }}>
              {stats.jobAssessmentsWithScorePercentage?.toFixed?.(1) ?? '0.0'}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Assessment Completion
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'success.main' }}>
                Completed assessments
              </Typography>
            </Box>
          </Box>
          <AssessmentIcon sx={{ fontSize: 48, color: GREEN_MAIN, opacity: 0.7 }} />
        </Box>
      </StatCard>
    </Box>
  </Box>
);

export default AdminStatsCards; 