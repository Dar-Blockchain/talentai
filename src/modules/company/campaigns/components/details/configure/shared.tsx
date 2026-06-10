import React from "react";
import { Typography } from "@mui/material";

export const fieldSx = {
  "& .MuiInputLabel-root": { fontSize: "13px" },
  "& .MuiOutlinedInput-root": {
    fontSize: "13px",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&.Mui-focused fieldset": { borderColor: "#0D9488" },
  },
} as const;

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#374151", mb: 0.75 }}>
    {children}
  </Typography>
);
