import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { fmtDate } from "@/modules/company/assessment/detail/components/constants";
import { TEAL, TEAL_BG, TEAL_BORDER } from "../assessmentAtoms";

interface Props {
  index:      number;
  targetArea: string | undefined;
  timestamp:  string | undefined;
}

const TurnHeader: React.FC<Props> = ({ index, targetArea, timestamp }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
    <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{index + 1}</Typography>
    </Box>
    {targetArea && (
      <Chip label={targetArea.replace(/_/g, " ")} size="small"
        sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, textTransform: "capitalize" }} />
    )}
    {timestamp && (
      <Typography sx={{ fontSize: "0.65rem", color: "#D1D5DB", ml: "auto", fontWeight: 500 }}>{fmtDate(timestamp)}</Typography>
    )}
  </Box>
);

export default TurnHeader;
