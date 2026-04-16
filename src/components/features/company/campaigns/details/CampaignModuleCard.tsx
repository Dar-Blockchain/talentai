import React from "react";
import { Box, Typography } from "@mui/material";
import SettingsOutlined              from "@mui/icons-material/SettingsOutlined";
import CheckCircleOutlined           from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined  from "@mui/icons-material/RadioButtonUncheckedOutlined";
import AccessTimeOutlined            from "@mui/icons-material/AccessTimeOutlined";
import QuizOutlined                  from "@mui/icons-material/QuizOutlined";
import EmojiEventsOutlined           from "@mui/icons-material/EmojiEventsOutlined";
import InfoOutlined                  from "@mui/icons-material/InfoOutlined";
import { Campaign, CampaignModule, ModuleType } from "@/types/campaign";
import { MODULE_CONFIG } from "@/constants/campaign";

const CARD = {
  bgcolor: "#fff",
  border: "1px solid #EDEEF0",
  borderRadius: "18px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
} as const;

interface Props {
  module:             Campaign["module"];
  onConfigureModule?: (moduleType: ModuleType) => void;
  showConfigure?:     boolean;
  isEmployee?:        boolean;
}

const CampaignModuleCard: React.FC<Props> = ({
  module: mod, onConfigureModule, showConfigure = true, isEmployee = false,
}) => {
  if (!mod) return null;

  const cfg      = MODULE_CONFIG[mod.type];
  const Icon     = cfg.icon;
  const color    = cfg.color;
  const hasConfig = !!mod.config;

  return (
    <Box sx={{ ...CARD, p: 0, overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.25, pb: 1.75, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0F172A" }}>
          Assessment Module
        </Typography>
      </Box>

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Module banner */}
        <Box sx={{
          borderRadius: "14px", p: 2.25,
          background: `linear-gradient(135deg, ${color}10 0%, ${color}04 100%)`,
          border: `1px solid ${color}20`,
          display: "flex", alignItems: "center", gap: 2,
        }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: "14px", flexShrink: 0,
            bgcolor: `${color}14`, border: `1px solid ${color}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px ${color}20`,
          }}>
            <Icon sx={{ fontSize: 26, color }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.4 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0F172A" }}>
                {cfg.label}
              </Typography>
              {showConfigure && !isEmployee && (
                <Box
                  onClick={() => onConfigureModule?.(mod.type)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.5,
                    px: 1.375, py: 0.625, borderRadius: "8px", cursor: "pointer", flexShrink: 0,
                    bgcolor: hasConfig ? `${color}10` : color,
                    border: `1px solid ${hasConfig ? `${color}25` : color}`,
                    transition: "all 0.15s",
                    "&:hover": { opacity: 0.85 },
                  }}
                >
                  <SettingsOutlined sx={{ fontSize: 12, color: hasConfig ? color : "#fff" }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: hasConfig ? color : "#fff" }}>
                    {hasConfig ? "Edit" : "Configure"}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.4 }}>
              {cfg.description}
            </Typography>
          </Box>
        </Box>

        {/* Employee view: what to expect pills */}
        {isEmployee && hasConfig && <EmployeeModuleDetails mod={mod} color={color} />}

        {/* Company view: config details */}
        {!isEmployee && hasConfig && <ConfigDetails mod={mod} color={color} />}

        {/* Company view: not configured notice */}
        {!isEmployee && !hasConfig && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1.25, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <RadioButtonUncheckedOutlined sx={{ fontSize: 15, color: "#D97706", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "12px", color: "#92400E" }}>
              Module not configured yet. Click <strong>Configure</strong> to set it up.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ─── Employee: "What to expect" pills ────────────────────────────────────────

const InfoPill: React.FC<{ icon: React.ElementType; label: string; value: string; color: string }> = ({
  icon: PillIcon, label, value, color,
}) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1.25,
    px: 1.75, py: 1.25, borderRadius: "12px",
    bgcolor: `${color}08`, border: `1px solid ${color}18`, flex: 1, minWidth: 0,
  }}>
    <Box sx={{
      width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
      bgcolor: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <PillIcon sx={{ fontSize: 15, color }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const EmployeeModuleDetails: React.FC<{ mod: CampaignModule; color: string }> = ({ mod, color }) => {
  if (!mod.config) return null;

  const pills: { icon: React.ElementType; label: string; value: string }[] = [];

  if (mod.type === "QUESTIONNAIRE") {
    const count = mod.config.questions?.length ?? 0;
    pills.push({ icon: QuizOutlined, label: "Questions", value: `${count} question${count !== 1 ? "s" : ""}` });
  }

  if (mod.type === "AI_INTERVIEW") {
    if (mod.config.durationMinutes) pills.push({ icon: AccessTimeOutlined, label: "Duration", value: `${mod.config.durationMinutes} min` });
    if (mod.config.scoringCriteria?.length) pills.push({ icon: EmojiEventsOutlined, label: "Scoring", value: `${mod.config.scoringCriteria.length} criteria` });
  }

  if (mod.type === "SKILL_TEST") {
    if (mod.config.skill) pills.push({ icon: InfoOutlined, label: "Skill", value: mod.config.skill });
    if (mod.config.passingScore !== undefined) pills.push({ icon: EmojiEventsOutlined, label: "Pass Mark", value: `${mod.config.passingScore}%` });
    if (mod.config.durationMinutes) pills.push({ icon: AccessTimeOutlined, label: "Duration", value: `${mod.config.durationMinutes} min` });
  }

  if (pills.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        What to expect
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {pills.map((p) => (
          <InfoPill key={p.label} icon={p.icon} label={p.label} value={p.value} color={color} />
        ))}
      </Box>
    </Box>
  );
};

// ─── Company: config details ──────────────────────────────────────────────────

const ConfigRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid #F8FAFC" }}>
    <Typography sx={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>{label}</Typography>
    <Typography component="div" sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>{value}</Typography>
  </Box>
);

const ConfigDetails: React.FC<{ mod: CampaignModule; color: string }> = ({ mod, color }) => {
  if (!mod.config) return null;

  return (
    <Box sx={{ borderRadius: "12px", border: "1px solid #F1F5F9", bgcolor: "#FAFBFC", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.75, py: 1, borderBottom: "1px solid #F1F5F9", bgcolor: "#F0FDF4" }}>
        <CheckCircleOutlined sx={{ fontSize: 13, color: "#16A34A" }} />
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#16A34A" }}>Configured</Typography>
      </Box>

      <Box sx={{ px: 1.75, "&>:last-child": { borderBottom: "none" } }}>
        {mod.type === "QUESTIONNAIRE" && (() => {
          const count = mod.config!.questions?.length ?? 0;
          return (
            <ConfigRow
              label="Questions"
              value={
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "999px", bgcolor: `${color}10` }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color }}>{count} question{count !== 1 ? "s" : ""}</Typography>
                </Box>
              }
            />
          );
        })()}

        {mod.type === "AI_INTERVIEW" && (() => {
          const { durationMinutes, scoringCriteria } = mod.config!;
          return (<>
            {durationMinutes && <ConfigRow label="Duration" value={`${durationMinutes} minutes`} />}
            {scoringCriteria && scoringCriteria.length > 0 && <ConfigRow label="Scoring Criteria" value={`${scoringCriteria.length} criteria`} />}
            {mod.config!.agentPrompt && <ConfigRow label="Agent Prompt" value={<Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#0F172A", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.config!.agentPrompt}</Typography>} />}
          </>);
        })()}

        {mod.type === "SKILL_TEST" && (() => {
          const { skill, passingScore, maxAttempts } = mod.config!;
          return (<>
            {skill && <ConfigRow label="Skill" value={skill} />}
            {passingScore !== undefined && <ConfigRow label="Passing Score" value={`${passingScore}%`} />}
            {maxAttempts  !== undefined && <ConfigRow label="Max Attempts"  value={String(maxAttempts)} />}
          </>);
        })()}

        {mod.type === "TRAINING_PATH" && (() => {
          const count = mod.config!.resources?.length ?? 0;
          return (
            <ConfigRow
              label="Resources"
              value={
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "999px", bgcolor: `${color}10` }}>
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color }}>{count} resource{count !== 1 ? "s" : ""}</Typography>
                </Box>
              }
            />
          );
        })()}
      </Box>
    </Box>
  );
};

export default CampaignModuleCard;
