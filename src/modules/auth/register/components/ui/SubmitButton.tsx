import React from "react";
import { Button, CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { compactSubmitBtnSx } from "../registerFormStyles";

interface Props {
  loading: boolean;
  label: string;
  loadingLabel: string;
  onClick?: () => void;
  type?: "submit" | "button";
  sx?: object;
}

const SubmitButton: React.FC<Props> = ({ loading, label, loadingLabel, onClick, type = "submit", sx }) => (
  <Button
    type={type} fullWidth variant="contained" disabled={loading}
    onClick={onClick}
    endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
    startIcon={loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined}
    sx={{ ...compactSubmitBtnSx, ...sx }}
  >
    {loading ? loadingLabel : label}
  </Button>
);

export default SubmitButton;
