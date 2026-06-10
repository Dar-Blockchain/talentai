import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const FeatureRow: React.FC<Props> = ({ icon, label, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{
      width: 24, height: 24, borderRadius: "6px", flexShrink: 0,
      bgcolor: `${color}12`, border: `1px solid ${color}22`,
      display: "flex", alignItems: "center", justifyContent: "center", color,
    }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>
      {label}
    </Typography>
  </Box>
);

export default FeatureRow;
