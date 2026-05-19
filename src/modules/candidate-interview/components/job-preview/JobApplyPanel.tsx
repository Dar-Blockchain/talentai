import React, { useState } from "react";
import { Box, Typography, Button, Divider, Chip } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { type RootState } from "@/store/store";
import { PURPLE, PURPLE_DARK, PURPLE_LIGHT, PURPLE_BORDER } from "../../constants";
import { SectionCard } from "./JobPanelShared";
import OnboardingModal from "../modals/OnboardingModal";

interface JobApplyPanelProps {
  jobTitle: string;
  onStartInterview?: () => void;
}

export default function JobApplyPanel({ jobTitle, onStartInterview }: JobApplyPanelProps) {
  const { t } = useTranslation("modules/interview/apply");
  const [modalOpen, setModalOpen] = useState(false);
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const steps = [
    { num: 1, label: t("apply_panel.step1_label"), sub: t("apply_panel.step1_sub") },
    { num: 2, label: t("apply_panel.step2_label"), sub: t("apply_panel.step2_sub") },
    { num: 3, label: t("apply_panel.step3_label"), sub: t("apply_panel.step3_sub") },
  ];

  const isAuthenticated = !!authUser && !!onStartInterview;

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 320 },
        flexShrink: 0,
        position: { md: "sticky" },
        top: { md: 24 },
      }}
    >
      <SectionCard>
        {isAuthenticated ? (
          // ── Authenticated — "Start Interview" ──────────────────────────────
          <>
            <Chip
              label="Ready to interview"
              size="small"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "0.72rem",
                bgcolor: "rgba(106,211,156,0.1)",
                color: "#10453F",
                border: "1px solid rgba(106,211,156,0.3)",
                mb: 1.5,
              }}
            />
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1.05rem", color: "#111827", mb: 0.5 }}>
              Start your interview
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "#6B7280", mb: 2.5, lineHeight: 1.6 }}>
              Your account is ready. Click below to begin the AI-powered interview for this position.
            </Typography>

            {[
              "AI interviewer asks tailored questions",
              "Camera & voice recording",
              "Instant feedback after completion",
            ].map((item) => (
              <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 15, color: PURPLE, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.78rem", color: "#374151" }}>
                  {item}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={onStartInterview}
              startIcon={<PlayArrowIcon />}
              sx={{
                bgcolor: PURPLE,
                color: "#fff",
                fontWeight: 700,
                fontFamily: "Poppins",
                fontSize: "0.95rem",
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: PURPLE_DARK, boxShadow: "none" },
              }}
            >
              Start Interview
            </Button>
          </>
        ) : (
          // ── Unauthenticated — "Apply Now" ──────────────────────────────────
          <>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "1.05rem", color: "#111827", mb: 0.5 }}>
              {t("apply_panel.title")}
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.82rem", color: "#6B7280", mb: 2.5, lineHeight: 1.6 }}>
              {t("apply_panel.subtitle")}
            </Typography>

            {steps.map(({ num, label, sub }) => (
              <Box key={num} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.75 }}>
                <Box
                  sx={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    bgcolor: PURPLE_LIGHT, border: `1px solid ${PURPLE_BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.75rem", color: PURPLE }}>
                    {num}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.75rem", color: "#9CA3AF" }}>
                    {sub}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              fullWidth
              onClick={() => setModalOpen(true)}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: PURPLE,
                color: "#fff",
                fontWeight: 700,
                fontFamily: "Poppins",
                fontSize: "0.95rem",
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: PURPLE_DARK, boxShadow: "none" },
              }}
            >
              {t("apply_panel.btn")}
            </Button>
          </>
        )}
      </SectionCard>

      {/* Modal is always rendered outside the conditional so it is never unmounted mid-flow */}
      <OnboardingModal
        open={modalOpen}
        jobTitle={jobTitle}
        onClose={() => setModalOpen(false)}
      />
    </Box>
  );
}
