import { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import CaptchaModal from "./CaptchaModal";

const ACCENT     = "#0CDA8B";
const ACCENT_BG  = "rgba(12,218,139,0.12)";
const CALENDLY   = "https://calendly.com/talent__ai/30min";

const TRUST_BADGES = [
  { icon: <LockOutlined sx={{ fontSize: 13 }} />,          label: "No credit card required" },
  { icon: <AccessTimeOutlined sx={{ fontSize: 13 }} />,    label: "30-minute setup" },
  { icon: <CancelOutlined sx={{ fontSize: 13 }} />,        label: "Cancel anytime" },
  { icon: <VerifiedUserOutlined sx={{ fontSize: 13 }} />,  label: "GDPR compliant" },
];

const FinalCTA: React.FC = () => {
  const [captchaOpen, setCaptchaOpen] = useState(false);

  const openDemo = () => setCaptchaOpen(true);
  const handleVerified = () => window.open(CALENDLY, "_blank");

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 3, md: 8 },
        py: { xs: 6, md: 8 },
        textAlign: "left",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Overline pill */}
      <Box sx={{
        display: "inline-flex", alignItems: "center",
        bgcolor: ACCENT_BG, border: "1.5px solid rgba(12,218,139,0.40)",
        borderRadius: "24px", px: 2.5, py: 1, mb: 2.5,
      }}>
        <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: ACCENT, letterSpacing: "0.6px" }}>
          Don't Wait
        </Typography>
      </Box>

      {/* Headline */}
      <Typography sx={{
        fontFamily: "Poppins",
        fontWeight: 700,
        fontSize: { xs: "26px", sm: "34px", md: "44px" },
        lineHeight: 1.15,
        color: "#fff",
        mb: 3,
        maxWidth: 720,
      }}>
        Your Next Great Hire Is Waiting.{" "}
        <Box component="span" sx={{ color: ACCENT }}>
          Your Competitors Aren't.
        </Box>
      </Typography>

      {/* Body */}
      <Typography sx={{
        fontFamily: "Poppins",
        fontSize: { xs: "15px", md: "17px" },
        color: "rgba(255,255,255,0.60)",
        lineHeight: 1.7,
        maxWidth: 560,
        mb: 5,
      }}>
        While you're reading this, AI-powered companies are already interviewing your candidates.
        TalentAI deploys in 30 minutes. Your first AI interview can happen today.
      </Typography>

      {/* CTA buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{ mb: 4 }}
      >
        <Button
          variant="contained"
          onClick={openDemo}
          sx={{
            bgcolor: ACCENT,
            color: "#fff",
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: "15px",
            textTransform: "none",
            borderRadius: 0,
            px: 4,
            py: 1.5,
            boxShadow: "none",
            "&:hover": { bgcolor: ACCENT, boxShadow: "none" },
          }}
        >
          Start Hiring Smarter — Free to Try →
        </Button>

        <Button
          variant="outlined"
          onClick={openDemo}
          sx={{
            borderColor: "rgba(255,255,255,0.20)",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "15px",
            textTransform: "none",
            borderRadius: 1,
            px: 4,
            py: 1.5,
            "&:hover": { borderColor: ACCENT, color: ACCENT, bgcolor: ACCENT_BG },
          }}
        >
          Book a 15-Minute Strategy Call →
        </Button>
      </Stack>

      {/* Trust badges row */}
      <Stack
        direction="row"
        spacing={{ xs: 2, md: 4 }}
        justifyContent="flex-start"
        flexWrap="wrap"
        useFlexGap
        sx={{ rowGap: 1.5 }}
      >
        {TRUST_BADGES.map((badge) => (
          <Box key={badge.label} sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "rgba(255,255,255,0.40)" }}>
            {badge.icon}
            <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.40)" }}>
              {badge.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      <CaptchaModal open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
    </Box>
  );
};

export default FinalCTA;
