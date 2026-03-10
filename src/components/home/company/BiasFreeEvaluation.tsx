import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import SpeedOutlined from "@mui/icons-material/SpeedOutlined";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";

const ACCENT     = "#0CDA8B";
const ACCENT_BG  = "rgba(12,218,139,0.08)";
const ACCENT_MID = "rgba(12,218,139,0.15)";
const ACCENT_DIM = "rgba(12,218,139,0.7)";

const FEATURES = [
  {
    icon: <SpeedOutlined sx={{ fontSize: 18, color: ACCENT }} />,
    title: "AI Video Interviews",
    desc: "No scheduling needed — runs 24/7",
  },
  {
    icon: <VerifiedOutlined sx={{ fontSize: 18, color: ACCENT }} />,
    title: "Blockchain Credentials",
    desc: "Verified, fraud-proof, candidate-owned",
  },
  {
    icon: <AccessTimeOutlined sx={{ fontSize: 18, color: ACCENT }} />,
    title: "30-Min Pipeline Setup",
    desc: "Drag-and-drop, live today",
  },
  {
    icon: <AutoAwesomeOutlined sx={{ fontSize: 18, color: ACCENT }} />,
    title: "Auto-Ranked Shortlists",
    desc: "You review the best, skip the rest",
  },
  {
    icon: <AttachMoneyOutlined sx={{ fontSize: 18, color: ACCENT }} />,
    title: "Pay-Per-Hire Credits",
    desc: "No bloated contracts, ever",
  },
];


