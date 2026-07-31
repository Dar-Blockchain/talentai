"use client";

import React, { memo, useState, useEffect, useCallback } from "react";
import { Pencil, Lock, LockOpen, Link as LinkIcon, UserCircle, TriangleAlert } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { DatePicker } from "@/modules/shared/ui/DatePicker";
import { cn } from "@/lib/utils";
import { Campaign, ModuleType } from "@/modules/company/campaigns/types/campaign";
import { MODULE_CONFIG }     from "@/modules/shared/constants/campaign";
import { useTranslation, Trans } from "react-i18next";
import { useUpdateCampaignMutation } from "../../queries";

const MODULE_TYPES: ModuleType[] = ["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST", "TRAINING_PATH"];

interface Props {
  open:     boolean;
  campaign: Campaign;
  onClose:  () => void;
  onSaved:  (updated: Campaign) => void;
}

const SegmentButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-2 rounded-[10px] border text-[12.5px] font-semibold cursor-pointer transition-colors",
      active
        ? "bg-primary/10 border-primary/40 text-primary"
        : "bg-background border-border text-muted-foreground hover:bg-muted/40",
    )}
  >
    {icon}
    {label}
  </button>
);

const EditCampaignModal = memo<Props>(({ open, campaign, onClose, onSaved }) => {
  const { t } = useTranslation("dashboard");
  const m = "pages.campaigns.detail.edit_modal";

  const updateMut = useUpdateCampaignMutation(campaign._id);

  const [title,         setTitle]        = useState("");
  const [description,   setDescription]  = useState("");
  const [deadline,      setDeadline]      = useState("");
  const [anonymityMode, setAnonymityMode] = useState<Campaign["anonymityMode"]>("NOMINATIVE");
  const [accessMethod,  setAccessMethod]  = useState<Campaign["accessMethod"]>("ACCOUNTS");
  const [moduleType,    setModuleType]    = useState<ModuleType>("QUESTIONNAIRE");
  const [error,         setError]         = useState<string | null>(null);

  const originalModuleType = campaign.module?.type;
  const moduleChanged      = moduleType !== originalModuleType;

  useEffect(() => {
    if (open) {
      setTitle(campaign.title ?? "");
      setDescription(campaign.description ?? "");
      setDeadline(campaign.deadline ? campaign.deadline.slice(0, 10) : "");
      setAnonymityMode(campaign.anonymityMode ?? "NOMINATIVE");
      setAccessMethod(campaign.accessMethod ?? "ACCOUNTS");
      setModuleType(campaign.module?.type ?? "QUESTIONNAIRE");
      setError(null);
    }
  }, [open, campaign]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { setError(t(`${m}.error_title_required`)); return; }
    setError(null);
    try {
      const updated = await updateMut.mutateAsync({
        title:        title.trim(),
        description:  description.trim() || undefined,
        deadline:     deadline || undefined,
        anonymityMode,
        accessMethod,
        module: moduleChanged ? { type: moduleType, config: null } : campaign.module,
      } as Partial<Campaign>);
      onSaved(updated);
      onClose();
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String((e as { message?: unknown }).message)
            : undefined;
      setError(message || t(`${m}.error_save_failed`));
    }
  }, [title, description, deadline, anonymityMode, accessMethod, moduleChanged, moduleType, campaign, updateMut, onSaved, onClose, t, m]);

  const saving = updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl sm:max-w-lg shadow-2xl">
        <div className="flex items-center gap-3 pl-6 pr-10 pt-6 pb-4">
          <div className="flex items-center justify-center size-9 rounded-[10px] shrink-0 bg-primary/10 border border-primary/20">
            <Pencil className="size-[17px] text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-bold text-foreground">{t(`${m}.title`)}</DialogTitle>
            <DialogDescription className="text-[11px]">{t(`${m}.subtitle`)}</DialogDescription>
          </div>
        </div>

        <div className="px-6 pb-1 max-h-[65vh] overflow-y-auto">
          <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground/80">
                {t(`${m}.title_label`)}<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(`${m}.title_placeholder`)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground/80">{t(`${m}.description_label`)}</Label>
              <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t(`${m}.description_placeholder`)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground/80">{t(`${m}.deadline_label`)}</Label>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                minDate={new Date()}
                clearable
                className="w-fit"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground/80">{t(`${m}.module_type_label`)}</Label>
              <div className="grid grid-cols-2 gap-2">
                {MODULE_TYPES.map((mt) => {
                  const cfg        = MODULE_CONFIG[mt];
                  const Icon       = cfg.icon;
                  const selected   = moduleType === mt;
                  const comingSoon = mt === "TRAINING_PATH";
                  return (
                    <div
                      key={mt}
                      onClick={() => { if (!comingSoon) setModuleType(mt); }}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[1.5px] transition-colors",
                        comingSoon ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        selected ? "bg-primary/5" : "bg-muted/30 hover:bg-muted/50",
                      )}
                      style={{ borderColor: selected ? `${cfg.color}50` : undefined }}
                    >
                      <div
                        className="flex items-center justify-center size-[30px] rounded-lg shrink-0"
                        style={{ background: selected ? `${cfg.color}15` : "#F3F4F6" }}
                      >
                        <Icon className="!size-[15px]" style={{ color: selected ? cfg.color : "#9CA3AF" }} />
                      </div>
                      <div>
                        <p className={cn("text-[12.5px] font-bold leading-tight", selected ? "text-foreground" : "text-muted-foreground")}>
                          {t(`pages.campaigns.module.${mt}`)}
                        </p>
                        {comingSoon && (
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                            {t(`${m}.coming_soon`)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {moduleChanged ? (
                <div className="flex items-start gap-2 mt-1 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-200">
                  <TriangleAlert className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-amber-900 leading-relaxed">
                    <Trans i18nKey="pages.campaigns.detail.edit_modal.module_change_warning" ns="dashboard" components={{ strong: <strong /> }} />
                  </p>
                </div>
              ) : campaign.module?.type === "QUESTIONNAIRE" && campaign.module.config ? (
                <div className="mt-1 rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                    {t(`${m}.current_questions`, { count: campaign.module.config.questions.length })}
                  </p>
                  <div className="divide-y divide-border/50 max-h-40 overflow-y-auto pr-1">
                    {campaign.module.config.questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5 first:pt-0 last:pb-0">
                        <span className="text-[11px] font-semibold text-muted-foreground/50 w-4 shrink-0">{i + 1}</span>
                        <span className="text-[12px] text-foreground/80 leading-snug">{q.question}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : campaign.module?.type === "AI_INTERVIEW" && campaign.module.config?.agentPrompt ? (
                <div className="mt-1 rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{t(`${m}.current_prompt`)}</p>
                  <p className="text-[12px] text-foreground/75 leading-relaxed line-clamp-6 whitespace-pre-wrap border-l-2 border-border pl-2.5">
                    {campaign.module.config.agentPrompt}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground/80">{t(`${m}.anonymity_label`)}</Label>
              <div className="flex gap-2">
                <SegmentButton
                  active={anonymityMode === "NOMINATIVE"}
                  onClick={() => setAnonymityMode("NOMINATIVE")}
                  icon={<LockOpen className="size-3.5" />}
                  label={t(`pages.campaigns.detail.nominative`)}
                />
                <SegmentButton
                  active={anonymityMode === "ANONYMOUS"}
                  onClick={() => setAnonymityMode("ANONYMOUS")}
                  icon={<Lock className="size-3.5" />}
                  label={t(`pages.campaigns.detail.anonymous`)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground/80">{t(`${m}.access_method_label`)}</Label>
              <div className="flex gap-2">
                <SegmentButton
                  active={accessMethod === "ACCOUNTS"}
                  onClick={() => setAccessMethod("ACCOUNTS")}
                  icon={<UserCircle className="size-3.5" />}
                  label={t(`${m}.accounts_only`)}
                />
                <SegmentButton
                  active={accessMethod === "LINK"}
                  onClick={() => setAccessMethod("LINK")}
                  icon={<LinkIcon className="size-3.5" />}
                  label={t(`${m}.public_link`)}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/25 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-5 gap-2 sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            {t(`${m}.cancel`)}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} loading={saving}>
            {saving ? t(`${m}.saving`) : t(`${m}.save`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
EditCampaignModal.displayName = "EditCampaignModal";
export default EditCampaignModal;
