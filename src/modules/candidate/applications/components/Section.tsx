import React from "react";
import { Box, Typography } from "@mui/material";

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</Typography>
    </Box>
    {children}
  </Box>
);

export default Section;
