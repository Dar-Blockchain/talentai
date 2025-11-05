import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
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

const AdminSkillsBarChart = ({ skillsData }: { skillsData: Array<{ skill: string; count: number }> }) => (
  <Box sx={{ mb: 4 }}>
    <StyledCard>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Top Skills by Usage
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={skillsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="skill" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Number of Users', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <RechartsTooltip 
            formatter={(value: any, name: any) => [value, 'Users']}
            labelFormatter={(label: any) => `Skill: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            fill="url(#skillGradient)"
          >
            {skillsData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`hsl(${200 + index * 25}, 80%, ${60 - index * 3}%)`}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="skillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8310FF" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#8310FF" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </StyledCard>
  </Box>
);

export default AdminSkillsBarChart; 