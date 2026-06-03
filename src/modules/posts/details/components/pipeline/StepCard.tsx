import React from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const STEP_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  assessment: { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  interview:  { color: TEAL,      bg: TEAL_BG,   border: TEAL_BORDER },
  email:      { color: "#0891B2", bg: "#ECFEFF",  border: "#A5F3FC" },
  task:       { color: "#D97706", bg: "#FFFBEB",  border: "#FDE68A" },
  default:    { color: "#6B7280", bg: "#F9FAFB",  border: "#E5E7EB" },
};

const Tag = ({ label }: { label: string }) => (
  <Chip label={label} size="small" sx={{ fontSize: "11px", height: 22, bgcolor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }} />
);

const ConfigSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Stack spacing={0.75}>
    <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6 }}>
      {title}
    </Typography>
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>{children}</Stack>
  </Stack>
);

export type Step = {
  id: string;
  order: number;
  status: string;
  data: { label: string; type: string; subtitle?: string; config?: Record<string, any> };
};

interface Props { step: Step }

const StepCard: React.FC<Props> = ({ step }) => {
  const { t }  = useTranslation("posts");
  const config = step.data?.config ?? {};
  const typeKey = step.data?.type?.toLowerCase() || "default";
  const colors  = STEP_COLORS[typeKey] || STEP_COLORS.default;

  return (
    <Accordion defaultExpanded={false}
      sx={{ borderRadius: "10px !important", border: "1px solid #F3F4F6", boxShadow: "none", "&:before": { display: "none" }, overflow: "hidden" }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
        sx={{ px: 2, py: 1, minHeight: "48px !important", "& .MuiAccordionSummary-content": { my: "0 !important" } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: colors.bg, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Typography sx={{ fontSize: "11px", fontWeight: 800, color: colors.color }}>{step.order + 1}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{step.data?.label}</Typography>
            <Box sx={{ display: "flex", gap: 0.75, mt: 0.25 }}>
              <Chip label={step.data?.type?.toUpperCase()} size="small"
                sx={{ fontSize: "9px", height: 16, fontWeight: 700, color: colors.color, bgcolor: colors.bg, border: `1px solid ${colors.border}` }} />
              <Chip label={step.status?.toUpperCase()} size="small"
                sx={{ fontSize: "9px", height: 16, fontWeight: 700, color: "#6B7280", bgcolor: "#F3F4F6", border: "1px solid #E5E7EB" }} />
            </Box>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2, borderTop: "1px solid #F3F4F6" }}>
        <Stack spacing={1.5}>
          {(config.assessmentLevel || config.passThreshold) && (
            <ConfigSection title={t("detail.pipeline.config.assessment")}>
              {config.assessmentLevel && <Tag label={`Level · ${config.assessmentLevel}`} />}
              {config.passThreshold   && <Tag label={`Pass ≥ ${config.passThreshold}%`} />}
            </ConfigSection>
          )}
          {Array.isArray(config.skills) && config.skills.length > 0 && (
            <ConfigSection title={t("detail.pipeline.config.technical_skills")}>
              {config.skills.map((s: any, i: number) => (
                <Tag key={i} label={s.requiredLevel ? `${s.name} · L${s.requiredLevel}` : s.name} />
              ))}
            </ConfigSection>
          )}
          {Array.isArray(config.softSkills) && config.softSkills.length > 0 && (
            <ConfigSection title={t("detail.pipeline.config.soft_skills")}>
              {config.softSkills.map((s: string, i: number) => <Tag key={i} label={s} />)}
            </ConfigSection>
          )}
          {Array.isArray(config.categories) && config.categories.length > 0 && (
            <ConfigSection title={t("detail.pipeline.config.categories")}>
              {config.categories.map((c: string, i: number) => <Tag key={i} label={c} />)}
            </ConfigSection>
          )}
          {(config.interviewMode || config.focusAreas) && (
            <ConfigSection title={t("detail.pipeline.config.interview")}>
              {config.interviewMode && <Tag label={`Mode · ${config.interviewMode}`} />}
              {config.focusAreas?.map((area: string, i: number) => <Tag key={i} label={area.replace("_", " ")} />)}
            </ConfigSection>
          )}
          {step.data?.type === "email" && (
            <ConfigSection title={t("detail.pipeline.config.email")}>
              {config.emailType && <Tag label={`Type · ${config.emailType}`} />}
              {config.sendTo    && <Tag label={`To · ${config.sendTo}`} />}
              {config.subject   && <Tag label={`Subject · ${config.subject}`} />}
            </ConfigSection>
          )}
          {step.data?.type === "task" && (
            <ConfigSection title={t("detail.pipeline.config.task")}>
              {config.taskTitle        && <Tag label={config.taskTitle} />}
              {config.deliverableType  && <Tag label={`Deliverable · ${config.deliverableType}`} />}
            </ConfigSection>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default StepCard;
