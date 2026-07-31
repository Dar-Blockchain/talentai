import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { BarChart3 as BarChartIcon } from 'lucide-react';
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
          formatter={(value: number | string) => [value, 'Users']}
          labelFormatter={(label: string | number) => `Skill: ${label}`}
          contentStyle={{
            fontFamily: 'Poppins',
            fontSize: 12,
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
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
