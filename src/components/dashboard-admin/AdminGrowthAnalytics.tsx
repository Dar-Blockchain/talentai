import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StyledCard = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(131,16,255,0.06)',
  border: '1px solid #ece6fa',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const AdminGrowthAnalytics = ({ userGrowthData, selectedMonth, setSelectedMonth, getFilteredUserGrowthData }: any) => (
  <StyledCard>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ece6fa 0%, #f3eeff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 20, color: '#8310FF' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          Growth Analytics
        </Typography>
      </Box>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Filter by Month</InputLabel>
        <Select
          value={selectedMonth}
          label="Filter by Month"
          onChange={(e) => setSelectedMonth(e.target.value)}
          sx={{
            borderRadius: '10px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ece6fa' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8310FF' },
          }}
        >
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="2025-04">April 2025</MenuItem>
          <MenuItem value="2025-05">May 2025</MenuItem>
          <MenuItem value="2025-06">June 2025</MenuItem>
        </Select>
      </FormControl>
    </Box>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={getFilteredUserGrowthData()}>
        <defs>
          <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8310FF" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#8310FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="assessmentsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ece6fa" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6c6c80' }} axisLine={{ stroke: '#ece6fa' }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#6c6c80' }} axisLine={false} tickLine={false} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #ece6fa',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(131,16,255,0.1)',
            padding: '8px 12px',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '16px' }}
          iconType="circle"
          iconSize={8}
        />
        <Area type="monotone" dataKey="users" stroke="#8310FF" strokeWidth={2} fill="url(#usersGrad)" name="Users" dot={false} />
        <Area type="monotone" dataKey="posts" stroke="#10b981" strokeWidth={2} fill="url(#postsGrad)" name="Posts" dot={false} />
        <Area type="monotone" dataKey="assessments" stroke="#f59e0b" strokeWidth={2} fill="url(#assessmentsGrad)" name="Assessments" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </StyledCard>
);

export default AdminGrowthAnalytics;
