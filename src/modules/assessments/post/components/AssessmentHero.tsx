import React from "react";
import { Avatar, Box, Chip, Typography } from "@mui/material";
import AccessTimeOutlined        from "@mui/icons-material/AccessTimeOutlined";
import CalendarTodayOutlined     from "@mui/icons-material/CalendarTodayOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import HourglassEmptyOutlined    from "@mui/icons-material/HourglassEmptyOutlined";
import TrendingUpOutlined        from "@mui/icons-material/TrendingUpOutlined";
import VerifiedOutlined          from "@mui/icons-material/VerifiedOutlined";
import VolumeOffOutlined         from "@mui/icons-material/VolumeOffOutlined";
import WorkOutlined              from "@mui/icons-material/WorkOutlined";
import { fmtDate, fmtDuration, scoreStyle } from "@/components/features/company/interviews/list/InterviewCard";
import { PostAssessmentData } from "../types";
import { InfoChip, ScoreRing, TEAL, TEAL_BG, TEAL_BORDER } from "./assessmentAtoms";

interface Props {
  g1: string;
  g2: string;
  letter: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bgColor: string;
  assessment: PostAssessmentData;
  overallScore: number;
  verdictColor: string;
  verdictBg: string;
  verdictBorder: string;
  verdictLabel: string;
}

function fmtInterviewType(raw: string | null): string {
  if (!raw) return "";
  return raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const AssessmentHero: React.FC<Props> = ({
  g1, g2, letter, name, email, avatarUrl, bgColor,
  assessment, overallScore, verdictColor, verdictBg, verdictBorder, verdictLabel,
}) => {
  const sc            = scoreStyle(overallScore);
  const analytics     = assessment.analytics;
  const recruiterReview = assessment.recruiterReview;

  return (
    <Box>
      {/* Gradient accent bar */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

      {/* Hero body */}
      <Box sx={{ px: 3.5, pt: 3, pb: 2.5, display: "flex", alignItems: "center", gap: 3 }}>

        {/* Avatar */}
        <Box sx={{ flexShrink: 0 }}>
          <Box sx={{ p: "2.5px", borderRadius: "50%", background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
            <Avatar src={avatarUrl} sx={{ width: 60, height: 60, fontWeight: 800, fontSize: "1.4rem", bgcolor: bgColor, color: g1 }}>
              {letter}
            </Avatar>
          </Box>
        </Box>

        {/* Candidate info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", lineHeight: 1.25, mb: 0.3 }}>
            {name}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#6B7280", mb: 1.25 }}>
            {email || "—"}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.625 }}>
            {assessment.jobTitle && (
              <Chip label={assessment.jobTitle} size="small" icon={<WorkOutlined style={{ fontSize: 11 }} />}
                sx={{ bgcolor: TEAL_BG, color: TEAL, fontWeight: 600, fontSize: "0.7rem", height: 22, border: `1px solid ${TEAL_BORDER}`,
                  "& .MuiChip-icon": { color: `${TEAL} !important` } }} />
            )}
            {assessment.interviewType && (
              <Chip label={fmtInterviewType(assessment.interviewType)} size="small"
                sx={{ bgcolor: "#F5F3FF", color: "#6D28D9", fontWeight: 600, fontSize: "0.7rem", height: 22, border: "1px solid #DDD6FE" }} />
            )}
            {assessment.createdAt && (
              <Chip label={fmtDate(assessment.createdAt)} size="small" icon={<CalendarTodayOutlined style={{ fontSize: 10 }} />}
                sx={{ bgcolor: "#F9FAFB", color: "#6B7280", fontWeight: 500, fontSize: "0.7rem", height: 22, border: "1px solid #F3F4F6" }} />
            )}
          </Box>
        </Box>

        {/* Score ring + verdict */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <ScoreRing value={overallScore} color={sc.color} size={84} />
          <Box sx={{ px: 1.25, py: 0.375, borderRadius: "99px", bgcolor: verdictBg, border: `1px solid ${verdictBorder}` }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: verdictColor, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
              {verdictLabel}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Analytics strip */}
      {analytics && (
        <Box sx={{ px: 3.5, pb: 2.5, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {analytics.duration !== undefined && (
            <InfoChip icon={<AccessTimeOutlined sx={{ fontSize: 12 }} />} label={fmtDuration(analytics.duration)} />
          )}
          {analytics.messageCount !== undefined && (
            <InfoChip icon={<ChatBubbleOutlineOutlined sx={{ fontSize: 12 }} />} label={`${analytics.messageCount} exchanges`} />
          )}
          {analytics.completedAreas !== undefined && analytics.totalAreas !== undefined && (
            <InfoChip icon={<TrendingUpOutlined sx={{ fontSize: 12 }} />} label={`${analytics.completedAreas}/${analytics.totalAreas} areas`} iconColor={TEAL} />
          )}
          {(analytics.silenceEvents ?? 0) > 0 && (
            <InfoChip icon={<VolumeOffOutlined sx={{ fontSize: 12 }} />} label={`${analytics.silenceEvents} silence${analytics.silenceEvents! > 1 ? "s" : ""}`} iconColor="#D97706" />
          )}
          {analytics.averageResponseLength !== undefined && (
            <InfoChip icon={<ChatBubbleOutlineOutlined sx={{ fontSize: 12 }} />} label={`~${analytics.averageResponseLength} words`} />
          )}
        </Box>
      )}

      {/* Recruiter review */}
      {recruiterReview?.reviewed ? (
        <Box sx={{ mx: 3.5, mb: 2.5, px: 1.75, py: 1.125, borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "flex-start", gap: 1 }}>
          <VerifiedOutlined sx={{ fontSize: 14, color: "#059669", mt: "1px", flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>
              Reviewed{recruiterReview.reviewedAt ? ` · ${fmtDate(recruiterReview.reviewedAt)}` : ""}
            </Typography>
            {recruiterReview.feedback && (
              <Typography sx={{ fontSize: "0.72rem", color: "#065F46", mt: 0.25 }}>{recruiterReview.feedback}</Typography>
            )}
          </Box>
        </Box>
      ) : recruiterReview && (
        <Box sx={{ mx: 3.5, mb: 2.5, px: 1.75, py: 1, borderRadius: "12px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 0.875 }}>
          <HourglassEmptyOutlined sx={{ fontSize: 13, color: "#D97706", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#92400E" }}>Pending recruiter review</Typography>
        </Box>
      )}

      <Box sx={{ height: "1px", bgcolor: "#F3F4F6" }} />
    </Box>
  );
};

export default AssessmentHero;
