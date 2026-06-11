import React from "react";
import { Box, Typography } from "@mui/material";
import { PostAssessmentData } from "../../types";

interface Props {
  verdict:      PostAssessmentData["verdict"];
  verdictColor: string;
  verdictBg:    string;
  verdictBorder: string;
  verdictLabel: string;
}

const VerdictCard: React.FC<Props> = ({ verdict, verdictColor, verdictBg, verdictBorder, verdictLabel }) => {
  if (!verdict) return null;
  return (
    <Box sx={{ borderRadius: "16px", border: `1.5px solid ${verdictBorder}`, bgcolor: verdictBg, overflow: "hidden" }}>
      <Box sx={{ height: 3, bgcolor: verdictColor }} />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: verdict.reasoning ? 1 : 0 }}>
          <Box sx={{ px: 1.25, py: 0.375, borderRadius: "99px", bgcolor: verdictColor }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>
              {verdictLabel}
            </Typography>
          </Box>
          {verdict.overallScore != null && (
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: verdictColor }}>
              {verdict.overallScore.toFixed(0)} / 100
            </Typography>
          )}
        </Box>
        {verdict.reasoning && (
          <Typography sx={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.75 }}>
            {verdict.reasoning}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default VerdictCard;
