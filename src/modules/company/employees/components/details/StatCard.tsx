import React, { memo } from "react";
import { Box, Typography } from "@mui/material";

const CARD_SX = {
  display: "flex", alignItems: "center", gap: 1.5,
  p: 1.75, borderRadius: "14px",
  bgcolor: "#fff", border: "1px solid #E8EAED",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
} as const;

const LABEL_SX = {
  fontSize: "0.7rem", color: "#94A3B8", fontWeight: 500,
  textTransform: "uppercase" as const, letterSpacing: "0.05em",
} as const;

const VALUE_SX = {
  fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
} as const;

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = memo(({ icon, iconColor, label, value }) => (
  <Box sx={CARD_SX}>
    <Box sx={{
      width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
      bgcolor: `${iconColor}10`, border: `1px solid ${iconColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: iconColor,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={LABEL_SX}>{label}</Typography>
      <Typography sx={VALUE_SX}>{value}</Typography>
    </Box>
  </Box>
));

StatCard.displayName = "StatCard";
export default StatCard;
