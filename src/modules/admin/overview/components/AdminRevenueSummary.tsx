import React from 'react';
import { DollarSign as AttachMoneyIcon, Users as GroupsIcon } from 'lucide-react';
import { AdminChartCard } from '@/modules/admin/shared';
import { RevenueByPlan } from '../types';

interface AdminRevenueSummaryProps {
  mrr: number;
  totalActiveSubscriptions: number;
  byPlan: RevenueByPlan[];
  loading?: boolean;
}

const fmtUsd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const AdminRevenueSummary: React.FC<AdminRevenueSummaryProps> = ({ mrr, totalActiveSubscriptions, byPlan, loading }) => {
  const maxMrr = Math.max(...byPlan.map((p) => p.mrr), 1);

  return (
    <AdminChartCard icon={AttachMoneyIcon} title="Revenue" className="mb-4">
      <div className="flex flex-wrap gap-6 mb-5">
        <div>
          <div className="text-[2rem] font-bold text-slate-900 leading-none tabular-nums">
            {loading ? '—' : fmtUsd(mrr)}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Monthly Recurring Revenue</div>
        </div>
        <div className="self-center h-10 w-px bg-slate-200" />
        <div className="self-center">
          <div className="flex items-center gap-1.5">
            <GroupsIcon size={18} className="text-slate-400" />
            <span className="text-[1.1rem] font-bold text-slate-900 tabular-nums">
              {loading ? '—' : totalActiveSubscriptions.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Active Subscriptions</div>
        </div>
      </div>

      {!loading && byPlan.length === 0 && (
        <p className="text-[13px] text-slate-400">No active subscriptions yet.</p>
      )}

      {byPlan.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {byPlan.map((plan) => (
            <div key={plan.planId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-slate-700">{plan.planName}</span>
                <span className="text-[12px] text-slate-500">
                  {plan.activeSubscriptions} &times; {fmtUsd(plan.priceUsd)} = <span className="font-semibold text-slate-900">{fmtUsd(plan.mrr)}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #0D9488, #14B8A6)", width: `${Math.max((plan.mrr / maxMrr) * 100, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminChartCard>
  );
};

export default AdminRevenueSummary;
