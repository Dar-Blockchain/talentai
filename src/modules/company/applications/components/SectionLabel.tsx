import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  icon: React.ReactNode;
  title: string;
}

const SectionLabel: React.FC<Props> = ({ icon, title }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    {icon}
    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {title}
    </Typography>
  </Box>
);

export default SectionLabel;
