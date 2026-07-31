import React, { useState } from 'react';
import { Award as WorkspacePremiumIcon, Plus as AddIcon, Pencil as EditIcon } from 'lucide-react';
import { Card } from '@/modules/shared/ui/shadcn/card';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { Spinner } from '@/modules/shared/ui/shadcn/spinner';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/modules/shared/ui/shadcn/tooltip';
import { ADMIN_ACCENT, ADMIN_NEUTRAL, ADMIN_NEUTRAL_BG } from '@/modules/admin/shared';
import { useUpdatePlanMutation } from '../queries';
import PlanFormDialog from './PlanFormDialog';
import { PlanLimit } from '../types';

interface PlanOverviewGridProps {
  plans: PlanLimit[];
  onSaved: (planName: string, mode: 'created' | 'updated') => void;
  onError: (message: string) => void;
}

const PlanOverviewGrid: React.FC<PlanOverviewGridProps> = ({ plans, onSaved, onError }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanLimit | null>(null);
  const { mutate: updatePlan } = useUpdatePlanMutation();
  const [togglingName, setTogglingName] = useState<string | null>(null);

  const openCreate = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  const openEdit = (plan: PlanLimit) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleToggleActive = (plan: PlanLimit) => {
    setTogglingName(plan.name);
    updatePlan(
      { name: plan.name, updates: { isActive: !plan.isActive } },
      {
        onSuccess: () => {
          onSaved(plan.name, 'updated');
          setTogglingName(null);
        },
        onError: (err: Error) => {
          onError(err?.message || 'Failed to update plan.');
          setTogglingName(null);
        },
      },
    );
  };

  return (
    <TooltipProvider>
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">Available Plans</span>
        <Button
          variant="ghost"
          onClick={openCreate}
          className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-700 hover:text-white"
          style={{ backgroundColor: ADMIN_ACCENT }}
        >
          <AddIcon size={16} />
          New Plan
        </Button>
      </div>

      {plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <Card key={plan._id} className="overflow-hidden shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: ADMIN_NEUTRAL_BG }}>
                      <WorkspacePremiumIcon size={16} color={ADMIN_NEUTRAL} />
                    </div>
                    <span className="text-[13.5px] font-semibold text-slate-900">{plan.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!plan.isActive && (
                      <Badge variant="outline" className="border-transparent bg-slate-100 text-slate-500 font-medium">
                        Inactive
                      </Badge>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => openEdit(plan)} className="rounded-md p-1.5 text-[#64748B] hover:bg-slate-100">
                          <EditIcon size={18} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Edit plan</TooltipContent>
                    </Tooltip>
                  </div>
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
                <div className="h-px bg-slate-100 my-3" />
                <Button
                  variant="outline"
                  onClick={() => handleToggleActive(plan)}
                  disabled={togglingName === plan.name}
                  className="w-full rounded-lg py-1.5 text-[12px] font-semibold text-slate-600"
                >
                  {togglingName === plan.name && <Spinner className="size-3" style={{ color: ADMIN_NEUTRAL }} />}
                  {plan.isActive ? 'Deactivate' : 'Reactivate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PlanFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        plan={editingPlan}
        onSaved={(name, mode) => {
          setFormOpen(false);
          onSaved(name, mode);
        }}
      />
    </div>
    </TooltipProvider>
  );
};

export default PlanOverviewGrid;
