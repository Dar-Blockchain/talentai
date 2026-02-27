import React from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { AddOutlined, CloseOutlined } from "@mui/icons-material";
import AppInput from "@/components/ui/AppInput";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIInterviewConfig {
  agentPrompt: string;
  durationMinutes?: number;
  scoringCriteria?: string[];
}

interface Props {
  config: AIInterviewConfig;
  onChange: (config: AIInterviewConfig) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AIInterviewForm: React.FC<Props> = ({ config, onChange }) => {
  const criteria = config.scoringCriteria ?? [];

  const addCriterion = () =>
    onChange({ ...config, scoringCriteria: [...criteria, ""] });

  const updateCriterion = (i: number, value: string) =>
    onChange({
      ...config,
      scoringCriteria: criteria.map((c, idx) => (idx === i ? value : c)),
    });

  const removeCriterion = (i: number) =>
    onChange({
      ...config,
      scoringCriteria: criteria.filter((_, idx) => idx !== i),
    });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Agent Prompt */}
      <AppInput
        label="Agent Prompt"
        required
        multiline
        rows={4}
        placeholder="Describe the AI interviewer's role, tone, and focus areas..."
        value={config.agentPrompt}
        onChange={(e) => onChange({ ...config, agentPrompt: e.target.value })}
      />

      {/* Duration */}
      <AppInput
        label="Duration (minutes)"
        type="number"
        placeholder="e.g. 30"
        value={String(config.durationMinutes ?? "")}
        onChange={(e) =>
          onChange({
            ...config,
            durationMinutes: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        fullWidth={false}
        sx={{ width: 200 }}
      />

      {/* Scoring Criteria */}
      <Box>
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: 0.3, textTransform: "uppercase", mb: 1 }}
        >
          Scoring Criteria
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {criteria.map((c, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <AppInput
                placeholder={`Criterion ${i + 1}`}
                value={c}
                onChange={(e) => updateCriterion(i, e.target.value)}
              />
              <IconButton
                size="small"
                onClick={() => removeCriterion(i)}
                sx={{ color: "#9CA3AF", flexShrink: 0, "&:hover": { color: "#EF4444" } }}
              >
                <CloseOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            onClick={addCriterion}
            sx={{
              alignSelf: "flex-start",
              fontSize: "12px",
              color: "#6B7280",
              textTransform: "none",
            }}
          >
            Add Criterion
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AIInterviewForm;
