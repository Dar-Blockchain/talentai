import { Users as PeopleIcon, ClipboardList as AssessmentIcon, Code2 as WorkIcon, LineChart as ShowChartIcon, Briefcase as WorkOutlineIcon, CheckCircle2 as CheckCircleIcon } from 'lucide-react';
import { Skeleton } from '@/modules/shared/ui/shadcn/skeleton';
import { AdminDashboardStats } from '../types';

interface CardDef {
  label: string;
  desc: string;
  value: (s: AdminDashboardStats) => string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const CARDS: CardDef[] = [
  {
    label: 'Total Users',
    desc:  'Registered accounts',
    value: (s) => s.users?.toLocaleString?.() ?? 0,
    icon:  PeopleIcon,
    color: '#0D9488',
    bg:    '#F0FDFA',
  },
  {
    label: 'Job Assessments',
    desc:  'Interview sessions run',
    value: (s) => s.jobAssessments?.toLocaleString?.() ?? 0,
    icon:  AssessmentIcon,
    color: '#6366F1',
    bg:    '#EEF2FF',
  },
  {
    label: 'Total Posts',
    desc:  'Active job listings',
    value: (s) => s.posts?.toLocaleString?.() ?? 0,
    icon:  WorkOutlineIcon,
    color: '#F59E0B',
    bg:    '#FFFBEB',
  },
  {
    label: 'Total Skills',
    desc:  'Unique skills tracked',
    value: (s) => s.totalSkills?.toLocaleString?.() ?? 0,
    icon:  WorkIcon,
    color: '#10B981',
    bg:    '#ECFDF5',
  },
  {
    label: 'Avg. Score',
    desc:  'Across all assessments',
    value: (s) => `${s.avgOverallScore?.toFixed?.(1) ?? '0.0'}%`,
    icon:  ShowChartIcon,
    color: '#3B82F6',
    bg:    '#EFF6FF',
  },
  {
    label: 'Completion',
    desc:  'Assessments with score',
    value: (s) => `${s.jobAssessmentsWithScorePercentage?.toFixed?.(1) ?? '0.0'}%`,
    icon:  CheckCircleIcon,
    color: '#EC4899',
    bg:    '#FDF2F8',
  },
];

interface AdminStatsCardsProps {
  stats?: AdminDashboardStats;
  loading?: boolean;
}

const AdminStatsCards = ({ stats, loading = false }: AdminStatsCardsProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
    {CARDS.map((card) => {
      const Icon = card.icon;
      if (loading || !stats) return (
        <div key={card.label} className="bg-white rounded-xl border border-slate-100 p-3.5 flex flex-col gap-2.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-3 w-full" />
        </div>
      );
      return (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-slate-100 p-3.5 flex flex-col gap-1 hover:-translate-y-0.5 transition-transform duration-150 hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-0.5" style={{ background: card.bg }}>
            <Icon size={15} color={card.color} />
          </div>
          <div className="text-[1.25rem] font-bold text-slate-900 leading-none tabular-nums tracking-tight">
            {card.value(stats)}
          </div>
          <div className="text-[11.5px] font-semibold text-slate-700 leading-none">{card.label}</div>
          <div className="text-[10.5px] text-slate-400 leading-snug">{card.desc}</div>
        </div>
      );
    })}
  </div>
);

export default AdminStatsCards;
