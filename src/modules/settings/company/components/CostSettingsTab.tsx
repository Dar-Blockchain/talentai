import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import AppUserInfo from "@/modules/shared/ui/AppUserInfo";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import EditActions from "@/modules/settings/shared/components/EditActions";
import { useCostSettings, useUpdateCostSettings } from "../queries";
import type { CostSettings } from "../types";

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg border-l-[3px] border-l-teal-600">
    <p className="text-[0.9rem] font-bold text-gray-900">{title}</p>
    <p className="text-[0.78rem] text-gray-400 mt-1">{subtitle}</p>
  </div>
);

// Editable fields as raw text while typing — binding the input straight to a
// number forces every cleared field back to "0" on each keystroke (you can
// never see an empty box to type a fresh value into). Parsed to numbers only
// on save.
type FormValues = { manualCostPerCandidate: string; interviewDurationMinutes: string };
const toFormValues = (s: CostSettings): FormValues => ({
  manualCostPerCandidate:   String(s.manualCostPerCandidate),
  interviewDurationMinutes: String(s.interviewDurationMinutes),
});

// aiCostPerInterview and blendedHourlyRate are TalentAI's own fixed rates —
// not exposed here since the company can't change them.
const FIELDS: { key: keyof FormValues; labelKey: string; labelDefault: string; descKey: string; descDefault: string; prefix?: string; suffix?: string }[] = [
  {
    key: "manualCostPerCandidate", labelKey: "manual_cost_label", labelDefault: "Manual cost per candidate",
    descKey: "manual_cost_desc", descDefault: "Flat cost of screening one candidate by hand, CV review + interview included",
    prefix: "$",
  },
  {
    key: "interviewDurationMinutes", labelKey: "interview_len_label", labelDefault: "Interview length",
    descKey: "interview_len_desc", descDefault: "How long a single interview takes, in minutes",
    suffix: "min",
  },
];

const CostSettingsTab: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useCostSettings();
  const { mutateAsync, isPending } = useUpdateCostSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormValues | null>(null);

  // Sync local form from server data whenever it changes and we're not mid-edit,
  // so a background refetch never clobbers what the user is currently typing.
  useEffect(() => {
    if (data && !isEditing) setForm(toFormValues(data));
  }, [data, isEditing]);

  const handleEdit = () => { if (data) setForm(toFormValues(data)); setIsEditing(true); };
  const handleCancel = () => { if (data) setForm(toFormValues(data)); setIsEditing(false); };

  const handleSave = async () => {
    if (!form) return;
    const manualCostPerCandidate   = Number(form.manualCostPerCandidate);
    const interviewDurationMinutes = Number(form.interviewDurationMinutes);
    if (!Number.isFinite(manualCostPerCandidate) || manualCostPerCandidate < 0
        || !Number.isFinite(interviewDurationMinutes) || interviewDurationMinutes < 0) {
      toast.error(t("pages.settings.cost.invalid", "Enter a valid non-negative number"));
      return;
    }
    try {
      await mutateAsync({ manualCostPerCandidate, interviewDurationMinutes });
      toast.success(t("pages.settings.cost.saved", "Cost settings saved"));
      setIsEditing(false);
    } catch {
      toast.error(t("pages.settings.cost.save_failed", "Couldn't save cost settings — try again"));
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <AppUserInfo
          name={t("pages.settings.cost.title", "Hiring Cost Rates")}
          subtitle={t("pages.settings.cost.subtitle", "Drives the manual-vs-TalentAI cost & hours cards on your dashboard")}
          icon={<Calculator size={20} className="text-teal-600" />}
          iconBgColor="#F0FDFA"
        />
        <EditActions isEditing={isEditing} loading={isPending} onEdit={handleEdit} onCancel={handleCancel} onSave={handleSave} disabled={isLoading} />
      </div>

      <div className="flex flex-col gap-5">
        <SectionHeader
          title={t("pages.settings.cost.section_title", "Cost & time assumptions")}
          subtitle={t("pages.settings.cost.section_subtitle", "Used to calculate what manual screening would have cost, compared to your actual TalentAI charges")}
        />

        {isLoading || !form ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map((f) => <Skeleton key={f.key} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map(({ key, labelKey, labelDefault, descKey, descDefault, prefix, suffix }) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                  {t(`pages.settings.cost.${labelKey}`, labelDefault)}
                </span>
                <div className="relative">
                  {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{prefix}</span>
                  )}
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form[key]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
                    }}
                    disabled={!isEditing}
                    className={cn(
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      prefix && "pl-6",
                    )}
                  />
                  {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{suffix}</span>
                  )}
                </div>
                <span className="text-[11px] text-gray-400">{t(`pages.settings.cost.${descKey}`, descDefault)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSettingsTab;
