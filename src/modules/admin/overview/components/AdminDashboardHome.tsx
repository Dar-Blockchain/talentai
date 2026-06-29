import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/modules/shared/ui/shadcn/skeleton';
import BarChartIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import PublicIcon from '@mui/icons-material/Public';
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

  const getFilteredUserGrowthData = () => {
    if (selectedMonth === 'all') return userGrowthData;
    return userGrowthData.filter((item) => {
      const date = new Date(item.fullDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const selectedMonthNum = parseInt(selectedMonth.split('-')[1]);
      const selectedYear = parseInt(selectedMonth.split('-')[0]);
      return month === selectedMonthNum && year === selectedYear;
    });
  };

  return (
    <div>
      <AdminHeader />
      {statsError ? (
        <AdminQueryError message="Failed to load dashboard stats." onRetry={() => refetchStats()} className="mb-4" />
      ) : (
        <AdminStatsCards stats={stats} loading={statsLoading} />
      )}

      {/* Revenue & recent activity */}
      <div className="mt-1">
        <ZoneHeading icon={MonetizationOnIcon} label="Revenue & Activity" />
        <div className="flex flex-wrap gap-6">
          <div className="flex-[1_1_580px] min-w-0">
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
          <div className="flex-[1_1_360px] min-w-0">
            {signupsError ? (
              <AdminQueryError message="Failed to load recent signups." onRetry={() => refetchSignups()} />
            ) : (
              <AdminRecentSignups signups={recentSignups} loading={signupsLoading} />
            )}
          </div>
        </div>
      </div>

      {/* Skills section */}
      <div className="mt-1">
        <ZoneHeading icon={BarChartIcon} label="Skills Overview" />
        <AdminSkillsBarChart skillsData={skillsData} />
      </div>

      {/* Analytics section */}
      <div className="mt-1">
        <ZoneHeading icon={InsightsIcon} label="Analytics" />
        <div className="flex flex-wrap gap-6">
          <div className="flex-[1_1_580px] min-w-0">
            <AdminGrowthAnalytics
              userGrowthData={userGrowthData}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              getFilteredUserGrowthData={getFilteredUserGrowthData}
           />
          </div>
          <div className="flex-[1_1_360px] min-w-0">
            <AdminSkillsDistribution skillDistribution={skillDistribution} />
          </div>
        </div>
      </div>

      {/* World Map section */}
      <div className="mt-1">
        <ZoneHeading icon={PublicIcon} label="Geographic Distribution" />
        <AdminWorldMap userLocations={processUserLocations} totalUsers={stats?.users ?? 0} />
      </div>
    </div>
  );
};

export default AdminDashboardHome;
