import React, { useCallback } from "react";
import { Box, Typography, LinearProgress, Tooltip } from "@mui/material";
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";

interface SkillCardProps {
  type: "technical" | "soft";
  skill: any;
  last: boolean;
}

const LEVELS: Record<number, { label: string; color: string }> = {
  1: { label: "Entry",  color: "#64748B" },
  2: { label: "Junior", color: "#D97706" },
  3: { label: "Mid",    color: "#2563EB" },
  4: { label: "Senior", color: "#7C3AED" },
  5: { label: "Expert", color: "#059669" },
};

const getLevel = (n: number) =>
  LEVELS[n] ?? { label: "New", color: "#94A3B8" };

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const SkillCard: React.FC<SkillCardProps> = ({ skill, type, last }) => {
  const router    = useRouter();
  const profile   = useSelector((state: RootState) => state.user.connectedUser.profile);
  const score     = skill.ScoreTest ?? 0;
  const lvl       = getLevel(skill.Levelconfirmed);
  const quotaFull = (profile?.quota ?? 0) >= 5;
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

  const Icon = type === "technical" ? CodeOutlined : PeopleOutlined;
  const accentColor = type === "technical" ? "#2563EB" : "#D97706";

  return (
    <Tooltip title={quotaFull ? "Monthly limit reached (5/5)" : ""} arrow placement="top">
      <Box
        onClick={!quotaFull ? handleTest : undefined}
        sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          px: 2.5, py: 1.5,
          borderBottom: last ? "none" : "1px solid #F1F5F9",
          cursor: quotaFull ? "not-allowed" : "pointer",
          transition: "background 0.12s",
          "&:hover": !quotaFull ? { bgcolor: "#F8FAFC" } : {},
        }}
      >
        {/* Icon */}
        <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: `${accentColor}0F`, border: `1px solid ${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 16, color: accentColor }} />
        </Box>

        {/* Name + meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {skill.name}
            </Typography>
            {type === "soft" && skill.category && (
              <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>· {skill.category}</Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {score > 0 ? (
              <>
                <LinearProgress variant="determinate" value={Math.min(score, 100)}
                  sx={{ flex: 1, height: 3, borderRadius: "99px", bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: getScoreColor(score) } }} />
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: getScoreColor(score), flexShrink: 0 }}>{score}%</Typography>
              </>
            ) : (
              <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>Not tested yet</Typography>
            )}
          </Box>
        </Box>

        {/* Right: level + time */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.3, flexShrink: 0 }}>
          <Box sx={{ px: 0.9, py: 0.2, borderRadius: "20px", bgcolor: `${lvl.color}12`, border: `1px solid ${lvl.color}25` }}>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: lvl.color }}>{lvl.label}</Typography>
          </Box>
          {updatedAt && (
            <Typography sx={{ fontSize: "0.6rem", color: "#CBD5E1" }}>{updatedAt}</Typography>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default SkillCard;
