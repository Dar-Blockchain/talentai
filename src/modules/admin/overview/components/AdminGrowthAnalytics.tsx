import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend,
} from 'recharts';
import { TrendingUp as TrendingUpIcon } from 'lucide-react';
import { AdminChartCard, ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG } from '@/modules/admin/shared';
import { ChartTooltip } from '@/modules/company/dashboard/utils/kpiTokens';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/shadcn/select';
import type { UserGrowthPoint } from '../types';

const SERIES = [
  { key: 'users',       name: 'Users',       color: '#0D9488', radius: [4, 4, 0, 0] as [number,number,number,number] },
  { key: 'posts',       name: 'Posts',       color: '#6366F1', radius: [4, 4, 0, 0] as [number,number,number,number] },
  { key: 'assessments', name: 'Assessments', color: '#F59E0B', radius: [4, 4, 0, 0] as [number,number,number,number] },
];

const formatMonthLabel = (ym: string) => {
  const [year, month] = ym.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

interface Props {
  data: UserGrowthPoint[];
  availableMonths: string[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
}

const AdminGrowthAnalytics = ({ data, availableMonths, selectedMonth, setSelectedMonth }: Props) => (
  <AdminChartCard className="mb-4">
    <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
          <TrendingUpIcon size={17} color={ADMIN_NEUTRAL} />
        </div>
        <span className="font-semibold text-[15px] text-slate-900">Growth Analytics</span>
      </div>
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger size="sm" className="text-[13px] text-slate-600 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          {availableMonths.map((ym) => (
            <SelectItem key={ym} value={ym}>{formatMonthLabel(ym)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        barCategoryGap="30%"
        barGap={3}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <RechartsTooltip contentStyle={ChartTooltip.contentStyle} cursor={{ fill: '#F1F5F9', radius: 4 }} />
        <Legend wrapperStyle={{ paddingTop: 16 }} iconType="circle" iconSize={8} />
        {SERIES.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            radius={s.radius}
            maxBarSize={18}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </AdminChartCard>
);

export default AdminGrowthAnalytics;
