import React, { useCallback } from "react";
import { Box, Typography, LinearProgress, Tooltip, Button } from "@mui/material";
import dayjs from "@/lib/dayjs";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import FlashOnOutlined from "@mui/icons-material/FlashOnOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";

interface SkillCardProps {
  type: "technical" | "soft";
  skill: any;
  last: boolean;
}

const LEVELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Entry",  color: "#64748B", bg: "#F1F5F9" },
  2: { label: "Junior", color: "#D97706", bg: "#FFFBEB" },
  3: { label: "Mid",    color: "#2563EB", bg: "#EFF6FF" },
  4: { label: "Senior", color: "#7C3AED", bg: "#F5F3FF" },
  5: { label: "Expert", color: "#059669", bg: "#F0FDF4" },
};

const getLevel = (n: number) => LEVELS[n] ?? { label: "New", color: "#94A3B8", bg: "#F8FAFC" };

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const SkillCard: React.FC<SkillCardProps> = ({ skill, type }) => {
  const router    = useRouter();
  const profile   = useSelector((state: RootState) => state.user.connectedUser.profile);
  const score     = skill.ScoreTest ?? 0;
  const lvl       = getLevel(skill.Levelconfirmed);
  const quotaFull = (profile?.quota ?? 0) >= 5;
  const timeAgo   = skill?.updatedAt ? dayjs(skill.updatedAt).fromNow() : null;

  const isTech      = type === "technical";
  const accentColor = isTech ? "#2563EB" : "#D97706";
  const accentBg    = isTech ? "#EFF6FF" : "#FFFBEB";
  const accentBd    = isTech ? "#BFDBFE" : "#FDE68A";
  const Icon        = isTech ? CodeOutlined : PeopleOutlined;

  const handleTest = useCallback(() => {
    if (quotaFull) return;
    if (isTech) {
      router.push(`/interview/hr/?type=technical&skill=${encodeURIComponent(skill.name)}&proficiency=${skill.proficiencyLevel || 1}`);
    } else {
      const map: Record<string, number> = { "Entry Level": 1, Junior: 2, "Mid Level": 3, Senior: 4, Expert: 5 };
      router.push(`/interview/hr/?type=soft&skill=${encodeURIComponent(skill.name)}&category=${encodeURIComponent(skill.category)}&proficiency=${map[skill.experienceLevel] || 1}`);
    }
  }, [router, skill, type, quotaFull, isTech]);

  return (
    <Box sx={{
      bgcolor: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: "14px",
      p: 1.75,
      display: "flex",
      flexDirection: "column",
      gap: 1.25,
      transition: "all 0.18s",
      cursor: quotaFull ? "not-allowed" : "default",
      "&:hover": !quotaFull ? {
        borderColor: accentColor,
        boxShadow: `0 4px 16px ${accentColor}18`,
        transform: "translateY(-1px)",
      } : { opacity: 0.75 },
    }}>

      {/* Top row: icon + name + level badge */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
          bgcolor: accentBg, border: `1px solid ${accentBd}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon sx={{ fontSize: 17, color: accentColor }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: "0.88rem", fontWeight: 700, color: "#0F172A",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3,
          }}>
            {skill.name}
          </Typography>
          {type === "soft" && skill.category && (
            <Typography sx={{ fontSize: "0.63rem", color: "#94A3B8", mt: 0.15 }}>{skill.category}</Typography>
          )}
        </Box>

        <Box sx={{ px: 0.85, py: 0.25, borderRadius: "20px", bgcolor: lvl.bg, border: `1px solid ${lvl.color}30`, flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: lvl.color }}>{lvl.label}</Typography>
        </Box>
      </Box>

      {/* Score bar */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8", fontWeight: 500 }}>
            {score > 0 ? "Score" : "Not tested yet"}
          </Typography>
          {score > 0 && (
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: getScoreColor(score) }}>
              {score}%
            </Typography>
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(score, 100)}
          sx={{
            height: 5, borderRadius: "99px",
            bgcolor: "#F1F5F9",
            "& .MuiLinearProgress-bar": {
              borderRadius: "99px",
              bgcolor: score > 0 ? getScoreColor(score) : "#E2E8F0",
            },
          }}
        />
      </Box>

      {/* Bottom row: time + test button */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.25 }}>
        <Typography sx={{ fontSize: "0.6rem", color: "#CBD5E1" }}>
          {timeAgo ?? "Just added"}
        </Typography>

        <Tooltip title={quotaFull ? "Monthly limit reached (5/5)" : ""} arrow placement="top">
          <span>
            <Button
              size="small"
              onClick={handleTest}
              disabled={quotaFull}
              startIcon={quotaFull
                ? <LockOutlined sx={{ fontSize: "12px !important" }} />
                : <FlashOnOutlined sx={{ fontSize: "12px !important" }} />}
              sx={{
                textTransform: "none", fontWeight: 700, fontSize: "0.68rem",
                color: quotaFull ? "#94A3B8" : accentColor,
                bgcolor: quotaFull ? "#F8FAFC" : accentBg,
                border: `1px solid ${quotaFull ? "#E2E8F0" : accentBd}`,
                borderRadius: "8px", px: 1.25, py: 0.35,
                minWidth: 0, boxShadow: "none",
                "&:hover": { bgcolor: quotaFull ? "#F8FAFC" : `${accentColor}20` },
                "&.Mui-disabled": { color: "#94A3B8", bgcolor: "#F8FAFC" },
              }}
            >
              {quotaFull ? "Locked" : score > 0 ? "Retest" : "Test"}
            </Button>
          </span>
        </Tooltip>
      </Box>

    </Box>
  );
};

export default SkillCard;
