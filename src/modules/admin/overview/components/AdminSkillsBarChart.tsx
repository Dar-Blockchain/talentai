import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import { AdminChartCard, ADMIN_CHART_COLORS } from '@/modules/admin/shared';

const AdminSkillsBarChart = ({ skillsData }: { skillsData: Array<{ skill: string; count: number }> }) => (
  <AdminChartCard icon={BarChartIcon} title="Top Skills by Usage" className="mb-4">
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={skillsData}
        margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="skill"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12, fill: '#64748B' }}
          interval={0}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
       />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          label={{ value: 'Number of Users', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748B', fontSize: 12 } }}
       />
        <RechartsTooltip
          formatter={(value: any) => [value, 'Users']}
          labelFormatter={(label: any) => `Skill: ${label}`}
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            padding: '8px 12px',
          }}
       />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
        >
          {skillsData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={ADMIN_CHART_COLORS[index % ADMIN_CHART_COLORS.length]}
           />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </AdminChartCard>
);

export default AdminSkillsBarChart;
