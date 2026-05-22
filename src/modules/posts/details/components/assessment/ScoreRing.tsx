import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  value: number;
  color: string;
  size?: number;
  label?: string;
}

const ScoreRing: React.FC<Props> = ({ value, color, size = 88, label }) => {
  const r      = (size - 14) / 2;
  const circ   = 2 * Math.PI * r;
  const filled = (Math.min(value, 100) / 100) * circ;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={9} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={9}
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: size > 80 ? "1.1rem" : "0.95rem", fontWeight: 800, color, lineHeight: 1 }}>
            {value.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default ScoreRing;
