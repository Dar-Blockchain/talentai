import React from "react";
import { Box, Typography, Avatar, Chip, LinearProgress } from "@mui/material";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7",
  "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8",
  "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
];

function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

export function getScore(a: any): number {
  return (
    a.overallScore ??
    a.interviewData?.finalReport?.coverage?.overall ??
    a.interviewData?.finalReport?.scores?.overall ??
    0
  );
}

export function scoreStyle(s: number): { color: string; bg: string; label: string } {
  if (s >= 70) return { color: "#10B981", bg: "#F0FDF4", label: "Excellent" };
  if (s >= 50) return { color: "#D97706", bg: "#FFFBEB", label: "Satisfactory" };
  return { color: "#EF4444", bg: "#FEF2F2", label: "Needs Work" };
}

export function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch { return "—"; }
}

export function fmtDuration(ms?: number) {
  if (!ms) return "—";
  const m = Math.floor(ms / 60000);
  return m > 0 ? `${m}m` : `${Math.floor(ms / 1000)}s`;
}

export const ScoreBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <LinearProgress
      variant="determinate"
      value={Math.min(value, 100)}
      sx={{
        flex: 1, height: 6, borderRadius: 3,
        bgcolor: `${color}20`,
        "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
      }}
    />
    <Typography sx={{ fontSize: "12px", fontWeight: 700, color, minWidth: 34 }}>
      {value.toFixed(0)}%
    </Typography>
  </Box>
);

export interface InterviewAssessment {
  _id: string;
  post: { _id: string; jobDetails?: { title?: string; location?: string; employmentType?: string } };
  candidate: { _id: string; username?: string; email?: string };
  company: { _id: string; username?: string; email?: string };
  interviewData?: {
    finalReport?: { coverage?: { overall?: number; areas?: Record<string, any> }; scores?: { overall?: number } };
    analytics?: { duration?: number; messageCount?: number; coveragePercentage?: number };
    interviewType?: string;
  };
  overallScore?: number;
  status?: string;
  stage?: string;
  createdAt: string;
}

interface InterviewCardProps {
  assessment: InterviewAssessment;
  onClick: (assessment: InterviewAssessment) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ assessment, onClick }) => {
  const name     = assessment.candidate?.username || assessment.candidate?.email || "Unknown";
  const email    = assessment.candidate?.email || "";
  const letter   = name[0]?.toUpperCase() || "?";
  const score    = getScore(assessment);
  const sc       = scoreStyle(score);
  const title    = assessment.post?.jobDetails?.title || "Untitled Position";
  const duration = fmtDuration(assessment.interviewData?.analytics?.duration);
  const msgs     = assessment.interviewData?.analytics?.messageCount ?? "—";

  return (
    <Box
      onClick={() => onClick(assessment)}
      sx={{
        bgcolor: "#fff", borderRadius: "16px",
        border: "1px solid #F1F5F9",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        overflow: "hidden", cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(131,16,255,0.10)", borderColor: "#E0D7FF" },
      }}
    >
      {/* top colour strip */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${sc.color}, #8310FF)` }} />

      <Box sx={{ p: 2.5 }}>
        {/* avatar + score badge */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Avatar sx={{
            width: 48, height: 48, fontWeight: 800, fontSize: "1.1rem", color: "#fff",
            background: `linear-gradient(${pickGradient(email || name)})`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "2px solid #fff",
          }}>
            {letter}
          </Avatar>
          <Box sx={{ px: 1.5, py: 0.5, borderRadius: "8px", bgcolor: sc.bg, border: `1px solid ${sc.color}30` }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 800, color: sc.color }}>
              {score.toFixed(0)}%
            </Typography>
          </Box>
        </Box>

        {/* name + email */}
        <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827", mb: 0.25, lineHeight: 1.3 }}>
          {name}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mb: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email}
        </Typography>

        {/* score bar */}
        <ScoreBar value={score} color={sc.color} />

        <Box sx={{ height: "1px", bgcolor: "#F1F5F9", my: 2 }} />

        {/* job title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
          <WorkOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
          <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </Typography>
        </Box>

        {/* duration + messages */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{duration}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ChatBubbleOutlineOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{msgs} msgs</Typography>
          </Box>
        </Box>

        {/* status chip + date */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Chip label={sc.label} size="small" sx={{
            fontWeight: 700, fontSize: "11px", height: 22,
            color: sc.color, bgcolor: sc.bg,
            border: `1px solid ${sc.color}25`, borderRadius: "6px",
            "& .MuiChip-label": { px: 1 },
          }} />
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
            {fmtDate(assessment.createdAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default InterviewCard;
