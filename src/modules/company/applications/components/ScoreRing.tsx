import React from "react";
import { Box, Typography } from "@mui/material";
import { scoreColor } from "./constants";

interface Props {
  value: number;
  size?: number;
}

const ScoreRing: React.FC<Props> = ({ value, size = 80 }) => {
  const color = scoreColor(value);
  const r     = (size - 14) / 2;
  const circ  = 2 * Math.PI * r;
  const filled = (Math.min(value, 100) / 100) * circ;

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: size >= 88 ? "1.2rem" : "0.95rem", fontWeight: 900, color, lineHeight: 1 }}>
          {value}%
        </Typography>
      </Box>
    </Box>
  );
};

export default ScoreRing;
