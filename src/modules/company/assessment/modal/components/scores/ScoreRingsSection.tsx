import React from "react";
import { Box, Typography } from "@mui/material";
import { scoreStyle } from "@/modules/company/assessment/detail/components/constants";
import { PostAssessmentData } from "../../types";
import { ScoreRing } from "../assessmentAtoms";

interface Props {
  overallScore:       number;
  analytics:          PostAssessmentData["analytics"] | undefined;
  scoreOverallLabel:  string;
  scoreCoverageLabel: string;
}

const ScoreRingsSection: React.FC<Props> = ({ overallScore, analytics, scoreOverallLabel, scoreCoverageLabel }) => {
  const sc = scoreStyle(overallScore);
  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", py: 2.5, borderRadius: "16px", border: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
        <ScoreRing value={overallScore} color={sc.color} size={92} />
        <Typography sx={{ mt: 1.25, fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {scoreOverallLabel}
        </Typography>
      </Box>
      {analytics?.coveragePercentage !== undefined && (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", py: 2.5, borderRadius: "16px", border: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
          <ScoreRing value={analytics.coveragePercentage} color="#0891B2" size={92} />
          <Typography sx={{ mt: 1.25, fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {scoreCoverageLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ScoreRingsSection;
