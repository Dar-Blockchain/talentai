import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  icon: React.ReactNode;
  label: string;
}

const MetaChip: React.FC<Props> = ({ icon, label }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 0.5,
    bgcolor: "#F9FAFB", border: "1px solid #E5E7EB",
    borderRadius: "8px", px: 1, py: 0.375,
  }}>
    <Box sx={{ color: "#9CA3AF", display: "flex" }}>{icon}</Box>
    <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>{label}</Typography>
  </Box>
);

export default MetaChip;
