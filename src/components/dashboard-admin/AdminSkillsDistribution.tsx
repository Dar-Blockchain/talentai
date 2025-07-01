import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
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

const AdminSkillsDistribution = ({ skillDistribution }: { skillDistribution: any[] }) => (
  <StyledCard>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      Skills Distribution
    </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={skillDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {skillDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip />
      </PieChart>
    </ResponsiveContainer>
  </StyledCard>
);

export default AdminSkillsDistribution; 