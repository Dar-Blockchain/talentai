import React from "react";
import { Box, Typography } from "@mui/material";

type StatsSummaryCardProps = {
  label: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  valueColor?: string;
  borderColor?: string;
  shadowColor?: string;
  iconBgColor?: string;
};

const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  label, value, subtitle, icon,
  valueColor = "#0D9488",
  borderColor = "#E5E7EB",
  iconBgColor = "#F0FDFA",
}) => (
  <Box sx={{
    flex: 1,
    display: "flex", alignItems: "center", gap: 1.5,
    px: 2, py: 1.75,
    borderRadius: "14px",
    border: `1px solid ${borderColor}`,
    bgcolor: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s",
    "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
  }}>
    <Box sx={{ width: 44, height: 44, borderRadius: "11px", bgcolor: iconBgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: valueColor, lineHeight: 1.1 }}>{value}</Typography>
      <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 500 }}>{subtitle}</Typography>
    </Box>
  </Box>
);

export default StatsSummaryCard;
