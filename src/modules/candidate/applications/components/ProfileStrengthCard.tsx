import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { TrendingUp as TrendingUpOutlined, CheckCircle2 as CheckCircleOutlined, Circle as RadioButtonUncheckedOutlined } from "lucide-react";
import { NAVY } from "../utils/constants";

interface ChecklistItem {
  label: string;
  done: boolean;
}

interface ProfileStrengthCardProps {
  title: string;
  checklist: ChecklistItem[];
}

const ProfileStrengthCard: React.FC<ProfileStrengthCardProps> = ({ title, checklist }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <TrendingUpOutlined size={16} color="#7C3AED" />
      <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: NAVY }}>{title}</Typography>
    </Box>
    <LinearProgress variant="determinate"
      value={Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)}
      sx={{ height: 5, borderRadius: "99px", bgcolor: "#F3F4F6", mb: 1.5, "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: "#7C3AED" } }} />
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {checklist.map((item, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {item.done
            ? <CheckCircleOutlined size={14} color="#059669" />
            : <RadioButtonUncheckedOutlined size={14} color="#D1D5DB" />}
          <Typography sx={{ fontSize: "0.72rem", color: item.done ? "#374151" : "#9CA3AF", fontWeight: item.done ? 500 : 400 }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

export default ProfileStrengthCard;
