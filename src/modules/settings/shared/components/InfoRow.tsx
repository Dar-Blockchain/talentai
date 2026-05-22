import React from "react";
import { Box, Typography } from "@mui/material";

interface InfoRowProps {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  label: string;
  value: string;
  chip?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, iconBg, iconBorder, label, value, chip }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box sx={{ width: 40, height: 40, borderRadius: "10px", flexShrink: 0, bgcolor: iconBg, border: `1px solid ${iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontFamily: "Poppins", fontSize: "0.78rem", color: "#9CA3AF", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>
        {value}
      </Typography>
    </Box>
    {chip}
  </Box>
);

export default InfoRow;
