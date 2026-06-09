import React from "react";
import { Box, Typography } from "@mui/material";
import { scoreStyle } from "@/modules/company/assessment/detail/components/constants";
import { ScoreRing } from "../assessmentAtoms";

interface Props {
  overallScore:  number;
  verdictColor:  string;
  verdictBg:     string;
  verdictBorder: string;
  verdictLabel:  string;
}

const ScoreVerdictBadge: React.FC<Props> = ({ overallScore, verdictColor, verdictBg, verdictBorder, verdictLabel }) => {
  const sc = scoreStyle(overallScore);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0 }}>
      <ScoreRing value={overallScore} color={sc.color} size={84} />
      <Box sx={{ px: 1.25, py: 0.375, borderRadius: "99px", bgcolor: verdictBg, border: `1px solid ${verdictBorder}` }}>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: verdictColor, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
          {verdictLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default ScoreVerdictBadge;
