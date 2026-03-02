import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { SettingsOutlined } from "@mui/icons-material";
import { Campaign, CampaignModule, ModuleType } from "@/types/campaign";
import { MODULE_CONFIG } from "@/constants/campaign";

const CARD = { bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", p: 2.5 } as const;

interface Props {
  module: Campaign["module"];
  onConfigureModule?: (moduleType: ModuleType) => void;
}

const CampaignModuleCard: React.FC<Props> = ({ module, onConfigureModule }) => {
  const mod = module ?? null;

  return (
    <Box sx={CARD}>
      <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111827", mb: 2 }}>
        Assessment Module
      </Typography>

      {!mod ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>
            Module not configured yet.
          </Typography>
        </Box>
      ) : (
        <ModuleItem mod={mod} onConfigure={onConfigureModule} />
      )}
    </Box>
  );
};

// ─── ModuleItem ───────────────────────────────────────────────────────────────

const ModuleItem: React.FC<{
  mod: CampaignModule;
  onConfigure?: (moduleType: ModuleType) => void;
}> = ({ mod, onConfigure }) => {
  const cfg = MODULE_CONFIG[mod.type];
  const Icon = cfg.icon;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid #E5E7EB",
        bgcolor: "#FAFAFA",
        alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: `${cfg.color}18`,
          border: `1px solid ${cfg.color}28`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18, color: cfg.color }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111827" }}>
            {cfg.label}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SettingsOutlined sx={{ fontSize: "13px !important" }} />}
            onClick={() => onConfigure?.(mod.type)}
            sx={{
              borderColor: "#0D9488",
              color: "#0D9488",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 1.5,
              px: 1.25,
              py: 0.3,
              flexShrink: 0,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#F0FDFA", borderColor: "#0b7a6f" },
            }}
          >
            {mod.config ? "Edit Config" : "Configure"}
          </Button>
        </Box>

        <Typography sx={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>
          {cfg.description}
        </Typography>

        <ModuleConfigSnippet mod={mod} />
      </Box>
    </Box>
  );
};

// ─── ModuleConfigSnippet ──────────────────────────────────────────────────────

const ModuleConfigSnippet: React.FC<{ mod: CampaignModule }> = ({ mod }) => {
  if (!mod.config) {
    return (
      <Typography sx={{ fontSize: "11px", color: "#D1D5DB", mt: 0.5 }}>
        Not configured yet
      </Typography>
    );
  }

  if (mod.type === "QUESTIONNAIRE") {
    const count = mod.config.questions?.length ?? 0;
    return (
      <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.75 }}>
        {count} question{count !== 1 ? "s" : ""}
      </Typography>
    );
  }

  if (mod.type === "AI_INTERVIEW") {
    return mod.config.durationMinutes ? (
      <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.75 }}>
        Duration: {mod.config.durationMinutes} min
      </Typography>
    ) : null;
  }

  if (mod.type === "SKILL_TEST") {
    const { passingScore, maxAttempts } = mod.config;
    return (
      <Box sx={{ display: "flex", gap: 2, mt: 0.75 }}>
        {passingScore !== undefined && (
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
            Pass score: {passingScore}%
          </Typography>
        )}
        {maxAttempts !== undefined && (
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
            Max attempts: {maxAttempts}
          </Typography>
        )}
      </Box>
    );
  }

  if (mod.type === "TRAINING_PATH") {
    const count = mod.config.resources?.length ?? 0;
    return (
      <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.75 }}>
        {count} resource{count !== 1 ? "s" : ""}
      </Typography>
    );
  }

  return null;
};

export default CampaignModuleCard;
