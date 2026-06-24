import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { styled } from '@mui/material/styles';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

const CHART_COLORS = [
  '#8310FF', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4',
];

const StyledCard = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(131,16,255,0.06)',
  border: '1px solid #ece6fa',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const AdminSkillsDistribution = ({ skillDistribution }: { skillDistribution: any[] }) => (
  <StyledCard>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
        <DonutLargeIcon sx={{ fontSize: 20, color: '#8310FF' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
        Skills Distribution
      </Typography>
    </Box>
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={skillDistribution}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          fill="#8884d8"
          dataKey="value"
          labelLine={false}
        >
          {skillDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #ece6fa',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(131,16,255,0.1)',
            padding: '8px 12px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
    {/* Custom legend */}
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1, justifyContent: 'center' }}>
      {skillDistribution.slice(0, 6).map((entry, index) => (
        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" sx={{ color: '#6c6c80' }}>
            {entry.name}
          </Typography>
        </Box>
      ))}
    </Box>
  </StyledCard>
);

export default AdminSkillsDistribution;
