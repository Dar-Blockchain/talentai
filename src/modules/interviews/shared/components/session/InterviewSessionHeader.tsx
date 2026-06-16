import React, { useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import InterviewTimer from "./InterviewTimer";
import { useTranslation } from "react-i18next";
import { type InterviewConfig } from "../../types/interview";

// Inlined from interviewIntro.styles (post-interview only)
const PURPLE        = '#6AD39C';
const PURPLE_BG     = 'rgba(225,248,237,1)';
const PURPLE_BORDER = 'rgba(106,211,156,0.35)';

interface Props {
  jobData?: any;
  interviewConfig?: InterviewConfig | null;
  isActive: boolean;
  elapsedTime?: number;
  timeWarning?: boolean;
  coverage?: number | null;
  onEndInterview: () => void;
  endInterviewLabel: string;
}

export default function InterviewSessionHeader({
  jobData,
  interviewConfig,
  isActive,
  elapsedTime,
  timeWarning,
  coverage,
  onEndInterview,
  endInterviewLabel,
}: Props) {
  const coverageColor =
    coverage == null ? null
    : coverage >= 80 ? "#16a34a"
    : coverage >= 50 ? "#d97706"
    : "#dc2626";

  const coverageLabel =
    coverage == null ? ""
    : coverage >= 80 ? "Strong"
    : coverage >= 50 ? "Moderate"
    : "Building";

  const ARC_R   = 9;
  const ARC_C   = 2 * Math.PI * ARC_R;
  const arcDash  = coverageColor != null ? ARC_C * (1 - (coverage ?? 0) / 100) : ARC_C;
  const { t } = useTranslation("modules/interview/interview");

  const jobTitle = useMemo(() => {
    if (jobData?.jobDetails?.title) return jobData.jobDetails.title;
    if (jobData?.title)             return jobData.title;

    // Skill / standalone interviews — derive from config instead of defaulting to "HR interview"
    const type = interviewConfig?.interviewType;
    const role = interviewConfig?.context?.targetRole;
    if (type === 'TECHNICAL_SKILL' || type === 'ASSESSMENT' || type === 'EVALUATION') {
      return role ? `${role} Assessment` : 'Technical Assessment';
    }
    if (type === 'SOFT_SKILL') {
      return role ? `${role} Assessment` : 'Soft Skills Assessment';
    }

    return t("interview_types.hr");
  }, [jobData, interviewConfig, t]);

  const companyName = useMemo(
    () =>
      jobData?.createdBy?.name ||
      jobData?.companyName ||
      interviewConfig?.context?.targetCompany ||
      jobData?.user?.username ||
      "",
    [jobData, interviewConfig],
  );

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "20px",
        border: "1px solid #c8eedd",
        px: { xs: 1.5, md: 2 },
        py: { xs: 1, md: 1.25 },
        mb: 1,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1.5}
      >
        {/* Left — job icon + title + company meta */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              bgcolor: PURPLE_BG,
              border: `1px solid ${PURPLE_BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <VideocamOutlinedIcon sx={{ color: PURPLE, fontSize: 16 }} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#111827",
                  lineHeight: 1.25,
                }}
              >
                {jobTitle}
              </Typography>
              {isActive && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, px: 0.875, py: 0.2, borderRadius: "20px", bgcolor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#ef4444", animation: "liveBlink 1.6s ease-in-out infinite", "@keyframes liveBlink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.25 } } }} />
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.58rem", color: "#ef4444", letterSpacing: "0.1em" }}>LIVE</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.2 }}>
              <TimerOutlinedIcon sx={{ fontSize: 11, color: "#6B7280" }} />
              <Typography
                sx={{ fontFamily: "Poppins", fontSize: "0.7rem", color: "#6B7280" }}
              >
                {companyName ? `${companyName} · ` : ""}AI-powered · Video & Voice
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right — coverage pill + elapsed timer + end button */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          {isActive && coverageColor != null && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.875, px: 1.25, py: 0.5, borderRadius: "12px", bgcolor: `${coverageColor}0d`, border: `1px solid ${coverageColor}28` }}>
              {/* Mini circular arc */}
              <Box sx={{ position: "relative", width: 30, height: 30, flexShrink: 0 }}>
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <circle cx="15" cy="15" r={ARC_R} fill="none" stroke={`${coverageColor}22`} strokeWidth="2.5" />
                  <circle
                    cx="15" cy="15" r={ARC_R}
                    fill="none"
                    stroke={coverageColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={ARC_C}
                    strokeDashoffset={arcDash}
                    transform="rotate(-90 15 15)"
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>
                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "0.5rem", color: coverageColor, lineHeight: 1 }}>
                    {coverage}
                  </Typography>
                </Box>
              </Box>
              {/* Text */}
              <Box>
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: "#374151", lineHeight: 1.3 }}>
                  {coverage}% covered
                </Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.6rem", color: "#9ca3af", lineHeight: 1 }}>
                  {coverageLabel}
                </Typography>
              </Box>
            </Box>
          )}
          {isActive && elapsedTime !== undefined && (
            <InterviewTimer
              elapsedTime={elapsedTime}
              timeWarning={timeWarning ?? false}
            />
          )}
          {isActive && (
            <Button
              variant="contained"
              onClick={onEndInterview}
              sx={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "none",
                bgcolor: "#fef2f2",
                color: "#ef4444",
                borderRadius: "10px",
                px: 2,
                py: 0.75,
                boxShadow: "none",
                border: "1px solid rgba(239,68,68,0.2)",
                "&:hover": { bgcolor: "#fee2e2", boxShadow: "none" },
              }}
            >
              {endInterviewLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
