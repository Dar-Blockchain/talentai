import React from "react";
import { Box, Typography, Avatar, Chip, Divider } from "@mui/material";
import { Trophy as EmojiEventsOutlined } from "lucide-react";
import { T, TL, TBG, TBRD, NAVY } from "../utils/constants";

interface StatPillProps {
  label: string;
  value: number | string;
  color: string;
  bg: string;
  border: string;
}

const StatPill: React.FC<StatPillProps> = ({ label, value, color, bg, border }) => (
  <Box sx={{ flex: 1, px: 1.5, py: 1.25, borderRadius: "10px", bgcolor: bg, border: `1px solid ${border}`, textAlign: "center" }}>
    <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 500, mt: 0.25 }}>{label}</Typography>
  </Box>
);

interface ProfileCardProps {
  displayName: string;
  email?: string;
  initial: string;
  avatarUrl?: string;
  targetRole?: string;
  experienceLevel?: string;
  stats: StatPillProps[];
}

const ProfileCard: React.FC<ProfileCardProps> = ({ displayName, email, initial, avatarUrl, targetRole, experienceLevel, stats }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ height: 56, background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)`, position: "relative" }}>
      <Box sx={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", bgcolor: `${TL}30`, border: `1px solid ${TL}40` }} />
    </Box>
    <Box sx={{ px: 2, pb: 2 }}>
      <Box sx={{ mt: -3, mb: 1 }}>
        <Avatar src={avatarUrl} sx={{ width: 52, height: 52, bgcolor: T, fontSize: "1.2rem", fontWeight: 700, border: "2.5px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          {initial}
        </Avatar>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: NAVY, lineHeight: 1.2 }}>{displayName}</Typography>
      {email && <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.25, mb: 1 }}>{email}</Typography>}
      {targetRole && <Chip label={targetRole} size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: TBG, border: `1px solid ${TBRD}`, color: T, fontWeight: 600, mb: 1 }} />}
      {experienceLevel && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <EmojiEventsOutlined size={12} color="#D97706" />
          <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 500 }}>{experienceLevel}</Typography>
        </Box>
      )}
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        {stats.map((stat) => (
          <StatPill key={stat.label} {...stat} />
        ))}
      </Box>
    </Box>
  </Box>
);

export default ProfileCard;
