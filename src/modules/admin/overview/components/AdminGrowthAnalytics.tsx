import { FormControl, Select, MenuItem } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AdminChartCard, ADMIN_ACCENT, ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG } from '@/modules/admin/shared';

const AdminGrowthAnalytics = ({ userGrowthData, selectedMonth, setSelectedMonth, getFilteredUserGrowthData }: any) => (
  <AdminChartCard  className="mb-4">
    <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: ADMIN_NEUTRAL_BG }}
        >
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
      <AreaChart data={getFilteredUserGrowthData()}>
        <defs>
          <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ADMIN_ACCENT} stopOpacity={0.15} />
            <stop offset="95%" stopColor={ADMIN_ACCENT} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="assessmentsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            padding: '8px 12px',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '16px' }}
          iconType="circle"
          iconSize={8}
        />
        <Area type="monotone" dataKey="users" stroke={ADMIN_ACCENT} strokeWidth={2} fill="url(#usersGrad)" name="Users" dot={false} />
        <Area type="monotone" dataKey="posts" stroke="#10B981" strokeWidth={2} fill="url(#postsGrad)" name="Posts" dot={false} />
        <Area type="monotone" dataKey="assessments" stroke="#F59E0B" strokeWidth={2} fill="url(#assessmentsGrad)" name="Assessments" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </AdminChartCard>
);

export default AdminGrowthAnalytics;
