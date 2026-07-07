import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, IconButton, TextField, FormControlLabel, Switch, Alert } from '@mui/material';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { X as CloseIcon, Award as WorkspacePremiumIcon } from 'lucide-react';
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
      const { name, ...updates } = form;
      updatePlan(
        { name: plan!.name, updates },
        {
          onSuccess: () => onSaved(form.name, 'updated'),
          onError: (err: any) => setError(err?.message || 'Failed to update plan.'),
        },
      );
    } else {
      createPlan(form, {
        onSuccess: () => onSaved(form.name, 'created'),
        onError: (err: any) => setError(err?.message || 'Failed to create plan.'),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: ADMIN_RADIUS, overflow: 'hidden', boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' } }}
    >
      <div className="relative px-6 pt-6 pb-2">
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12, color: '#94A3B8', '&:hover': { color: '#475569' } }}>
          <CloseIcon size={18} />
        </IconButton>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
            <WorkspacePremiumIcon size={20} color={ADMIN_ACCENT} />
          </div>
          <h2 className="text-[1.05rem] font-semibold text-slate-900">{isEdit ? 'Edit Plan' : 'New Plan'}</h2>
        </div>
      </div>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          <TextField
            label="Plan name"
            value={form.name}
            onChange={(e) => handleField('name', e.target.value)}
            disabled={isEdit}
            helperText={isEdit ? 'Plan names cannot be changed after creation.' : ' '}
            fullWidth
            size="small"
          />
          <div className="flex gap-3">
            <TextField
              label="Job posts limit"
              type="number"
              value={form.postsLimit}
              onChange={(e) => handleField('postsLimit', Number(e.target.value))}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <TextField
              label="Interviews / month"
              type="number"
              value={form.monthlyInterviewLimit}
              onChange={(e) => handleField('monthlyInterviewLimit', Number(e.target.value))}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </div>
          <div className="flex gap-3">
            <TextField
              label="Duration (days)"
              type="number"
              value={form.durationDays}
              onChange={(e) => handleField('durationDays', Number(e.target.value))}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <TextField
              label="Price (USD / mo)"
              type="number"
              value={form.priceUsd}
              onChange={(e) => handleField('priceUsd', Number(e.target.value))}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </div>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handleField('description', e.target.value)}
            multiline
            minRows={2}
            fullWidth
            size="small"
          />
          <FormControlLabel
            control={<Switch checked={form.isActive} onChange={(e) => handleField('isActive', e.target.checked)} />}
            label="Active (visible for new subscriptions)"
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
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
      </DialogActions>
    </Dialog>
  );
};

export default PlanFormDialog;
