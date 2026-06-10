import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { CampaignModule, ModuleType } from "@/types/campaign";
import { MODULE_CONFIG } from "@/constants/campaign";
import AppButton from "@/components/ui/AppButton";
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
}

// ─── Default configs ──────────────────────────────────────────────────────────

const DEFAULT_CONFIGS: Record<ModuleType, AnyConfig> = {
  QUESTIONNAIRE: { questions: [] },
  AI_INTERVIEW: { agentPrompt: "" },
  SKILL_TEST: { skill: "" },
  TRAINING_PATH: { resources: [] },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ConfigureModuleModal: React.FC<Props> = ({
  open,
  campaignId,
  moduleType,
  currentConfig,
  onClose,
  onSave,
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

  const handleSave = () => {
    if (moduleType && config && isValid) {
      onSave(campaignId, moduleType, config);
    }
  };

  // Resolve display metadata — null when moduleType is null (dialog closing)
  const cfg = moduleType ? MODULE_CONFIG[moduleType] : null;
  const Icon = cfg?.icon;
  const moduleTitle = moduleType ? t(`pages.campaigns.module.${moduleType}`) : "";
  const moduleDesc  = moduleType ? t(`pages.campaigns.module_description.${moduleType}`) : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { sx: { borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" } },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        {cfg && Icon && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2.5, pb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${cfg.color}18`,
                border: `1px solid ${cfg.color}28`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 20, color: cfg.color }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
                {t(`${d}.configure_modal_title`, { module: moduleTitle })}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.25 }}>
                {moduleDesc}
              </Typography>
            </Box>
          </Box>
        )}
        <Divider />
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 2.5, maxHeight: "60vh", overflowY: "auto" }}>
        {config !== null && moduleType && (
          <Box sx={{ pt: 0.5 }}>
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
          </Box>
        )}
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "13px",
            color: "#6B7280",
            "&:hover": { bgcolor: "#F3F4F6" },
          }}
        >
          {t(`${d}.edit_modal.cancel`)}
        </Button>
        <AppButton
          label={t(`${d}.save_configuration`)}
          variant="contained"
          size="small"
          disabled={!isValid}
          onClick={handleSave}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfigureModuleModal;
