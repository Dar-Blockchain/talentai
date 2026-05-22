import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, LinearProgress, Typography } from "@mui/material";
import { scoreStyle } from "@/components/features/company/interviews/list/InterviewCard";

const Bar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <LinearProgress variant="determinate" value={Math.min(value, 100)}
    sx={{ height: 6, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
);

const TEAL = "#0D9488";

interface Props {
  areas: Record<string, any>;
  overallCoverage?: number;
}

const AssessmentCoverageTab: React.FC<Props> = ({ areas, overallCoverage }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      {overallCoverage !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("pages.applications.assessment_modal.overall_coverage")}
          </Typography>
          <Chip label={`${Math.round(overallCoverage)}%`} size="small"
            sx={{ bgcolor: `${TEAL}12`, color: TEAL, fontWeight: 700, fontSize: "0.72rem", height: 20 }} />
        </Box>
      )}
      {Object.entries(areas).map(([area, data]: [string, any]) => {
        const pct = data.percentage ?? 0;
        const ac  = scoreStyle(pct);
        return (
          <Box key={area}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                {area.replace(/_/g, " ")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: ac.color }}>{pct}%</Typography>
                <Chip label={ac.label} size="small"
                  sx={{ height: 18, bgcolor: ac.bg, color: ac.color, fontWeight: 700, fontSize: "0.62rem", "& .MuiChip-label": { px: 1 } }} />
              </Box>
            </Box>
            <Bar value={pct} color={ac.color} />
            {data.indicators?.length > 0 && (
              <Box sx={{ mt: 1.25, display: "flex", flexDirection: "column", gap: 0.5 }}>
                {data.indicators.slice(0, 4).map((ind: any, i: number) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, bgcolor: ind.covered ? "#10B981" : "#EF4444" }} />
                    <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{ind.evidence?.[0] || ind.name}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default AssessmentCoverageTab;
