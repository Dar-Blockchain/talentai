import React, { memo } from "react";
import { Label } from "@/modules/shared/ui/shadcn/label";
import { Textarea } from "@/modules/shared/ui/shadcn/textarea";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIInterviewConfig {
  agentPrompt: string;
}

interface Props {
  config: AIInterviewConfig;
  onChange: (config: AIInterviewConfig) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AIInterviewForm = memo<Props>(({ config, onChange }) => {
  const { t } = useTranslation("dashboard");
  const cf = "pages.campaigns.detail.configure_form.ai_interview";

  return (
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
  );
});
AIInterviewForm.displayName = "AIInterviewForm";

export default AIInterviewForm;
