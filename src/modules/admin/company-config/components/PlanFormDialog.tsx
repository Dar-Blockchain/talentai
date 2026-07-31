import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/modules/shared/ui/shadcn/dialog';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { Input } from '@/modules/shared/ui/shadcn/input';
import { Textarea } from '@/modules/shared/ui/shadcn/textarea';
import { Switch } from '@/modules/shared/ui/shadcn/switch';
import { Label } from '@/modules/shared/ui/shadcn/label';
import { Alert, AlertDescription } from '@/modules/shared/ui/shadcn/alert';
import { Award as WorkspacePremiumIcon, AlertCircle } from 'lucide-react';
import { ADMIN_ACCENT, ADMIN_RADIUS } from '@/modules/admin/shared';
import { useCreatePlanMutation, useUpdatePlanMutation } from '../queries';
import { PlanLimit, PlanFormValues } from '../types';

interface PlanFormDialogProps {
  open: boolean;
  onClose: () => void;
  plan: PlanLimit | null; // null = create mode, otherwise edit mode
  onSaved: (planName: string, mode: 'created' | 'updated') => void;
}

const emptyForm: PlanFormValues = {
  name: '',
  postsLimit: 5,
  monthlyInterviewLimit: 15,
  durationDays: 30,
  priceUsd: 0,
  description: '',
  isActive: true,
};

const PlanFormDialog: React.FC<PlanFormDialogProps> = ({ open, onClose, plan, onSaved }) => {
  const isEdit = !!plan;
  const [form, setForm] = useState<PlanFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createPlan, isPending: creating } = useCreatePlanMutation();
  const { mutate: updatePlan, isPending: updating } = useUpdatePlanMutation();
  const saving = creating || updating;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      plan
        ? {
            name: plan.name,
            postsLimit: plan.postsLimit,
            monthlyInterviewLimit: plan.monthlyInterviewLimit,
            durationDays: plan.durationDays ?? 30,
            priceUsd: plan.priceUsd ?? 0,
            description: plan.description ?? '',
            isActive: plan.isActive,
          }
        : emptyForm,
    );
  }, [open, plan]);

  const handleField = <K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = form.name.trim().length > 0
    && form.postsLimit >= 0
    && form.monthlyInterviewLimit >= 0
    && form.durationDays > 0
    && form.priceUsd >= 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setError(null);

    if (isEdit) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name: _name, ...updates } = form;
      updatePlan(
        { name: plan!.name, updates },
        {
          onSuccess: () => onSaved(form.name, 'updated'),
          onError: (err: Error) => setError(err?.message || 'Failed to update plan.'),
        },
      );
    } else {
      createPlan(form, {
        onSuccess: () => onSaved(form.name, 'created'),
        onError: (err: Error) => setError(err?.message || 'Failed to create plan.'),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden sm:max-w-sm" style={{ borderRadius: ADMIN_RADIUS, boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' }}>
        <div className="relative px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
              <WorkspacePremiumIcon size={20} color={ADMIN_ACCENT} />
            </div>
            <h2 className="text-[1.05rem] font-semibold text-slate-900">{isEdit ? 'Edit Plan' : 'New Plan'}</h2>
          </div>
        </div>

        <div className="px-6 pt-2 pb-1 max-h-[70vh] overflow-y-auto">
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-[10px]">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-name" className="text-xs text-slate-500">Plan name</Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(e) => handleField('name', e.target.value)}
                disabled={isEdit}
              />
              <span className="text-[11px] text-slate-400">
                {isEdit ? 'Plan names cannot be changed after creation.' : ' '}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="plan-posts" className="text-xs text-slate-500">Job posts limit</Label>
                <Input
                  id="plan-posts"
                  type="number"
                  min={0}
                  value={form.postsLimit}
                  onChange={(e) => handleField('postsLimit', Number(e.target.value))}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="plan-interviews" className="text-xs text-slate-500">Interviews / month</Label>
                <Input
                  id="plan-interviews"
                  type="number"
                  min={0}
                  value={form.monthlyInterviewLimit}
                  onChange={(e) => handleField('monthlyInterviewLimit', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="plan-duration" className="text-xs text-slate-500">Duration (days)</Label>
                <Input
                  id="plan-duration"
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) => handleField('durationDays', Number(e.target.value))}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="plan-price" className="text-xs text-slate-500">Price (USD / mo)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={0}
                  value={form.priceUsd}
                  onChange={(e) => handleField('priceUsd', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-description" className="text-xs text-slate-500">Description</Label>
              <Textarea
                id="plan-description"
                value={form.description}
                onChange={(e) => handleField('description', e.target.value)}
                rows={2}
              />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Switch checked={form.isActive} onCheckedChange={(checked) => handleField('isActive', checked)} />
              <span className="text-sm text-slate-700">Active (visible for new subscriptions)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5">
          <Button onClick={onClose} disabled={saving} variant="outline" className="rounded-[10px] border-slate-200 text-slate-500 shadow-none">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="default"
            disabled={!canSubmit || saving}
            loading={saving}
            className="rounded-[10px] font-semibold shadow-none"
            style={{ backgroundColor: ADMIN_ACCENT }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormDialog;
