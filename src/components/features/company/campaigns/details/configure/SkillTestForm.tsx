import React from "react";
import { Box } from "@mui/material";
import AppInput from "@/components/ui/AppInput";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkillTestConfig {
  skill: string;
  passingScore?: number;
  maxAttempts?: number;
}

interface Props {
  config: SkillTestConfig;
  onChange: (config: SkillTestConfig) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SkillTestForm: React.FC<Props> = ({ config, onChange }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
    {/* Skill */}
    <AppInput
      label="Skill"
      required
      placeholder="e.g. JavaScript, React, SQL..."
      value={config.skill}
      onChange={(e) => onChange({ ...config, skill: e.target.value })}
    />

    {/* Score + Attempts */}
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
      <AppInput
        label="Passing Score (%)"
        type="number"
        placeholder="e.g. 70"
        value={String(config.passingScore ?? "")}
        onChange={(e) =>
          onChange({
            ...config,
            passingScore: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
      <AppInput
        label="Max Attempts"
        type="number"
        placeholder="e.g. 3"
        value={String(config.maxAttempts ?? "")}
        onChange={(e) =>
          onChange({
            ...config,
            maxAttempts: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
    </Box>
  </Box>
);

export default SkillTestForm;
