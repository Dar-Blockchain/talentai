import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Box)(({ theme }) => ({
  background: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(131,16,255,0.10)',
  border: '1.5px solid #ece6fa',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const AdminGrowthAnalytics = ({ userGrowthData, selectedMonth, setSelectedMonth, getFilteredUserGrowthData }: any) => (
  <StyledCard>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Growth Analytics
      </Typography>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Filter by Month</InputLabel>
        <Select
          value={selectedMonth}
          label="Filter by Month"
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="2025-04">April 2025</MenuItem>
          <MenuItem value="2025-05">May 2025</MenuItem>
          <MenuItem value="2025-06">June 2025</MenuItem>
        </Select>
      </FormControl>
    </Box>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={getFilteredUserGrowthData()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <RechartsTooltip />
        <Line type="monotone" dataKey="users" stroke="#8310FF" strokeWidth={2} name="Users" />
        <Line type="monotone" dataKey="posts" stroke="#00C49F" strokeWidth={2} name="Posts" />
        <Line type="monotone" dataKey="assessments" stroke="#FFBB28" strokeWidth={2} name="Assessments" />
      </LineChart>
    </ResponsiveContainer>
  </StyledCard>
);

export default AdminGrowthAnalytics; 