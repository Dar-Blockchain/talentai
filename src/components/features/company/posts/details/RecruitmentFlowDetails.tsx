import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentJob } from "@/store/slices/postSlice";
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Chip, Stack, Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import AssignmentLateOutlined from "@mui/icons-material/AssignmentLateOutlined";
import SectionCard from "@/components/dashboard-workplace/ui/SectionCard";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

type Step = {
  id: string;
  order: number;
  status: string;
  data: {
    label: string;
    type: string;
    subtitle?: string;
    config?: Record<string, any>;
  };
};

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

interface Props {
  canEdit: boolean;
  onEdit: () => void;
}

const RecruitmentFlowDetails: React.FC<Props> = ({ canEdit }) => {
  const job = useSelector(selectCurrentJob);

  if (!canEdit && !job?.PostSteps?.length) return null;

  const sortedSteps: Step[] = React.useMemo(
    () => (Array.isArray(job?.PostSteps) ? [...job.PostSteps].sort((a, b) => a.order - b.order) : []),
    [job?.PostSteps]
  );

  return (
    <SectionCard>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: sortedSteps.length ? 3 : 2 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL }}>
          <AccountTreeOutlined sx={{ fontSize: 15 }} />
        </Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Recruitment Pipeline
        </Typography>
        {sortedSteps.length > 0 && (
          <Chip
            label={`${sortedSteps.length} step${sortedSteps.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ fontSize: "10px", height: 20, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, fontWeight: 700, ml: 0.5 }}
          />
        )}
      </Box>

      {/* Empty state */}
      {!sortedSteps.length && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, px: 3, bgcolor: "#FAFAFA", borderRadius: 2, border: "1px dashed #E5E7EB", textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <AssignmentLateOutlined sx={{ fontSize: 28, color: TEAL }} />
          </Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151", mb: 0.5 }}>No Pipeline Steps Yet</Typography>
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>Create a recruitment flow to manage your hiring process.</Typography>
        </Box>
      )}

      {/* Steps */}
      {sortedSteps.length > 0 && (
        <Stack spacing={1.5}>
          {sortedSteps.map((step) => {
            const config = step.data?.config ?? {};
            const typeKey = step.data?.type?.toLowerCase() || "default";
            const colors = STEP_COLORS[typeKey] || STEP_COLORS.default;

            return (
              <Accordion key={step.id} defaultExpanded={false}
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
                      <ConfigSection title="Assessment">
                        {config.assessmentLevel && <Tag label={`Level · ${config.assessmentLevel}`} />}
                        {config.passThreshold && <Tag label={`Pass ≥ ${config.passThreshold}%`} />}
                      </ConfigSection>
                    )}
                    {Array.isArray(config.skills) && config.skills.length > 0 && (
                      <ConfigSection title="Technical Skills">
                        {config.skills.map((s: any, i: number) => (
                          <Tag key={i} label={s.requiredLevel ? `${s.name} · L${s.requiredLevel}` : s.name} />
                        ))}
                      </ConfigSection>
                    )}
                    {Array.isArray(config.softSkills) && config.softSkills.length > 0 && (
                      <ConfigSection title="Soft Skills">
                        {config.softSkills.map((s: string, i: number) => <Tag key={i} label={s} />)}
                      </ConfigSection>
                    )}
                    {Array.isArray(config.categories) && config.categories.length > 0 && (
                      <ConfigSection title="Categories">
                        {config.categories.map((c: string, i: number) => <Tag key={i} label={c} />)}
                      </ConfigSection>
                    )}
                    {(config.interviewMode || config.focusAreas) && (
                      <ConfigSection title="Interview">
                        {config.interviewMode && <Tag label={`Mode · ${config.interviewMode}`} />}
                        {config.focusAreas?.map((area: string, i: number) => <Tag key={i} label={area.replace("_", " ")} />)}
                      </ConfigSection>
                    )}
                    {step.data?.type === "email" && (
                      <ConfigSection title="Email">
                        {config.emailType && <Tag label={`Type · ${config.emailType}`} />}
                        {config.sendTo && <Tag label={`To · ${config.sendTo}`} />}
                        {config.subject && <Tag label={`Subject · ${config.subject}`} />}
                      </ConfigSection>
                    )}
                    {step.data?.type === "task" && (
                      <ConfigSection title="Task">
                        {config.taskTitle && <Tag label={config.taskTitle} />}
                        {config.deliverableType && <Tag label={`Deliverable · ${config.deliverableType}`} />}
                      </ConfigSection>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}
    </SectionCard>
  );
};

export default RecruitmentFlowDetails;
