import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { AdminChartCard, ADMIN_CHART_COLORS } from '@/modules/admin/shared';

const AdminSkillsDistribution = ({ skillDistribution }: { skillDistribution: any[] }) => (
  <AdminChartCard icon={DonutLargeIcon} title="Skills Distribution" className="mb-4">
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={skillDistribution}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
        >
          {skillDistribution.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={ADMIN_CHART_COLORS[index % ADMIN_CHART_COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={{
            fontFamily: 'Poppins',
            fontSize: 12,
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
       />
      </PieChart>
    </ResponsiveContainer>
    {/* Custom legend */}
    <div className="flex flex-wrap gap-3 mt-1 justify-center">
      {skillDistribution.slice(0, 6).map((entry, index) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: ADMIN_CHART_COLORS[index % ADMIN_CHART_COLORS.length] }}
         />
          <span className="text-[12px] text-slate-500">{entry.name}</span>
        </div>
      ))}
    </div>
  </AdminChartCard>
);

export default AdminSkillsDistribution;
