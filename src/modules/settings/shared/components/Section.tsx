import React from "react";
import { Box, Typography } from "@mui/material";

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", mb: 3 }}>
    <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #F3F4F6" }}>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ fontFamily: "Poppins", fontSize: "0.8rem", color: "#9CA3AF", mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    <Box sx={{ px: 3, py: 3 }}>{children}</Box>
  </Box>
);

export default Section;
