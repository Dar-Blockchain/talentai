import React from "react";
import { Box, Typography } from "@mui/material";

type StatsSummaryCardProps = {
  label: string;              // "Total"
  value: number | string;     // 10
  subtitle: string;           // "Applications"
  icon: React.ReactNode;      // <DocumentIcon />
  valueColor?: string;        // number color
  borderColor?: string;
  shadowColor?: string;
  iconBgColor?: string;
};

const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  valueColor = "rgba(11, 82, 198, 1)",
  borderColor = "rgba(11, 82, 198, 0.18)",
  shadowColor = "rgba(0, 0, 0, 0.06)",
  iconBgColor = "rgba(11, 82, 198, 0.06)",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        borderRadius: "12px",
        border: `1px solid ${borderColor}`,
        boxShadow: `0px 0px 4.2px 0px ${shadowColor}`,
      }}
    >
      {/* Icon box */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: iconBgColor,
          width: 64,
          height: 64,
          borderRadius: "5px",
        }}
      >
        {icon}
      </Box>

      {/* Text */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: "11px",
            lineHeight: "18.78px",
            letterSpacing: "0px",
            color: "rgba(149, 157, 168, 1)",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "32px",
            lineHeight: "18.78px",
            letterSpacing: "0px",
            verticalAlign: "middle",
            color: valueColor,
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontWeight: 400,
            fontSize: "15px",
            lineHeight: "18.78px",
            letterSpacing: "0px",
            color: "rgba(100, 113, 131, 1)",
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatsSummaryCard;
