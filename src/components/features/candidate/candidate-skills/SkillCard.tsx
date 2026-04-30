import React, { useCallback } from "react";
import { Box, Typography, LinearProgress, Tooltip } from "@mui/material";
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface SkillCardProps {
  type: "technical" | "soft";
  skill: any;
}

const LEVELS: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: "Entry",   color: "#64748B", bg: "#F8FAFC", border: "#CBD5E1" },
  2: { label: "Junior",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  3: { label: "Mid",     color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  4: { label: "Senior",  color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  5: { label: "Expert",  color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
};

const getLevel = (n: number) =>
  LEVELS[n] ?? { label: "New", color: "#9CA3AF", bg: "#F9FAFB", border: "#E5E7EB" };

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const SkillCard: React.FC<SkillCardProps> = ({ skill, type }) => {
  const router     = useRouter();
  const profile    = useSelector((state: RootState) => state.user.connectedUser.profile);
  const score      = skill.ScoreTest ?? 0;
  const lvl        = getLevel(skill.Levelconfirmed);
  const quotaFull  = (profile?.quota ?? 0) >= 5;
  const scoreColor = score > 0 ? getScoreColor(score) : "#E5E7EB";

  const updatedAt = skill?.updatedAt
    ? formatDistanceToNowStrict(new Date(skill.updatedAt), { addSuffix: true })
    : null;

  const handleTest = useCallback(() => {
    if (type === "technical") {
      router.push(`/interview/hr/?type=technical&skill=${encodeURIComponent(skill.name)}&proficiency=${skill.proficiencyLevel || 1}`);
    } else {
      const map: Record<string, number> = { "Entry Level": 1, Junior: 2, "Mid Level": 3, Senior: 4, Expert: 5 };
      router.push(`/interview/hr/?type=soft&skill=${encodeURIComponent(skill.name)}&category=${encodeURIComponent(skill.category)}&proficiency=${map[skill.experienceLevel] || 1}`);
    }
  }, [router, skill, type]);

  return (
    <Tooltip
      title={quotaFull ? "Monthly test limit reached (5/5). Resets next month." : ""}
      arrow
      placement="top"
    >
      <Box
        onClick={!quotaFull ? handleTest : undefined}
        sx={{
          borderRadius: "14px",
          border: `1.5px solid ${lvl.border}`,
          bgcolor: lvl.bg,
          p: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          cursor: quotaFull ? "not-allowed" : "pointer",
          transition: "all 0.18s ease",
          position: "relative",
          overflow: "hidden",
          "&:hover": !quotaFull ? {
            borderColor: lvl.color,
            boxShadow: `0 4px 20px ${lvl.color}22`,
            transform: "translateY(-2px)",
            bgcolor: "#fff",
          } : {},
        }}
      >
        {/* Subtle corner accent */}
        <Box sx={{
          position: "absolute", top: 0, right: 0,
          width: 40, height: 40,
          background: `radial-gradient(circle at top right, ${lvl.color}18, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Top row: name + level dot */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography sx={{
            fontWeight: 700, fontSize: "0.82rem", color: "#111827",
            flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {skill.name}
          </Typography>
          <Box sx={{
            px: "7px", py: "2px", borderRadius: "20px",
            bgcolor: "#fff", border: `1px solid ${lvl.border}`,
            flexShrink: 0,
          }}>
            <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: lvl.color, whiteSpace: "nowrap" }}>
              {lvl.label}
            </Typography>
          </Box>
        </Box>

        {/* Score row + bar */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "4px" }}>
            <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF", fontWeight: 500 }}>
              {score > 0 ? "Test score" : "Not tested"}
            </Typography>
            {score > 0 && (
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 900, color: scoreColor }}>
                {score}%
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(Math.max(score, 0), 100)}
            sx={{
              height: 4, borderRadius: "99px", bgcolor: `${lvl.color}18`,
              "& .MuiLinearProgress-bar": {
                borderRadius: "99px",
                bgcolor: score > 0 ? scoreColor : "transparent",
              },
            }}
          />
        </Box>

        {/* Bottom: time + soft category */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "0.58rem", color: "#9CA3AF" }}>
            {updatedAt ?? "Never tested"}
          </Typography>
          {type === "soft" && skill.category && (
            <Typography sx={{ fontSize: "0.58rem", fontWeight: 600, color: lvl.color }}>
              {skill.category}
            </Typography>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default SkillCard;
