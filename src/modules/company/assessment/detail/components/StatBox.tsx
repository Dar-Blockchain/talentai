import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  label: string;
  value: string | number;
  color: string;
}

const StatBox: React.FC<Props> = ({ label, value, color }) => (
  <Box sx={{
    bgcolor: `${color}12`, border: `1px solid ${color}30`,
    borderRadius: 2, p: 1.5, textAlign: "center",
  }}>
    <Typography sx={{ fontSize: "16px", fontWeight: 700, color }}>{value}</Typography>
    <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#6B7280", mt: 0.25 }}>{label}</Typography>
  </Box>
);

export default StatBox;
