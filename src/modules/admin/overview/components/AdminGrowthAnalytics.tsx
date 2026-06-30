import { FormControl, Select, MenuItem } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AdminChartCard, ADMIN_ACCENT, ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG } from '@/modules/admin/shared';
import { ChartTooltip } from '@/modules/company/dashboard/utils/kpiTokens';

const AdminGrowthAnalytics = ({ userGrowthData, selectedMonth, setSelectedMonth, getFilteredUserGrowthData }: any) => (
  <AdminChartCard className="mb-4">
    <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
          <TrendingUpIcon style={{ fontSize: 17, color: ADMIN_NEUTRAL }} />
        </div>
        <span className="font-semibold text-[15px] text-slate-900">Growth Analytics</span>
      </div>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          sx={{
            borderRadius: '8px',
            fontSize: '0.85rem',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ADMIN_ACCENT },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ADMIN_ACCENT },
          }}
        >
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="2025-04">April 2025</MenuItem>
          <MenuItem value="2025-05">May 2025</MenuItem>
          <MenuItem value="2025-06">June 2025</MenuItem>
        </Select>
      </FormControl>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={getFilteredUserGrowthData()} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#0D9488" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradPosts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradAssessments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <RechartsTooltip contentStyle={ChartTooltip.contentStyle} />
        <Legend wrapperStyle={{ paddingTop: '16px' }} iconType="circle" iconSize={8} />
        <Area type="monotone" dataKey="users"       stroke="#0D9488" strokeWidth={2} fill="url(#gradUsers)"       name="Users"       dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="posts"       stroke="#6366F1" strokeWidth={2} fill="url(#gradPosts)"       name="Posts"       dot={false} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="assessments" stroke="#F59E0B" strokeWidth={2} fill="url(#gradAssessments)" name="Assessments" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  </AdminChartCard>
);

export default AdminGrowthAnalytics;
