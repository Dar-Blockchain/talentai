import React from "react";
import { Box, Typography } from "@mui/material";

const ACCENT    = "rgba(12,218,139,1)";
const ACCENT_BG = "rgba(12,218,139,0.10)";

const AISpotlight: React.FC = () => {
  return (
    <Box sx={{ px: 3, py: { xs: 4, md: 5 }, maxWidth: 1400, mx: "auto" }}>
      <Box
        sx={{
          background: "linear-gradient(145deg, #141415 0%, #0d1f1a 100%)",
          borderRadius: 3,
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 7 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 5,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(12,218,139,0.10)",
        }}
      >
        {/* Green glow */}
        <Box sx={{
          position: "absolute", width: 360, height: 360,
          borderRadius: "50%", bgcolor: "rgba(12,218,139,0.06)",
          top: -100, right: 80, filter: "blur(80px)", pointerEvents: "none",
        }} />

        {/* Left copy */}
        <Box sx={{ maxWidth: 580, position: "relative" }}>
          {/* Overline pill */}
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.75,
            bgcolor: ACCENT_BG, border: "1px solid rgba(12,218,139,0.25)",
            borderRadius: "20px", px: 2, py: 0.5, mb: 2.5,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ACCENT }} />
            <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: ACCENT, letterSpacing: "0.5px" }}>
              The Hiring Crisis Is Real
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: { xs: "24px", sm: "30px", md: "38px" },
            lineHeight: 1.2,
            color: "#fff",
            mb: 2.5,
          }}>
            You're Reviewing 200+ Resumes
            <br />
            <Box component="span" sx={{ color: ACCENT }}>
              While Your Best Candidates Accept Other Offers
            </Box>
          </Typography>

          <Typography sx={{
            fontFamily: "Poppins",
            fontSize: { xs: "15px", md: "16px" },
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            maxWidth: 520,
          }}>
            The average hiring cycle runs 42+ days. Every open position costs $500/day in lost productivity.
            Manual screening burns out your HR team. And a single bad hire? That's a $25,000 mistake.
            Your competitors are already automating. The question is whether you'll catch up before the next great candidate walks out the door.
          </Typography>
        </Box>

        {/* Right image */}
        <Box sx={{
          flex: 1, minHeight: 180,
          display: { xs: "none", md: "flex" },
          alignItems: "center", justifyContent: "flex-end",
          position: "relative",
        }}>
          <img
            src="/images/home/AiSpotlight.png"
            alt="AI Spotlight Dashboard"
            style={{ maxWidth: "100%", height: "auto", maxHeight: 220, borderRadius: "12px", opacity: 0.9 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AISpotlight;
