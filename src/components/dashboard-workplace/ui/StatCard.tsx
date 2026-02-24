/**
 * StatCard — reusable metric/statistic card for the workplace dashboard.
 *
 * Usage:
 *   <StatCard
 *     icon={<PeopleOutlined />}
 *     label="Total Employees"
 *     value={142}
 *     trend={+5}          // optional — positive = up, negative = down
 *     trendLabel="vs last month"
 *     color="#0D9488"     // optional — defaults to teal
 *   />
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export interface StatCardProps {
  /** MUI Icon element rendered on the card */
  icon: React.ReactNode;
  /** Short label shown below the value */
  label: string;
  /** Main metric value — number or pre-formatted string */
  value: string | number;
  /** Numeric trend (+N or -N). Omit to hide trend row. */
  trend?: number;
  /** Text shown next to the trend value */
  trendLabel?: string;
  /** Accent colour for the icon background + icon itself */
  color?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendLabel = "vs last month",
  color = "#0D9488",
  onClick,
}) => {
  const isPositive = trend !== undefined && trend >= 0;
  const hasTrend = trend !== undefined;

  // Derive a soft background from the accent colour (10 % opacity fallback)
  const iconBg = `${color}18`;

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: "#fff",
        borderRadius: 3,
        p: 3,
        border: "1px solid #f3f4f6",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, transform 0.15s",
        "&:hover": onClick
          ? { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", transform: "translateY(-1px)" }
          : {},
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Icon row */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          "& svg": { fontSize: 24 },
        }}
      >
        {icon}
      </Box>

      {/* Value */}
      <Typography
        sx={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#111827",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>

      {/* Label */}
      <Typography
        sx={{
          fontSize: "0.875rem",
          color: "#6b7280",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>

      {/* Trend */}
      {hasTrend && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {isPositive ? (
            <TrendingUpIcon sx={{ fontSize: 16, color: "#10b981" }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 16, color: "#ef4444" }} />
          )}
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: isPositive ? "#10b981" : "#ef4444",
            }}
          >
            {isPositive ? "+" : ""}
            {trend}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
            {trendLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StatCard;
