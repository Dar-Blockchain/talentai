import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentJob } from "@/store/slices/postSlice";
import { Box, Chip, Stack, Typography } from "@mui/material";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import AssignmentLateOutlined from "@mui/icons-material/AssignmentLateOutlined";
import SectionCard from "@/components/ui/SectionCard";
import StepCard from "./components/pipeline/StepCard";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props { canEdit: boolean }

const RecruitmentFlowDetails: React.FC<Props> = ({ canEdit }) => {
  const { t } = useTranslation("posts");
  const job = useSelector(selectCurrentJob);

  if (!canEdit && !job?.PostSteps?.length) return null;

  const sortedSteps = React.useMemo(
    () => (Array.isArray(job?.PostSteps) ? [...job.PostSteps].sort((a, b) => a.order - b.order) : []),
    [job?.PostSteps]
  );

  return (
    <SectionCard>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: sortedSteps.length ? 3 : 2 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL }}>
          <AccountTreeOutlined sx={{ fontSize: 15 }} />
        </Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {t("detail.pipeline.title")}
        </Typography>
        {sortedSteps.length > 0 && (
          <Chip
            label={t("detail.pipeline.step_count", { count: sortedSteps.length })}
            size="small"
            sx={{ fontSize: "10px", height: 20, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, fontWeight: 700, ml: 0.5 }}
          />
        )}
      </Box>

      {!sortedSteps.length && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, px: 3, bgcolor: "#FAFAFA", borderRadius: 2, border: "1px dashed #E5E7EB", textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <AssignmentLateOutlined sx={{ fontSize: 28, color: TEAL }} />
          </Box>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151", mb: 0.5 }}>{t("detail.pipeline.empty_title")}</Typography>
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>{t("detail.pipeline.empty_hint")}</Typography>
        </Box>
      )}

      {sortedSteps.length > 0 && (
        <Stack spacing={1.5}>
          {sortedSteps.map((step) => <StepCard key={step.id} step={step} />)}
        </Stack>
      )}
    </SectionCard>
  );
};

export default RecruitmentFlowDetails;
