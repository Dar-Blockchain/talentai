import React from "react";
import { Typography } from "@mui/material";

const FieldLabel = ({ text }: { text: string }) => (
  <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.75 }}>
    {text}
  </Typography>
);

export default FieldLabel;