const BiasFreeEvaluation: React.FC = () => (
  <Box id="features" sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>

    {/* ── Section header ── */}
    <Box sx={{ mb: { xs: 6, md: 9 }, maxWidth: 720, mx: "auto", textAlign: "center" }}>
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 1,
        bgcolor: ACCENT_BG, border: "1.5px solid rgba(12,218,139,0.40)",
        borderRadius: "24px", px: 2.5, py: 1, mb: 3,
      }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: ACCENT }} />
        <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: "#059669", letterSpacing: "0.6px" }}>
          The Solution
        </Typography>
      </Box>

      <Typography sx={{
        fontFamily: "Poppins", fontWeight: 700,
        fontSize: { xs: "30px", md: "46px" },
        lineHeight: 1.1, color: "#111827", mb: 2.5,
      }}>
        Stop Guessing.{" "}
        <Box component="span" sx={{
          background: "linear-gradient(90deg, #059669 0%, #0CDA8B 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Start Hiring With Confidence.
        </Box>
      </Typography>
      <Typography sx={{
        fontFamily: "Poppins", fontSize: { xs: "15px", md: "17px" },
        lineHeight: 1.75, color: "#6B7280", maxWidth: 560, mx: "auto",
      }}>
        TalentAI replaces manual screening with AI-driven conversations and
        blockchain-verified proof — so every hire is based on performance, not paperwork.
      </Typography>
    </Box>

    {/* ── Main two-column grid ── */}
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", lg: "5fr 4fr" },
      gap: { xs: 5, md: 6 },
      alignItems: "start",
    }}>

      {/* ══ LEFT — product screenshot card ══ */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* Browser mockup */}
        <Box sx={{
          borderRadius: "20px",
          overflow: "hidden",
          bgcolor: "#0E0F10",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
          position: "relative",
        }}>
          {/* Glow behind screen */}
          <Box sx={{
            position: "absolute", width: 300, height: 200,
            background: "radial-gradient(ellipse, rgba(12,218,139,0.12) 0%, transparent 70%)",
            top: "30%", left: "50%", transform: "translateX(-50%)",
            pointerEvents: "none",
          }} />

          {/* Browser chrome */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1.25,
            px: 2.5, py: 2,
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["#FF5F57","#FFBD2E","#28CA41"].map((c) => (
              <Box key={c} sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: c }} />
            ))}
            <Box sx={{
              flex: 1, mx: 2, height: 24, borderRadius: "8px",
              bgcolor: "rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", gap: 1, px: 2,
            }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT, opacity: 0.7 }} />
              <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.3px" }}>
                app.talentai.bid/interview
              </Typography>
            </Box>
            {/* Live badge */}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              bgcolor: "rgba(12,218,139,0.12)", border: "1px solid rgba(12,218,139,0.25)",
              borderRadius: "6px", px: 1, py: 0.25,
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: ACCENT, animation: "pulse 2s infinite" }} />
              <Typography sx={{ fontFamily: "Poppins", fontSize: "9px", fontWeight: 700, color: ACCENT, letterSpacing: "0.5px" }}>
                LIVE
              </Typography>
            </Box>
          </Box>

          {/* Screenshot */}
          <Box sx={{ p: { xs: 1.5, md: 2 } }}>
            <img
              src="/images/home/Iframe.png"
              alt="AI Interview Demo"
              style={{ width: "100%", height: "auto", borderRadius: "10px", display: "block" }}
            />
          </Box>
        </Box>

        {/* CTA card — dark gradient */}
        <Box sx={{
          background: "linear-gradient(145deg, #0a1410 0%, #0e1a15 50%, #0E0F10 100%)",
          borderRadius: "20px",
          p: { xs: 3, md: 4 },
          border: "1px solid rgba(12,218,139,0.15)",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" }, gap: 3,
        }}>
          <Box sx={{
            position: "absolute", width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(12,218,139,0.10) 0%, transparent 70%)",
            top: -80, right: -60, pointerEvents: "none",
          }} />

          <Box sx={{ flex: 1, position: "relative" }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.75,
              bgcolor: "rgba(12,218,139,0.10)", border: "1px solid rgba(12,218,139,0.22)",
              borderRadius: "20px", px: 1.5, py: 0.4, mb: 1.5,
            }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: ACCENT }} />
              <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "0.6px" }}>
                75% LESS HIRING WORK
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: { xs: "16px", md: "18px" }, color: "#fff", lineHeight: 1.35, mb: 0.75 }}>
              See It Work in 2 Minutes
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              Watch a real AI agent interview a candidate — no scheduling, no bias.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<PlayArrowRounded sx={{ fontSize: 18 }} />}
            onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
            sx={{
              bgcolor: ACCENT, color: "#0b1b1f",
              fontFamily: "Poppins", fontWeight: 700, fontSize: "15px",
              textTransform: "none", borderRadius: "8px",
              px: 4, py: 1.5, flexShrink: 0,
              boxShadow: "0 0 24px rgba(12,218,139,0.40)",
              position: "relative",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: ACCENT_DIM, boxShadow: "0 0 36px rgba(12,218,139,0.55)" },
            }}
          >
            Start Hiring Smarter
          </Button>
        </Box>
      </Box>

      {/* ══ RIGHT — features + modules ══ */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>

        {/* Sub-headline */}
        <Box>
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 700,
            fontSize: { xs: "22px", md: "28px" },
            lineHeight: 1.2, color: "#111827", mb: 1.5,
          }}>
            Every Candidate Evaluated<br />
            <Box component="span" sx={{ color: "#059669" }}>on Merit. Nothing Else.</Box>
          </Typography>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", color: "#6B7280", lineHeight: 1.75 }}>
            Unconscious bias costs companies top talent. TalentAI's AI agents evaluate every
            candidate on identical criteria — skills, communication, cultural fit — with zero room
            for gut instinct to override the data.
          </Typography>
        </Box>

        {/* Feature rows */}
        <Stack spacing={0} sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}>
          {FEATURES.map((f, i) => (
            <Box key={f.title} sx={{
              display: "flex", alignItems: "center", gap: 2,
              px: 3, py: 2.25,
              borderBottom: i < FEATURES.length - 1 ? "1px solid #F3F4F6" : "none",
              transition: "background 0.15s",
              "&:hover": { bgcolor: ACCENT_BG },
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px",
                bgcolor: ACCENT_BG, border: "1px solid rgba(12,218,139,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {f.icon}
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "#9CA3AF", lineHeight: 1.4 }}>
                  {f.desc}
                </Typography>
              </Box>
              <CheckCircleOutlined sx={{ fontSize: 16, color: ACCENT, ml: "auto", flexShrink: 0 }} />
            </Box>
          ))}
        </Stack>

      </Box>
    </Box>
  </Box>
);

export default BiasFreeEvaluation;
