import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Divider, LinearProgress, Typography } from "@mui/material";
import { scoreStyle } from "@/components/features/company/interviews/list/InterviewCard";
import ScoreRing from "./ScoreRing";

const Bar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <LinearProgress variant="determinate" value={Math.min(value, 100)}
    sx={{ height: 6, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
);

const SCORE_ROWS = [
  { key: "communication",    labelKey: "pages.applications.assessment_modal.score_communication",    color: "#3B82F6" },
  { key: "technical_depth",  labelKey: "pages.applications.assessment_modal.score_technical_depth",  color: "#8B5CF6" },
  { key: "problem_approach", labelKey: "pages.applications.assessment_modal.score_problem_approach", color: "#F59E0B" },
  { key: "learning_ability", labelKey: "pages.applications.assessment_modal.score_learning_ability", color: "#10B981" },
];

interface Props {
  overallScore: number;
  analytics?: { coveragePercentage?: number; duration?: number; messageCount?: number };
  finalReport?: { scores?: Record<string, number> };
  aiAnalysis?: { strongestAreas?: string[]; weakestAreas?: string[] };
}

const AssessmentScoresTab: React.FC<Props> = ({ overallScore, analytics, finalReport, aiAnalysis }) => {
  const { t } = useTranslation("dashboard");
  const sc = scoreStyle(overallScore);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 4, mb: 3, justifyContent: "center", flexWrap: "wrap" }}>
        <ScoreRing value={overallScore} color={sc.color} size={90} label={t("pages.applications.assessment_modal.score_overall")} />
        {analytics?.coveragePercentage !== undefined && (
          <ScoreRing value={analytics.coveragePercentage} color="#0891B2" size={90} label={t("pages.applications.assessment_modal.score_coverage")} />
        )}
      </Box>

      {finalReport?.scores && Object.keys(finalReport.scores).length > 1 && (
        <>
          <Divider sx={{ mb: 2.5, borderColor: "#F3F4F6" }} />
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5 }}>
            {t("pages.applications.assessment_modal.score_breakdown")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {SCORE_ROWS.map(({ key, labelKey, color }) => {
              const val = finalReport.scores?.[key];
              if (val === undefined) return null;
              const pct = Math.min(Math.round(val), 100);
              const tColor = pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626";
              return (
                <Box key={key}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 500, color: "#374151" }}>{t(labelKey)}</Typography>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: tColor }}>{pct}%</Typography>
                  </Box>
                  <Bar value={pct} color={color} />
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {(aiAnalysis?.strongestAreas?.length || aiAnalysis?.weakestAreas?.length) ? (
        <>
          <Divider sx={{ my: 2.5, borderColor: "#F3F4F6" }} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {aiAnalysis?.strongestAreas?.length ? (
              <Box sx={{ flex: 1, bgcolor: "#F0FDF4", borderRadius: "12px", border: "1px solid #BBF7D0", p: 1.75 }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.75 }}>
                  {t("pages.applications.assessment_modal.strengths")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                  {aiAnalysis.strongestAreas.map((a: string, i: number) => (
                    <Typography key={i} sx={{ fontSize: "0.75rem", color: "#065F46" }}>· {a}</Typography>
                  ))}
                </Box>
              </Box>
            ) : null}
            {aiAnalysis?.weakestAreas?.length ? (
              <Box sx={{ flex: 1, bgcolor: "#FFF7ED", borderRadius: "12px", border: "1px solid #FED7AA", p: 1.75 }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.75 }}>
                  {t("pages.applications.assessment_modal.weak_areas")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                  {aiAnalysis.weakestAreas.map((a: string, i: number) => (
                    <Typography key={i} sx={{ fontSize: "0.75rem", color: "#92400E" }}>· {a}</Typography>
                  ))}
                </Box>
              </Box>
            ) : null}
          </Box>
        </>
      ) : null}
    </Box>
  );
};

export default AssessmentScoresTab;
