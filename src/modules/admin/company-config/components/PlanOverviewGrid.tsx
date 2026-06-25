import React from 'react';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG } from '@/modules/admin/shared';
import { PlanLimit } from '../types';

interface PlanOverviewGridProps {
  plans: PlanLimit[];
}

const PlanOverviewGrid: React.FC<PlanOverviewGridProps> = ({ plans }) => {
  if (plans.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {plans.map((plan) => (
        <Card key={plan._id} className="overflow-hidden shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
                  <WorkspacePremiumIcon style={{ fontSize: 16, color: ADMIN_NEUTRAL }} />
                </div>
                <span className="text-[13.5px] font-semibold text-slate-900">{plan.name}</span>
              </div>
              {!plan.isActive && (
                <Badge variant="outline" className="border-transparent bg-slate-100 text-slate-500 font-medium">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-[1.3rem] font-bold text-slate-900">
                {plan.priceUsd != null ? `$${plan.priceUsd}` : 'Custom'}
              </span>
              {plan.priceUsd != null && <span className="text-[12px] text-slate-400">/mo</span>}
            </div>
            <div className="h-px bg-slate-100 mb-3" />
            <div className="flex justify-between text-[12px]">
              <span className="text-slate-500">Job posts</span>
              <span className="font-semibold text-slate-700">{plan.postsLimit}</span>
            </div>
            <div className="flex justify-between text-[12px] mt-1.5">
              <span className="text-slate-500">Interviews / mo</span>
              <span className="font-semibold text-slate-700">{plan.monthlyInterviewLimit}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PlanOverviewGrid;
