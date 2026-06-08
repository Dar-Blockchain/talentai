import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { scoreColor } from "./constants";

interface Props {
  label: string;
  score: number;
  maxScore: number;
  note: string;
}

const BarRow: React.FC<Props> = ({ label, score, maxScore, note }) => {
  const pct   = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const color = scoreColor(pct);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, alignItems: "center" }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{label}</Typography>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color, ml: 2, whiteSpace: "nowrap" }}>
          {score}/{maxScore}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={Math.min(pct, 100)}
        sx={{ height: 7, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
      <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.6, lineHeight: 1.5 }}>{note}</Typography>
    </Box>
  );
};

export default BarRow;
