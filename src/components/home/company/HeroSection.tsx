import React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";

const ACCENT = "#0CDA8B";

const STATS = [
  { value: "90%", label: "Less Screening Time", sub: "AI filters candidates automatically" },
  { value: "10x", label: "Cheaper Than Traditional", sub: "vs. recruiters & agencies" },
  { value: "24/7", label: "AI Interviews Available", sub: "No scheduling, no delays" },
  { value: "0", label: "Bias in Evaluation", sub: "Standardized scoring, always" },
];

type HeroSectionProps = {
  color?: string;
  title?: string;
  subtitle?: string;
};

const CompanyHeroSection = ({ color, title, subtitle }: HeroSectionProps) => {
  return (
    <Box
      sx={{
        px: { xs: 3, md: 6 },
        pt: { xs: 6, md: 8 },
        pb: { xs: 4, md: 6 },
        color: "#000000",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `
          linear-gradient(0deg, #F2F3F4, #F2F3F4),
          linear-gradient(90deg, rgba(0, 255, 157, 0.12) 1px, transparent 1px),
          linear-gradient(180deg, rgba(0, 255, 157, 0.12) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        backgroundBlendMode: "overlay",
      }}
    >
      <Box sx={{
        maxWidth: 1200,
        mx: "auto",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
        gap: { xs: 5, md: 8 },
        alignItems: "center",
      }}>

        {/* ── LEFT column ── */}
        <Box>
          {/* Headline */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "36px", sm: "44px", md: "52px" },
              lineHeight: 1.08,
              color: "#111827",
              mb: 2.5,
            }}
          >
            Stop Losing Top Talent
            <br />
            to{" "}
            <Box component="span" sx={{ color: "#0CDA8B" }}>
              Slow Hiring
            </Box>
          </Typography>

          {/* Body */}
          <Typography
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontSize: { xs: "15px", md: "16px" },
              color: "#4B5563",
              lineHeight: 1.75,
              mb: 3.5,
              maxWidth: 520,
            }}
          >
            TalentAI's conversational AI agents{" "}
            <Box component="span" sx={{ color: "#111827", fontWeight: 600 }}>
              interview candidates through natural video dialogue
            </Box>
            , evaluate technical and soft skills in real time, and rank your applicants objectively.
            <br />
            <Box component="span" sx={{
              color: "#0CDA8B", fontWeight: 700,
            }}>
              cutting your average 42-day hiring cycle by up to 75%
            </Box>.
          </Typography>

          {/* Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
              sx={{
                backgroundColor: ACCENT,
                color: "white",
                boxShadow: "none",
                borderRadius: 0,
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "15px",
                px: 3.5, py: 1.25,
                "&:hover": { backgroundColor: ACCENT },
              }}
            >
              Start Hiring Smarter
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
              sx={{
                border: "2px solid #0CDA8B",
                color: "#111827",
                borderRadius: 0,
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "15px",
                px: 3.5, py: 1.25,

                "&:hover": { border: "2px solid #0CDA8B", bgcolor: "transparent" },
              }}
            >
              Watch 2-Min Demo
            </Button>
          </Stack>

          {/* Trust line */}
          <Typography sx={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", color: "#9CA3AF", mb: 5 }}>
            No credit card required. Your first pipeline is live in under 30 minutes.
          </Typography>

          {/* Stats row */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
          }}>
            {STATS.map((s) => (
              <Box key={s.value}>
                <Typography sx={{
                  fontFamily: "Poppins", fontWeight: 800,
                  fontSize: { xs: "22px", md: "28px" },
                  color: "#111827", lineHeight: 1,
                }}>
                  {s.value}
                </Typography>
                <Typography sx={{
                  fontFamily: "Poppins", fontWeight: 700,
                  fontSize: "11px", color: "#111827",
                  lineHeight: 1.3, mt: 0.5,
                }}>
                  {s.label}
                </Typography>
                <Typography sx={{
                  fontFamily: "Poppins", fontSize: "10px",
                  color: "#9CA3AF", lineHeight: 1.4, mt: 0.25,
                }}>
                  {s.sub}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── RIGHT column — product screenshot ── */}
        <Box sx={{ display: { xs: "none", md: "block" }, position: "relative" }}>
          <img
            src="/images/home/HeroSectionLanding.png"
            alt="TalentAI Dashboard"
            style={{ width: "100%", height: "auto", borderRadius: "12px", display: "block" }}
          />
        </Box>

      </Box>
    </Box>
  );
};

export default CompanyHeroSection;
