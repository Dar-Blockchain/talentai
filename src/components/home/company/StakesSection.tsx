import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";

const RED        = "#EF4444";
const RED_BG     = "rgba(239,68,68,0.08)";
const RED_BORDER = "rgba(239,68,68,0.20)";
const ACCENT     = "#0CDA8B";


const PAIN_POINTS = [
  {
    stat: "$500+",
    label: "per day",
    desc: "Every open role bleeds your budget while you wait",
  },
  {
    stat: "$25K",
    label: "per bad hire",
    desc: "One wrong decision wipes out weeks of profit",
  },
  {
    stat: "42 days",
    label: "avg. time-to-hire",
    desc: "While you deliberate, your best pick accepts elsewhere",
  },
  {
    stat: "24%",
    label: "YoY automation growth",
    desc: "Your competitors are already moving. Fast.",
  },
];

const TRUST = [
  { icon: <LockOutlined sx={{ fontSize: 13 }} />,        label: "No credit card" },
  { icon: <AccessTimeOutlined sx={{ fontSize: 13 }} />,  label: "Live in 30 min" },
  { icon: <CancelOutlined sx={{ fontSize: 13 }} />,      label: "Cancel anytime" },
];

const StakesSection: React.FC = () => (
  <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>

    {/* ── Two-col layout: left copy / right stat cards ── */}
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
      gap: { xs: 6, lg: 8 },
      alignItems: "center",
    }}>

      {/* LEFT — copy */}
      <Box>
        {/* Overline */}
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 1,
          bgcolor: RED_BG, border: "1.5px solid rgba(239,68,68,0.40)",
          borderRadius: "24px", px: 2.5, py: 1, mb: 3,
        }}>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: RED, letterSpacing: "0.6px" }}>
            The Cost of Inaction
          </Typography>
        </Box>

        {/* Headline */}
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 700,
          fontSize: { xs: "26px", sm: "32px", md: "42px" },
          lineHeight: 1.15, color: "#fff", mb: 3, maxWidth: 560,
        }}>
          What Happens When You{" "}
          <Box component="span" sx={{
            color: RED,
            textShadow: "0 0 40px rgba(239,68,68,0.4)",
          }}>
            Don't Fix
          </Box>{" "}
          Your Hiring Process?
        </Typography>

        {/* Body */}
        <Typography sx={{
          fontFamily: "Poppins", fontSize: { xs: "15px", md: "16px" },
          color: "rgba(255,255,255,0.50)", lineHeight: 1.8,
          maxWidth: 520, mb: 5,
        }}>
          Every open role, every gut-feel decision, every 6-week hiring cycle has a
          price tag. The companies automating now will own the talent market.
          The ones that don't will keep losing their best candidates to faster competitors.
        </Typography>

        {/* CTA */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
          <Button
            variant="contained"
            endIcon={<ArrowForwardOutlined />}
            onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
            sx={{
              bgcolor: ACCENT, color: "#0b1b1f",
              fontFamily: "Poppins", fontWeight: 700, fontSize: "15px",
              textTransform: "none", borderRadius: "10px",
              px: 4, py: 1.75,
              boxShadow: "0 0 28px rgba(12,218,139,0.35)",
              "&:hover": { bgcolor: ACCENT, boxShadow: "0 0 28px rgba(12,218,139,0.35)" },
            }}
          >
            Start Hiring Smarter Today
          </Button>

          {/* Trust row */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
            {TRUST.map((t) => (
              <Box key={t.label} sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "rgba(255,255,255,0.30)" }}>
                {t.icon}
                <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                  {t.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* RIGHT — stat cards 2×2 grid */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
      }}>
        {PAIN_POINTS.map((p, i) => (
          <Box key={i} sx={{
            position: "relative",
            borderRadius: "18px",
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.03)",
            border: `1px solid ${RED_BORDER}`,
            p: { xs: 2.5, md: 3 },
            backdropFilter: "blur(10px)",
          }}>
            {/* Top accent line */}
            <Box sx={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: "linear-gradient(90deg, rgba(239,68,68,0.9) 0%, rgba(239,68,68,0.2) 100%)",
            }} />

            {/* Glow */}
            <Box sx={{
              position: "absolute", width: 100, height: 100,
              borderRadius: "50%", bgcolor: "rgba(239,68,68,0.06)",
              bottom: -30, right: -20, filter: "blur(30px)",
              pointerEvents: "none",
            }} />

            <Typography sx={{
              fontFamily: "Poppins", fontWeight: 900,
              fontSize: { xs: "30px", md: "38px" },
              color: RED, lineHeight: 1, mb: 0.5,
              letterSpacing: "-1px",
            }}>
              {p.stat}
            </Typography>
            <Typography sx={{
              fontFamily: "Poppins", fontSize: "11px", fontWeight: 700,
              color: "rgba(239,68,68,0.70)", letterSpacing: "0.5px",
              textTransform: "uppercase", mb: 1.5,
            }}>
              {p.label}
            </Typography>
            <Typography sx={{
              fontFamily: "Poppins", fontSize: "12px",
              color: "rgba(255,255,255,0.40)", lineHeight: 1.55,
            }}>
              {p.desc}
            </Typography>
          </Box>
        ))}
      </Box>

    </Box>
  </Box>
);

export default StakesSection;
