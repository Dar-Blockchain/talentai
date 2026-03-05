/**
 * ProgressRing — SVG circular progress indicator with a centred label.
 *
 * Usage:
 *   <ProgressRing value={78} size={80} color="#0D9488" label="78%" />
 *   <ProgressRing value={score} size={60} strokeWidth={6} label={`${score}`} sublabel="/ 100" />
 */

import React from "react";
import { Box, Typography } from "@mui/material";

export interface ProgressRingProps {
  /** 0–100 */
  value: number;
  /** Diameter in pixels (default 80) */
  size?: number;
  /** Stroke width in pixels (default 7) */
  strokeWidth?: number;
  /** Arc colour (default teal) */
  color?: string;
  /** Track colour (default light grey) */
  trackColor?: string;
  /** Text shown in the centre */
  label?: React.ReactNode;
  /** Smaller text below the label */
  sublabel?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 80,
  strokeWidth = 7,
  color = "#0D9488",
  trackColor = "#e5e7eb",
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>

      {/* Centre content */}
      <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {label !== undefined && (
          <Typography
            sx={{
              fontSize: size < 64 ? "0.75rem" : "0.9375rem",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1,
            }}
          >
            {label}
          </Typography>
        )}
        {sublabel && (
          <Typography
            sx={{
              fontSize: "0.625rem",
              color: "#9ca3af",
              lineHeight: 1.2,
              mt: 0.25,
            }}
          >
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProgressRing;
