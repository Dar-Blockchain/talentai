import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AdminStatCard, ADMIN_CHART_COLORS } from '@/modules/admin/shared';
import { AdminDashboardStats } from '../types';

interface StatCardConfig {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface AdminStatsCardsProps {
  stats?: AdminDashboardStats;
  loading?: boolean;
}

const AdminStatsCards = ({ stats, loading = false }: AdminStatsCardsProps) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <AdminStatCard key={i} icon={PeopleIcon} value={0} label="" loading />
        ))}
      </div>
    );
  }

  const cards: StatCardConfig[] = [
    {
      label: 'Total Users',
      value: stats.users?.toLocaleString?.() ?? 0,
      icon: PeopleIcon,
      color: ADMIN_CHART_COLORS[0],
    },
    {
      label: 'Job Assessments',
      value: stats.jobAssessments ?? 0,
      icon: AssessmentIcon,
      color: ADMIN_CHART_COLORS[1],
    },
    {
      label: 'Total Posts',
      value: stats.posts?.toLocaleString?.() ?? 0,
      icon: BarChartIcon,
      color: ADMIN_CHART_COLORS[2],
    },
    {
      label: 'Total Skills',
      value: stats.totalSkills?.toLocaleString?.() ?? 0,
      icon: WorkIcon,
      color: ADMIN_CHART_COLORS[3],
    },
    {
      label: 'Average Score',
      value: `${stats.avgOverallScore?.toFixed?.(1) ?? '0.0'}%`,
      icon: ShowChartIcon,
      color: ADMIN_CHART_COLORS[5],
    },
    {
      label: 'Completion Rate',
      value: `${stats.jobAssessmentsWithScorePercentage?.toFixed?.(1) ?? '0.0'}%`,
      icon: CheckCircleIcon,
      color: ADMIN_CHART_COLORS[2],
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {cards.map((card) => (
        <AdminStatCard
          key={card.label}
          icon={card.icon}
          value={card.value}
          label={card.label}
          color={card.color}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default AdminStatsCards;
