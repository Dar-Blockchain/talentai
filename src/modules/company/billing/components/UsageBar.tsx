import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { TEAL } from "../constants";

interface Props {
  label:     string;
  used:      number;
  limit:     number;
  remaining: number;
  pct:       number;
  icon:      React.ReactNode;
}

const UsageBar: React.FC<Props> = ({ label, used, limit, remaining, pct, icon }) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.6 }}>
      <Box sx={{ color: TEAL, display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", flex: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: pct >= 90 ? "#ef4444" : TEAL }}>
        {used} / {limit}
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={pct}
      sx={{ height: 7, borderRadius: 4, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: pct >= 90 ? "#ef4444" : TEAL, borderRadius: 4 } }}
    />
    <Typography sx={{ fontSize: "0.69rem", color: "#9ca3af", mt: 0.4 }}>{remaining} remaining</Typography>
  </Box>
);

export default UsageBar;
