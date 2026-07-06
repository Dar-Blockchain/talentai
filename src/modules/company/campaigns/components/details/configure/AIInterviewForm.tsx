import React, { memo, useCallback } from "react";
import { Eye } from "lucide-react";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { useTranslation } from "react-i18next";
import { ToggleRow } from "./QuestionnaireForm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIInterviewConfig {
  agentPrompt: string;
  showResultsToParticipants?: boolean;
}

interface Props {
  config: AIInterviewConfig;
  onChange: (config: AIInterviewConfig) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AIInterviewForm = memo<Props>(({ config, onChange }) => {
  const { t } = useTranslation("dashboard");
  const cf = "pages.campaigns.detail.configure_form.ai_interview";
  const qcf = "pages.campaigns.detail.configure_form.questionnaire";

  const showResultsToParticipants = config.showResultsToParticipants !== false;
  const toggleShowResults = useCallback(
    (checked: boolean) => onChange({ ...config, showResultsToParticipants: checked }),
    [onChange, config],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-bold text-foreground/80">
          {t(`${cf}.agent_prompt`)}<span className="text-destructive ml-0.5">*</span>
        </Label>
        <Textarea
          rows={4}
          placeholder={t(`${cf}.agent_placeholder`)}
          value={config.agentPrompt}
          onChange={(e) => onChange({ ...config, agentPrompt: e.target.value })}
        />
      </div>

      <ToggleRow
        icon={<Eye className="size-4" />}
        iconBg="#ECFEFF"
        iconColor="#0891B2"
        label={t(`${qcf}.show_results_label`)}
        hint={t(`${qcf}.show_results_hint`)}
        checked={showResultsToParticipants}
        onCheckedChange={toggleShowResults}
      />
    </div>
  );
});
AIInterviewForm.displayName = "AIInterviewForm";

export default AIInterviewForm;
