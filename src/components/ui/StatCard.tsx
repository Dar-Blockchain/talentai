import React from "react";
import { Box, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color?: string;
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
  const hasTrend = trend !== undefined;
  const isPositive = hasTrend && trend >= 0;
  const iconBg = `${color}18`;

  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: "#fff",
        borderRadius: 2.5,
        px: 2,
        py: 1.75,
        border: "1px solid #f3f4f6",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": onClick
          ? {
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              transform: "translateY(-1px)",
            }
          : {},
      }}
    >
      {/* Left section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            "& svg": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>

        {/* Value + Trend + Label */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
          {/* Value + Trend badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>

            {hasTrend && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 999,
                  backgroundColor: isPositive ? "#ECFDF5" : "#FEF2F2",
                }}
              >
                {isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: 14, color: "#10b981" }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 14, color: "#ef4444" }} />
                )}
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: isPositive ? "#10b981" : "#ef4444",
                  }}
                >
                  {isPositive ? "+" : ""}
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Label */}
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StatCard;