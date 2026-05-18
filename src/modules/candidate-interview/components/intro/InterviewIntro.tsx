import React from "react";
import { Box, Typography, Container, Button, Chip } from "@mui/material";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Header from "@/components/layout/Header";
import { useTranslation } from "react-i18next";
import {
  SX,
  PURPLE,
  PURPLE_DARK,
  PURPLE_BG,
  PURPLE_BORDER,
} from "../../styles/interviewIntro.styles";

interface InterviewIntroProps {
  interviewConfig: any;
  jobData?: any;
  onNext: () => void;
}

const InterviewIntro: React.FC<InterviewIntroProps> = ({
  interviewConfig,
  jobData,
  onNext,
}) => {
  const { t } = useTranslation("interview");

  const duration = interviewConfig?.sessionSettings?.duration || 20;

  const jd = jobData?.jobDetails;
  const jobTitle =
    jd?.title ||
    jobData?.title ||
    interviewConfig?.context?.targetRole ||
    (interviewConfig?.interviewType === "TECHNICAL_INTERVIEW"
      ? "Technical Interview"
      : interviewConfig?.interviewType === "ASSESSMENT"
        ? "Soft Skills Assessment"
        : interviewConfig?.interviewType === "EVALUATION"
          ? "Psychotechnic Assessment"
          : "HR Interview");
  const company =
    jobData?.companyName || interviewConfig?.context?.targetCompany || "";
  const location = jd?.location || "";
  const contractType = jd?.employmentType || "";
  const workMode = jd?.workMode || "";
  const experienceLevel =
    jd?.experienceLevel || interviewConfig?.context?.experienceLevel || "";
  const skills: string[] = (jobData?.skillAnalysis?.requiredSkills || [])
    .map((s: any) => s.name)
    .filter(Boolean)
    .slice(0, 6);
  const description = jd?.description || "";

  const tips = [
    t("intro.tip1"),
    t("intro.tip2"),
    t("intro.tip3"),
    t("intro.tip4"),
  ];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
      {/* Step indicator */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3.5 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
        >
          <Box sx={SX.stepCircleActive}>
            <Typography sx={SX.stepNumActive}>1</Typography>
          </Box>
          <Typography sx={SX.stepLabelActive}>
            {t("intro.step1_label")}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, height: 1, bgcolor: "#E5E7EB", mx: 2 }} />
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
        >
          <Box sx={SX.stepCircleInactive}>
            <Typography sx={SX.stepNumInactive}>2</Typography>
          </Box>
          <Typography sx={SX.stepLabelInactive}>
            {t("intro.step2_label")}
          </Typography>
        </Box>
      </Box>

      {/* Main card */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            pt: 3,
            pb: 2.5,
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "10px",
                bgcolor: PURPLE_BG,
                border: `1px solid ${PURPLE_BORDER}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <VideocamOutlinedIcon sx={{ color: PURPLE, fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#111827",
                  lineHeight: 1.25,
                }}
              >
                {jobTitle}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mt: 0.3,
                }}
              >
                <TimerOutlinedIcon sx={{ fontSize: 13, color: "#6B7280" }} />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "0.79rem",
                    color: "#6B7280",
                  }}
                >
                  {company ? `${company} · ` : ""}~{duration} min · AI-powered ·
                  Video & Voice
                </Typography>
              </Box>
            </Box>
          </Box>

          {(location || contractType || workMode || experienceLevel) && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
              {location && (
                <Chip
                  icon={<LocationOnOutlinedIcon />}
                  label={location}
                  size="small"
                  sx={SX.metaChip}
                />
              )}
              {contractType && (
                <Chip
                  icon={<BusinessCenterOutlinedIcon />}
                  label={contractType}
                  size="small"
                  sx={SX.metaChip}
                />
              )}
              {workMode && (
                <Chip
                  label={workMode}
                  size="small"
                  sx={{ ...SX.metaChip, "& .MuiChip-icon": undefined }}
                />
              )}
              {experienceLevel && (
                <Chip label={experienceLevel} size="small" sx={SX.skillChip} />
              )}
            </Box>
          )}
        </Box>

        {/* Body — two columns */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 3,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* LEFT: About the role / skills */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {description && (
              <Box>
                <Typography sx={SX.sectionHeading}>
                  {t("intro.about_role")}
                </Typography>
                <Typography sx={SX.bodyText}>
                  {description.length > 280
                    ? description.slice(0, 280) + "…"
                    : description}
                </Typography>
              </Box>
            )}
            {skills.length > 0 && (
              <Box>
                <Typography sx={SX.sectionHeading}>
                  {t("intro.key_skills")}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {skills.map((s, i) => (
                    <Chip key={i} label={s} size="small" sx={SX.skillChip} />
                  ))}
                </Box>
              </Box>
            )}
            {!description && !skills.length && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  bgcolor: "#F9FAFB",
                  borderRadius: "10px",
                  border: "1px solid #F3F4F6",
                }}
              >
                <MicNoneOutlinedIcon
                  sx={{ color: PURPLE, fontSize: 20, flexShrink: 0 }}
                />
                <Typography sx={SX.bodyText}>
                  {t("intro.voice_video_desc")}
                </Typography>
              </Box>
            )}
          </Box>

          {/* RIGHT: Before you start */}
          <Box>
            <Typography sx={{ ...SX.sectionHeading, mb: 1.25 }}>
              {t("intro.before_start")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {tips.map((tip, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CheckCircleOutlineIcon
                    sx={{ fontSize: 16, color: PURPLE, flexShrink: 0 }}
                  />
                  <Typography sx={SX.tipText}>{tip}</Typography>
                </Box>
              ))}
            </Box>

            {/* Format pills */}
            <Box sx={{ mt: 2.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Box sx={SX.pill}>
                <VideocamOutlinedIcon sx={{ fontSize: 14, color: "#6B7280" }} />
                <Typography sx={SX.pillText}>
                  {t("intro.video_label")}
                </Typography>
              </Box>
              <Box sx={SX.pill}>
                <MicNoneOutlinedIcon sx={{ fontSize: 14, color: "#6B7280" }} />
                <Typography sx={SX.pillText}>
                  {t("intro.voice_label")}
                </Typography>
              </Box>
              <Box sx={SX.pillPurple}>
                <TimerOutlinedIcon sx={{ fontSize: 14, color: PURPLE }} />
                <Typography sx={SX.pillTextPurple}>{duration} min</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer CTA */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            pb: 3,
            pt: 0.5,
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={onNext}
            sx={{
              bgcolor: PURPLE,
              color: "#fff",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "0.86rem",
              px: 3.5,
              py: 1.15,
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "none",
              minWidth: 160,
              "&:hover": { bgcolor: PURPLE_DARK, boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
            }}
          >
            {t("start.btn_start")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default InterviewIntro;
