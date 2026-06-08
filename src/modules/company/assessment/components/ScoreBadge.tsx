import React from "react";
import { Box, Typography } from "@mui/material";

const scoreColor = (s: number) => s >= 70 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

interface Props {
  score: number;
}

const ScoreBadge: React.FC<Props> = ({ score }) => {
  const color = scoreColor(score);
  return (
    <Box sx={{
      width: 56, height: 56, borderRadius: "50%",
      border: `3px solid ${color}`,
      bgcolor: `${color}10`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Typography sx={{ fontSize: "16px", fontWeight: 800, color, lineHeight: 1 }}>
        {Math.round(score)}
      </Typography>
      <Typography sx={{ fontSize: "9px", fontWeight: 600, color: "#6B7280", mt: 0.25 }}>
        Score
      </Typography>
    </Box>
  );
};

export default ScoreBadge;
