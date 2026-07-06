import React, { memo, useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Separator } from "@/modules/shared/ui/shadcn/separator";
import { CampaignModule, ModuleType } from "@/modules/company/campaigns/types/campaign";
import { MODULE_CONFIG } from "@/modules/shared/constants/campaign";
import QuestionnaireForm, { QuestionnaireConfig } from "./QuestionnaireForm";
import AIInterviewForm, { AIInterviewConfig } from "./AIInterviewForm";
import SkillTestForm, { SkillTestConfig } from "./SkillTestForm";
import TrainingPathForm, { TrainingPathConfig } from "./TrainingPathForm";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnyConfig = NonNullable<CampaignModule["config"]>;

interface Props {
  open: boolean;
  campaignId: string;
  moduleType: ModuleType | null;
  currentConfig: CampaignModule["config"];
  onClose: () => void;
  onSave: (campaignId: string, moduleType: ModuleType, config: AnyConfig) => void;
  loading?: boolean;
}

// ─── Default configs ──────────────────────────────────────────────────────────

const DEFAULT_CONFIGS: Record<ModuleType, AnyConfig> = {
  QUESTIONNAIRE: { questions: [], aiScoringEnabled: true, showResultsToParticipants: true },
  AI_INTERVIEW: { agentPrompt: "", showResultsToParticipants: true },
  SKILL_TEST: { skill: "", showResultsToParticipants: true },
  TRAINING_PATH: { resources: [] },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ConfigureModuleModal = memo<Props>(({
  open,
  campaignId,
  moduleType,
  currentConfig,
  onClose,
  onSave,
  loading = false,
}) => {
  const { t } = useTranslation("dashboard");
  const d = "pages.campaigns.detail";
  const [config, setConfig] = useState<AnyConfig | null>(null);

  useEffect(() => {
    if (open && moduleType) {
      setConfig(currentConfig ?? DEFAULT_CONFIGS[moduleType]);
    }
  }, [open, moduleType, currentConfig]);

  const isValid = useMemo(() => {
    if (!moduleType || !config) return false;
    switch (moduleType) {
      case "QUESTIONNAIRE":
        return (config as QuestionnaireConfig).questions?.length > 0;
      case "AI_INTERVIEW":
        return (config as AIInterviewConfig).agentPrompt?.trim().length > 0;
      case "SKILL_TEST":
        return (config as SkillTestConfig).skill?.trim().length > 0;
      case "TRAINING_PATH":
        return (config as TrainingPathConfig).resources?.length > 0;
      default:
        return false;
    }
  }, [moduleType, config]);

  const handleSave = useCallback(() => {
    if (moduleType && config && isValid) onSave(campaignId, moduleType, config);
  }, [moduleType, config, isValid, onSave, campaignId]);

  // Resolve display metadata — null when moduleType is null (dialog closing)
  const cfg = moduleType ? MODULE_CONFIG[moduleType] : null;
  const Icon = cfg?.icon;
  const moduleTitle = moduleType ? t(`pages.campaigns.module.${moduleType}`) : "";
  const moduleDesc  = moduleType ? t(`pages.campaigns.module_description.${moduleType}`) : "";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !loading) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden rounded-2xl sm:max-w-lg shadow-2xl"
      >
        {/* Header */}
        {cfg && Icon && (
          <div className="flex items-center gap-3 pl-6 pr-10 pt-6 pb-4">
            <div
              className="flex items-center justify-center size-10 rounded-xl shrink-0 border"
              style={{ background: `${cfg.color}18`, borderColor: `${cfg.color}28` }}
            >
              <Icon className="!size-5" style={{ color: cfg.color }} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-[15px] font-bold text-foreground">
                {t(`${d}.configure_modal_title`, { module: moduleTitle })}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {moduleDesc}
              </DialogDescription>
            </div>
          </div>
        )}
        <Separator />

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {config !== null && moduleType && (
            <>
              {moduleType === "QUESTIONNAIRE" && (
                <QuestionnaireForm
                  config={config as QuestionnaireConfig}
                  onChange={(c) => setConfig(c)}
                />
              )}
              {moduleType === "AI_INTERVIEW" && (
                <AIInterviewForm
                  config={config as AIInterviewConfig}
                  onChange={(c) => setConfig(c)}
                />
              )}
              {moduleType === "SKILL_TEST" && (
                <SkillTestForm
                  config={config as SkillTestConfig}
                  onChange={(c) => setConfig(c)}
                />
              )}
              {moduleType === "TRAINING_PATH" && (
                <TrainingPathForm
                  config={config as TrainingPathConfig}
                  onChange={(c) => setConfig(c)}
                />
              )}
            </>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <DialogFooter className="px-6 py-4 gap-2 sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {t(`${d}.edit_modal.cancel`)}
          </Button>
          <Button type="button" disabled={!isValid} loading={loading} onClick={handleSave}>
            {t(`${d}.save_configuration`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
ConfigureModuleModal.displayName = "ConfigureModuleModal";

export default ConfigureModuleModal;
