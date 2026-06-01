import React from "react";
import { Box, Typography } from "@mui/material";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

interface Props {
  icon: SvgIconComponent;
  label: string;
  description: string;
  accent: string;
  iconGradient: string;
  shadowColor: string;
  border: string;
  onClick: () => void;
}

const RoleCard: React.FC<Props> = ({ icon: Icon, label, description, accent, iconGradient, shadowColor, border, onClick }) => (
  <Box onClick={onClick} sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 2.25, md: 2.5 }, p: { xs: 2, sm: 2.25, md: 2.5 }, borderRadius: "18px", border: `1.5px solid ${border}`, bgcolor: "#fff", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", "&:hover": { boxShadow: `0 10px 36px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.04)`, transform: "translateY(-3px)", borderColor: accent } }}>
    <Box sx={{ width: { xs: 48, sm: 50, md: 54 }, height: { xs: 48, sm: 50, md: 54 }, borderRadius: "15px", background: iconGradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 18px ${shadowColor}` }}>
      <Icon sx={{ fontSize: { xs: 22, sm: 24, md: 26 }, color: "#fff" }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" }, color: "#0F172A", mb: 0.3, fontFamily: "Poppins", lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Typography sx={{ color: "#6B7280", fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.82rem" }, lineHeight: 1.5, fontFamily: "Poppins", overflowWrap: "break-word" }}>
        {description}
      </Typography>
    </Box>
    <Box sx={{ width: { xs: 28, sm: 30, md: 32 }, height: { xs: 28, sm: 30, md: 32 }, borderRadius: "10px", bgcolor: `${accent}10`, border: `1px solid ${accent}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
      <ArrowForwardOutlined sx={{ fontSize: { xs: 14, md: 16 }, color: accent }} />
    </Box>
  </Box>
);

export default RoleCard;
