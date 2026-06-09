import React from "react";
import { Avatar, Box, Chip, Typography } from "@mui/material";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WorkOutlined          from "@mui/icons-material/WorkOutlined";
import { fmtDate } from "@/modules/company/assessment/constants";
import { PostAssessmentData } from "../../types";
import { TEAL, TEAL_BG, TEAL_BORDER } from "../assessmentAtoms";

function fmtInterviewType(raw: string | null): string {
  if (!raw) return "";
  return raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

interface Props {
  g1:         string;
  g2:         string;
  letter:     string;
  name:       string;
  email:      string;
  avatarUrl?: string;
  bgColor:    string;
  assessment: Pick<PostAssessmentData, "jobTitle" | "interviewType" | "createdAt">;
}

const CandidateInfoSection: React.FC<Props> = ({ g1, g2, letter, name, email, avatarUrl, bgColor, assessment }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
    <Box sx={{ flexShrink: 0 }}>
      <Box sx={{ p: "2.5px", borderRadius: "50%", background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
        <Avatar src={avatarUrl} sx={{ width: 60, height: 60, fontWeight: 800, fontSize: "1.4rem", bgcolor: bgColor, color: g1 }}>
          {letter}
        </Avatar>
      </Box>
    </Box>

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
  </Box>
);

export default CandidateInfoSection;
