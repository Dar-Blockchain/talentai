import React, { useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import InterviewTimer from "./InterviewTimer";
import { useTranslation } from "react-i18next";
import { type JobPost } from "../../types/api";
import { type InterviewConfig } from "../../types/interview";
import { PURPLE_BG, PURPLE_BORDER, PURPLE } from "../../styles/interviewIntro.styles";

interface Props {
  jobData: JobPost | null;
  interviewConfig?: InterviewConfig | null;
  isActive: boolean;
  elapsedTime?: number;
  timeWarning?: boolean;
  onEndInterview: () => void;
  endInterviewLabel: string;
}

export default function InterviewSessionHeader({
  jobData,
  interviewConfig,
  isActive,
  elapsedTime,
  timeWarning,
  onEndInterview,
  endInterviewLabel,
}: Props) {
  const { t } = useTranslation("modules/interview/hr");

  const jobTitle = useMemo(
    () => jobData?.jobDetails?.title || jobData?.title || t("interview_types.hr"),
    [jobData, t],
  );

  const companyName = useMemo(
    () =>
      jobData?.companyName ||
      interviewConfig?.context?.targetCompany ||
      jobData?.user?.companyName ||
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

        {/* Right — elapsed timer + end button */}
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
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
