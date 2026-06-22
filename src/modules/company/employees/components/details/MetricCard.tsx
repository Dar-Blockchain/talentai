import React, { memo } from "react";
import { Box, Typography } from "@mui/material";

const CARD_SX = {
  p: 2.25, borderRadius: "16px",
  bgcolor: "#fff", border: "1px solid #E8EAED",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
} as const;

interface MetricCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: number | string;
  sub?: string;
}

const MetricCard: React.FC<MetricCardProps> = memo(({ icon, iconColor, label, value, sub }) => (
  <Box sx={CARD_SX}>
    <Box sx={{
      width: 40, height: 40, borderRadius: "11px", mb: 1.75,
      bgcolor: `${iconColor}10`, border: `1px solid ${iconColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: iconColor,
    }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: "1.625rem", fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", mt: 0.5 }}>
      {label}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.25 }}>{sub}</Typography>
    )}
  </Box>
));

MetricCard.displayName = "MetricCard";
export default MetricCard;
