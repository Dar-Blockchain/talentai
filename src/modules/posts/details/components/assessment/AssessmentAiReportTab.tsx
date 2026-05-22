import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";

interface Props {
  summary?: string;
  recommendations?: string[];
}

const AssessmentAiReportTab: React.FC<Props> = ({ summary, recommendations = [] }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {summary && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PersonOutlined sx={{ fontSize: 14, color: "#10B981" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>
              {t("pages.applications.assessment_modal.ai_summary_title")}
            </Typography>
          </Box>
          <Box sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #D1FAE5" }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.8 }}>{summary}</Typography>
          </Box>
        </Box>
      )}
      {recommendations.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LightbulbOutlined sx={{ fontSize: 14, color: "#F59E0B" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>
              {t("pages.applications.assessment_modal.recommendations_title")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recommendations.map((rec: string, i: number) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.5, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <CheckCircleOutlined sx={{ color: "#F59E0B", fontSize: 15, mt: 0.15, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.78rem", color: "#92400E", lineHeight: 1.65, textTransform: "capitalize" }}>{rec}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AssessmentAiReportTab;
