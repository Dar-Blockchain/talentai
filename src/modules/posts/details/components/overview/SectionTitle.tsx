import React from "react";
import { Box, Typography } from "@mui/material";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  icon: React.ReactNode;
  title: string;
}

const SectionTitle: React.FC<Props> = ({ icon, title }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>
      {title}
    </Typography>
  </Box>
);

export default SectionTitle;
