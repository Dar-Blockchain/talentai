import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
export { TEAL, TEAL_BG, TEAL_BORDER } from "@/modules/company/assessment/constants";

export const ScoreRing: React.FC<{ value: number; color: string; size?: number }> = ({
  value, color, size = 88,
}) => {
  const r      = (size - 14) / 2;
  const circ   = 2 * Math.PI * r;
  const filled = (Math.min(Math.max(value, 0), 100) / 100) * circ;
  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={9} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}55)`, transition: "stroke-dasharray 0.5s ease" }} />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: size > 80 ? "1.25rem" : "1rem", fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {Math.round(value)}
        </Typography>
      </Box>
    </Box>
  );
};

export const Bar: React.FC<{ value: number; color: string; height?: number }> = ({ value, color, height = 7 }) => (
  <LinearProgress variant="determinate" value={Math.min(Math.max(value, 0), 100)}
    sx={{ height, borderRadius: 99, bgcolor: `${color}12`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 99, transition: "transform 0.6s ease" } }} />
);

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.09em", mb: 1.25 }}>
    {children}
  </Typography>
);

export const InfoChip: React.FC<{ icon: React.ReactNode; label: string; iconColor?: string }> = ({ icon, label, iconColor = "#9CA3AF" }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.625, borderRadius: "99px", bgcolor: "#F9FAFB", border: "1px solid #F3F4F6" }}>
    <Box sx={{ color: iconColor, display: "flex", lineHeight: 0 }}>{icon}</Box>
    <Typography sx={{ fontSize: "0.72rem", color: "#4B5563", fontWeight: 500 }}>{label}</Typography>
  </Box>
);

export const BulletCard: React.FC<{
  icon: React.ReactNode; text: string; bg: string; border: string; iconColor: string; textColor: string;
}> = ({ icon, text, bg, border, iconColor, textColor }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, px: 1.5, py: 1.25, borderRadius: "10px", bgcolor: bg, border: `1px solid ${border}` }}>
    <Box sx={{ color: iconColor, display: "flex", flexShrink: 0, mt: "2px" }}>{icon}</Box>
    <Typography sx={{ fontSize: "0.8rem", color: textColor, lineHeight: 1.6 }}>{text}</Typography>
  </Box>
);

export const SectionBlock: React.FC<{
  icon: React.ReactNode; iconBg: string; iconColor: string; title: string; children: React.ReactNode;
}> = ({ icon, iconBg, iconColor, title, children }) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.125, mb: 1.25 }}>
      <Box sx={{ width: 30, height: 30, borderRadius: "10px", bgcolor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Box sx={{ color: iconColor, display: "flex", fontSize: 15 }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{title}</Typography>
    </Box>
    {children}
  </Box>
);
