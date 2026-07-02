import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/modules/shared/ui/shadcn/skeleton';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { getCountryName } from '@/utils/countryMappings';
import { ZoneHeading, AdminQueryError } from '@/modules/admin/shared';
import {
  useAdminStatsQuery, useAdminUsersForMapQuery, useAdminUserGrowthQuery, useSkillDistribution,
  useAdminRevenueSummaryQuery, useAdminRecentSignupsQuery,
} from '../queries';
import AdminHeader from './AdminHeader';
import AdminStatsCards from './AdminStatsCards';
import AdminWorldMap from './AdminWorldMap';
import AdminRevenueSummary from './AdminRevenueSummary';
import AdminRecentSignups from './AdminRecentSignups';

const chartSkeleton = <Skeleton className="h-[300px] w-full rounded-xl" />;

// recharts pulls in a sizeable d3-based runtime — load each chart only when
// this tab actually renders instead of bundling it into every admin page load.
const AdminSkillsBarChart = dynamic(() => import('./AdminSkillsBarChart'), { loading: () => chartSkeleton });
const AdminGrowthAnalytics = dynamic(() => import('./AdminGrowthAnalytics'), { loading: () => chartSkeleton });
const AdminSkillsDistribution = dynamic(() => import('./AdminSkillsDistribution'), { loading: () => chartSkeleton });

const AdminDashboardHome: React.FC = () => {
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useAdminStatsQuery();
  const { data: allUsersForMap = [] } = useAdminUsersForMapQuery();
  const { data: userGrowthData = [] } = useAdminUserGrowthQuery();
  const { data: revenue, isLoading: revenueLoading, isError: revenueError, refetch: refetchRevenue } = useAdminRevenueSummaryQuery();
  const { data: recentSignups = [], isLoading: signupsLoading, isError: signupsError, refetch: refetchSignups } = useAdminRecentSignupsQuery(6);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const availableMonths = useMemo(() => {
    const seen = new Set<string>();
    userGrowthData.forEach((item) => {
      const d = new Date(item.fullDate);
      if (!isNaN(d.getTime())) {
        seen.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    });
    return Array.from(seen).sort();
  }, [userGrowthData]);

  const filteredGrowthData = useMemo(() => {
    if (selectedMonth === 'all') return userGrowthData;
    const [selYear, selMonth] = selectedMonth.split('-').map(Number);
    return userGrowthData.filter((item) => {
      const d = new Date(item.fullDate);
      return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth;
    });
  }, [userGrowthData, selectedMonth]);

  const skillsData = useMemo(
    () =>
      (stats?.topSkills || [])
        .map((item) => ({ skill: item._id, count: item.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    [stats?.topSkills],
  );

  const skillDistribution = useSkillDistribution(stats?.hardSkillsPercentage, stats?.softSkillsPercentage);

  const processUserLocations = useMemo(() => {
    const locationMap = new Map<string, { count: number; users: any[] }>();
    allUsersForMap.forEach((user) => {
      if (user.Localisation) {
        const locationParts = user.Localisation.split(',').map((part: string) => part.trim());
        const countryCode = locationParts[locationParts.length - 1] || 'Unknown';
        const country = getCountryName(countryCode);
        if (locationMap.has(country)) {
          locationMap.get(country)!.count++;
          locationMap.get(country)!.users.push(user);
        } else {
          locationMap.set(country, { count: 1, users: [user] });
        }
      }
    });
    return Array.from(locationMap.entries()).map(([country, data]) => ({
      country,
      count: data.count,
      users: data.users,
    }));
  }, [allUsersForMap]);

  return (
    <div>
      <AdminHeader />
      {statsError ? (
        <AdminQueryError message="Failed to load dashboard stats." onRetry={() => refetchStats()} className="mb-4" />
      ) : (
        <AdminStatsCards stats={stats} loading={statsLoading} />
      )}

      {/* Business — revenue and plan breakdown */}
      <div className="mt-1">
        <ZoneHeading icon={MonetizationOnIcon} label="Business" />
        {revenueError ? (
          <AdminQueryError message="Failed to load revenue summary." onRetry={() => refetchRevenue()} />
        ) : (
          <AdminRevenueSummary
            mrr={revenue?.mrr ?? 0}
            totalActiveSubscriptions={revenue?.totalActiveSubscriptions ?? 0}
            byPlan={revenue?.byPlan ?? []}
            loading={revenueLoading}
          />
        )}
      </div>

      {/* People & Growth — who's joining, where they are, and the trend over time */}
      <div className="mt-1">
        <ZoneHeading icon={InsightsIcon} label="People & Growth" />
        <div className="flex flex-wrap gap-6">
          <div className="flex-[1_1_580px] min-w-0">
            <AdminGrowthAnalytics
              data={filteredGrowthData}
              availableMonths={availableMonths}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />
          </div>
          <div className="flex-[1_1_360px] min-w-0">
            {signupsError ? (
              <AdminQueryError message="Failed to load recent signups." onRetry={() => refetchSignups()} />
            ) : (
              <AdminRecentSignups signups={recentSignups} loading={signupsLoading} />
            )}
          </div>
        </div>
        <div className="mt-6">
          <AdminWorldMap userLocations={processUserLocations} totalUsers={stats?.users ?? 0} />
        </div>
      </div>

      {/* Skills & Assessments — what candidates are bringing to the platform */}
      <div className="mt-1">
        <ZoneHeading icon={BarChartIcon} label="Skills & Assessments" />
        <div className="flex flex-wrap gap-6">
          <div className="flex-[1_1_580px] min-w-0">
            <AdminSkillsBarChart skillsData={skillsData} />
          </div>
          <div className="flex-[1_1_360px] min-w-0">
            <AdminSkillsDistribution skillDistribution={skillDistribution} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
