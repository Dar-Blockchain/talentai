import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";

const ACCENT     = "rgba(12,218,139,1)";
const ACCENT_BG  = "rgba(12,218,139,0.08)";
const ACCENT_DIM = "rgba(12,218,139,0.7)";

const BULLETS = [
  "AI Video Interviews — No Scheduling Needed",
  "Blockchain-Verified Credentials, Owned by Candidates",
  "Drag-&-Drop Pipeline, Live in 30 Minutes",
  "Auto-Ranked Shortlists — You Just Approve",
  "Pay-Per-Hire Credits, No Bloated Contracts",
];

const PILLS = [
  { label: "Technical",  icon: "/icons/technical.svg"  },
  { label: "Task",       icon: "/icons/task.svg"        },
  { label: "Soft",       icon: "/icons/soft.svg"        },
  { label: "Condition",  icon: "/icons/condition.svg"   },
  { label: "HR",         icon: "/icons/hr.svg"          },
  { label: "Email",      icon: "/icons/email.svg"       },
];

const BiasFreeEvaluation: React.FC = () => (
  <Box id="features" sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>

    {/* ── Section header ── */}
    <Box sx={{ mb: { xs: 5, md: 7 } }}>
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 1,
        bgcolor: ACCENT_BG, border: "1.5px solid rgba(12,218,139,0.40)",
        borderRadius: "24px", px: 2.5, py: 1, mb: 3,
      }}>
        <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: "#059669", letterSpacing: "0.6px" }}>
          The Solution
        </Typography>
      </Box>

      <Typography sx={{
        fontFamily: "Poppins", fontWeight: 700,
        fontSize: { xs: "28px", md: "44px" },
        lineHeight: 1.15, color: "#111827", mb: 1.5,
      }}>
        Stop Guessing. Start Hiring With Confidence.
      </Typography>
      <Typography sx={{
        fontFamily: "Poppins", fontSize: { xs: "15px", md: "17px" },
        lineHeight: 1.65, color: "#4B5563", maxWidth: 600,
      }}>
        TalentAI replaces manual screening with AI-driven conversations and
        blockchain-verified proof — so every hire is based on performance, not paperwork.
      </Typography>
    </Box>

    {/* ── Two-column body ── */}
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
      gap: { xs: 5, md: 8 },
      alignItems: "start",
    }}>

      {/* Left — video card + promo banner */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Video frame */}
        <Box sx={{
          bgcolor: "#0E0F10", borderRadius: 3, overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          aspect: "16/9", display: "flex", alignItems: "center", justifyContent: "center",
          p: 2,
        }}>
          <img
            src="/images/home/Iframe.png"
            alt="AI Interview Demo"
            style={{ width: "100%", height: "auto", borderRadius: "8px", display: "block" }}
          />
        </Box>

        {/* Promo banner */}
        <Box sx={{
          background: "linear-gradient(135deg, #0E0F10 0%, #0d1f1a 100%)",
          borderRadius: 3, p: 3,
          border: "1px solid rgba(12,218,139,0.15)",
          position: "relative", overflow: "hidden",
        }}>
          <Box sx={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%",
            bgcolor: "rgba(12,218,139,0.06)", top: -60, right: -60, filter: "blur(40px)",
          }} />
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "18px", color: "#fff", mb: 1, lineHeight: 1.3, position: "relative" }}>
            See How We Eliminate 75% of Your Hiring Workload
          </Typography>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", color: "rgba(255,255,255,0.50)", mb: 2.5, position: "relative" }}>
            Watch a real AI agent conduct a full technical + soft-skills interview in minutes.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
            sx={{
              bgcolor: ACCENT, color: "#0b1b1f",
              fontFamily: "Poppins", fontWeight: 600, fontSize: "13px",
              textTransform: "none", borderRadius: 1,
              boxShadow: "0 0 16px rgba(12,218,139,0.30)",
              position: "relative",
              "&:hover": { bgcolor: ACCENT_DIM },
            }}
          >
            Watch a 2-Min Demo
          </Button>
        </Box>
      </Box>

      {/* Right — Bias-Free copy + bullets + module grid */}
      <Box>
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 700,
          fontSize: { xs: "22px", md: "28px" },
          lineHeight: 1.25, color: "#111827", mb: 1.5,
        }}>
          Every Candidate Evaluated<br />
          <Box component="span" sx={{ color: "#059669" }}>on Merit. Nothing Else.</Box>
        </Typography>
        <Typography sx={{
          fontFamily: "Poppins", fontSize: "15px",
          color: "#4B5563", lineHeight: 1.7, mb: 3,
        }}>
          Unconscious bias costs companies top talent and exposes them to legal risk.
          TalentAI's AI agents evaluate every candidate on the same criteria — skills,
          communication, cultural alignment — with zero room for gut instinct to override the data.
        </Typography>

        {/* Bullets */}
        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {BULLETS.map((b) => (
            <Box key={b} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
              <CheckCircleOutlined sx={{ fontSize: 18, color: ACCENT, mt: 0.15, flexShrink: 0 }} />
              <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: 500, color: "#374151", lineHeight: 1.5 }}>
                {b}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Module grid */}
        <Box sx={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.5,
        }}>
          {PILLS.map((p) => (
            <Box key={p.label} sx={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 1, p: 2, borderRadius: 2,
              bgcolor: "#F9FAFB", border: "1px solid #E5E7EB",
              transition: "all 0.2s",
              "&:hover": { border: `1px solid rgba(12,218,139,0.40)`, bgcolor: ACCENT_BG, transform: "translateY(-2px)" },
            }}>
              <Box component="img" src={p.icon} alt={p.label} sx={{ width: 28, height: 28, objectFit: "contain" }} />
              <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                {p.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);

export default BiasFreeEvaluation;
