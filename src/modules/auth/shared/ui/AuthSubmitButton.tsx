import React from "react";
import { Button, CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ACCENT } from "@/modules/auth/shared/types";

interface AuthSubmitButtonProps {
  loading:    boolean;
  label:      string;
  loadingLabel?: string;
  disabled?:  boolean;
  type?:      "submit" | "button";
  onClick?:   () => void;
}

const BTN_SX = {
  mt: { xs: 1.5, sm: 1.75 },
  height: { xs: 44, sm: 46 },
  borderRadius: "10px",
  textTransform: "none",
  fontFamily: "Poppins",
  fontWeight: 600,
  fontSize: { xs: "0.88rem", sm: "0.92rem" },
  bgcolor: ACCENT,
  color: "#fff",
  boxShadow: "none",
  transition: "background-color 0.15s",
  "&:hover":         { bgcolor: "#0F766E", boxShadow: "none" },
  "&:active":        { bgcolor: "#0B6563" },
  "&.Mui-disabled":  { bgcolor: "#F3F4F6", color: "#9CA3AF", boxShadow: "none" },
} as const;

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  loading, label, loadingLabel, disabled, type = "submit", onClick,
}) => (
  <Button
    type={type}
    fullWidth
    variant="contained"
    disabled={disabled}
    onClick={onClick}
    endIcon={!loading   && <ArrowForwardIcon sx={{ fontSize: 15 }} />}
    startIcon={loading  && <CircularProgress size={14} sx={{ color: "#fff" }} />}
    sx={{ ...BTN_SX, ...(loading && { pointerEvents: "none", opacity: 0.85 }) }}
  >
    {loading && loadingLabel ? loadingLabel : label}
  </Button>
);
