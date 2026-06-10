import React from "react";
import { Box } from "@mui/material";
import AppInput from "@/components/ui/AppInput";
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

const AIInterviewForm: React.FC<Props> = ({ config, onChange }) => {
  const { t } = useTranslation("dashboard");
  const cf = "pages.campaigns.detail.configure_form.ai_interview";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <AppInput
        label={t(`${cf}.agent_prompt`)}
        required
        multiline
        rows={4}
        placeholder={t(`${cf}.agent_placeholder`)}
        value={config.agentPrompt}
        onChange={(e) => onChange({ ...config, agentPrompt: e.target.value })}
      />
    </Box>
  );
};

export default AIInterviewForm;
