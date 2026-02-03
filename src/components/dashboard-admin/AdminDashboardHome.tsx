import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { AppDispatch } from '@/store/store';
import {
  fetchAdminStats,
  fetchAllUsersForMap,
  fetchUserGrowthData,
  selectAdminStats,
  selectAllUsersForMap,
  selectUserGrowthData,
  selectSkillsData,
  selectSkillDistribution,
} from '@/store/slices/adminSlice';
import { getCountryName } from '@/utils/countryMappings';
import AdminHeader from './AdminHeader';
import AdminStatsCards from './AdminStatsCards';
import AdminSkillsBarChart from './AdminSkillsBarChart';
import AdminGrowthAnalytics from './AdminGrowthAnalytics';
import AdminSkillsDistribution from './AdminSkillsDistribution';
import AdminWorldMap from './AdminWorldMap';

const AdminDashboardHome: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector(selectAdminStats);
  const allUsersForMap = useSelector(selectAllUsersForMap);
  const userGrowthData = useSelector(selectUserGrowthData);
  const skillsData = useSelector(selectSkillsData);
  const skillDistribution = useSelector(selectSkillDistribution);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchAdminStats(undefined));
    dispatch(fetchAllUsersForMap(undefined));
    dispatch(fetchUserGrowthData(undefined));
  }, [dispatch]);

  const processUserLocations = useMemo(() => {
    const locationMap = new Map<string, { count: number; users: any[] }>();
    allUsersForMap.forEach((user: any) => {
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
    return userGrowthData.filter((item: any) => {
      const date = new Date(item.fullDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const selectedMonthNum = parseInt(selectedMonth.split('-')[1]);
      const selectedYear = parseInt(selectedMonth.split('-')[0]);
      return month === selectedMonthNum && year === selectedYear;
    });
  };

  return (
    <Box>
      <AdminHeader />
      <AdminStatsCards stats={stats} />
      <AdminSkillsBarChart skillsData={skillsData} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
          <AdminGrowthAnalytics
            userGrowthData={userGrowthData}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            getFilteredUserGrowthData={getFilteredUserGrowthData}
          />
        </Box>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <AdminSkillsDistribution skillDistribution={skillDistribution} />
        </Box>
      </Box>
      <AdminWorldMap userLocations={processUserLocations} totalUsers={stats.users} />
    </Box>
  );
};

export default AdminDashboardHome;
