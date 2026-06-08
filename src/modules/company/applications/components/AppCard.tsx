import React from "react";
import { Box } from "@mui/material";

const AppCard: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", ...sx }}>
    {children}
  </Box>
);

export default AppCard;
