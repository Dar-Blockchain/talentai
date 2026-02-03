import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';

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

const AdminSkillsBarChart = ({ skillsData }: { skillsData: Array<{ skill: string; count: number }> }) => (
  <StyledCard>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
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
        <BarChartIcon sx={{ fontSize: 20, color: '#8310FF' }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
        Top Skills by Usage
      </Typography>
    </Box>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={skillsData}
        margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ece6fa" vertical={false} />
        <XAxis
          dataKey="skill"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12, fill: '#6c6c80' }}
          interval={0}
          axisLine={{ stroke: '#ece6fa' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6c6c80' }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'Number of Users', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6c6c80', fontSize: 12 } }}
        />
        <RechartsTooltip
          formatter={(value: any) => [value, 'Users']}
          labelFormatter={(label: any) => `Skill: ${label}`}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #ece6fa',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(131,16,255,0.1)',
            padding: '8px 12px',
          }}
        />
        <Bar
          dataKey="count"
          radius={[6, 6, 0, 0]}
        >
          {skillsData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </StyledCard>
);

export default AdminSkillsBarChart;
