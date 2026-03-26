import React, { memo } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Avatar, Chip, LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";

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
    a.interviewData?.finalReport?.scores?.overall ??
    a.interviewData?.finalReport?.coverage?.overall ??
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
  post: {
    _id: string;
    jobDetails?: { title?: string; location?: string; employmentType?: string; experienceLevel?: string };
    skillAnalysis?: {
      requiredSkills?: Array<{ _id?: string; name?: string; percentage?: number; level?: string | number; category?: string }>;
      softSkills?: Array<{ _id?: string; name?: string; percentage?: number; level?: string | number }>;
    };
  };
  candidate: { _id: string; username?: string; email?: string };
  company: { _id: string; username?: string; email?: string };
  interviewData?: {
    finalReport?: {
      summary?: string;
      coverage?: { overall?: number; areas?: Record<string, any> };
      scores?: Record<string, number>;
      recommendations?: string[];
      timestamp?: string;
    };
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
  index?: number;
  onClick: (assessment: InterviewAssessment) => void;
}

const InterviewCard = memo<InterviewCardProps>(({ assessment, index = 0, onClick }) => {
  const router = useRouter();
  const name  = assessment.candidate?.username || assessment.candidate?.email || "Unknown";
  const email = assessment.candidate?.email || "";
  const score = getScore(assessment);
  const sc    = scoreStyle(score);
  const title = assessment.post?.jobDetails?.title || "Untitled Position";
  const candidateId = assessment.candidate?._id;
  const postId = assessment.post?._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{ height: "100%" }}
    >
      <Box
        onClick={() => onClick(assessment)}
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.10)", borderColor: `${sc.color}60`, transform: "translateY(-2px)" },
          transition: "all 0.2s",
        }}
      >
        {/* Header: avatar + name + score badge */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{
              width: 42, height: 42, fontWeight: 800, fontSize: "0.95rem", color: "#fff",
              background: `linear-gradient(${pickGradient(email || name)})`,
              flexShrink: 0,
            }}>
              {name[0]?.toUpperCase() || "?"}
            </Avatar>
            <Box>
              <Typography
                // onClick={(e) => { if (candidateId) { e.stopPropagation(); router.push(`/company/candidates/${candidateId}`); } }}
                sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3, ...(candidateId && { cursor: "pointer", "&:hover": { color: "#0D9488", textDecoration: "underline" } }) }}
              >
                {name}
              </Typography>
              {email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.2 }}>
                  <EmailOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: "11px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                    {email}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* <Box sx={{ px: 1.25, py: 0.5, borderRadius: "8px", bgcolor: sc.bg, border: `1px solid ${sc.color}30`, flexShrink: 0 }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 800, color: sc.color, lineHeight: 1 }}>
              {score.toFixed(0)}%
            </Typography>
          </Box> */}
        </Box>

        {/* Score bar */}
        <ScoreBar value={score} color={sc.color} />

        {/* Job title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <WorkOutlined sx={{ fontSize: 15, color: "#6B7280" }} />
          </Box>
          <Typography
            onClick={(e) => { if (postId) { e.stopPropagation(); router.push(`/company/posts/${postId}`); } }}
            sx={{ fontSize: "13px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...(postId && { cursor: "pointer", "&:hover": { color: "#0D9488", textDecoration: "underline" } }) }}
          >
            {title}
          </Typography>
        </Box>

        {/* Footer: verdict chip + date */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
          <Chip
            label={sc.label}
            size="small"
            sx={{
              fontWeight: 700, fontSize: "10px", height: 20,
              color: sc.color, bgcolor: sc.bg,
              border: `1px solid ${sc.color}25`, borderRadius: "6px",
              "& .MuiChip-label": { px: 1 },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarTodayOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
              {fmtDate(assessment.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
});

export default InterviewCard;
