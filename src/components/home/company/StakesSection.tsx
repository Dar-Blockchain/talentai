import React from "react";
import { Box, Typography, Button } from "@mui/material";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";

const RED       = "#EF4444";
const RED_BG    = "rgba(239,68,68,0.08)";
const ACCENT    = "rgba(12,218,139,1)";
const ACCENT_DIM = "rgba(12,218,139,0.7)";

const PAIN_POINTS = [
  { stat: "$500+",   desc: "lost per day every time a role goes unfilled" },
  { stat: "$25,000", desc: "average cost of a single bad hire" },
  { stat: "42 days", desc: "average time-to-hire — while your best candidates walk" },
  { stat: "24%",     desc: "YoY growth in HR automation — your competitors are already moving" },
];

const StakesSection: React.FC = () => (
  <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
    <Box sx={{ position: "relative" }}>

      {/* Overline */}
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 1,
        bgcolor: RED_BG, border: "1.5px solid rgba(239,68,68,0.40)",
        borderRadius: "24px", px: 2.5, py: 1, mb: 3,
      }}>
        <WarningAmberOutlined sx={{ fontSize: 15, color: RED }} />
        <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, color: RED, letterSpacing: "0.6px" }}>
          The Cost of Inaction
        </Typography>
      </Box>

      {/* Headline */}
      <Typography sx={{
        fontFamily: "Poppins",
        fontWeight: 700,
        fontSize: { xs: "24px", sm: "32px", md: "42px" },
        lineHeight: 1.15,
        color: "#fff",
        mb: 3,
        maxWidth: 700,
      }}>
        What Happens When You{" "}
        <Box component="span" sx={{ color: RED }}>Don't Fix</Box>
        {" "}Your Hiring Process?
      </Typography>

      {/* Body copy */}
      <Typography sx={{
        fontFamily: "Poppins", fontSize: { xs: "15px", md: "17px" },
        color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
        maxWidth: 660, mb: 2,
      }}>
        Every day a position stays open costs your company $500+ in lost productivity.
        Every bad hire drains $25,000 from your bottom line. And every great candidate
        you lose to a 6-week process? They're already working for your competitor.
      </Typography>
      <Typography sx={{
        fontFamily: "Poppins", fontSize: { xs: "15px", md: "17px" },
        color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
        maxWidth: 660, mb: 6,
      }}>
        The HR automation market is growing 24% year-over-year. The companies that
        automate now will own the talent market. The ones that don't? They'll keep
        fighting over whoever's left.
      </Typography>

      {/* Pain point stats grid */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2,
        mb: 7,
      }}>
        {PAIN_POINTS.map((p) => (
          <Box
            key={p.stat}
            sx={{
              bgcolor: RED_BG,
              border: "1px solid rgba(239,68,68,0.18)",
              borderRadius: 2,
              p: { xs: 2, md: 2.5 },
            }}
          >
            <Typography sx={{
              fontFamily: "Poppins", fontWeight: 800,
              fontSize: { xs: "24px", md: "30px" },
              color: RED, lineHeight: 1, mb: 0.75,
            }}>
              {p.stat}
            </Typography>
            <Typography sx={{
              fontFamily: "Poppins", fontSize: "12px",
              color: "rgba(255,255,255,0.50)", lineHeight: 1.5,
            }}>
              {p.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* CTA block */}
      <Box sx={{
        display: "flex", flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" }, gap: 3,
        pt: 5, borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        <Button
          variant="contained"
          endIcon={<ArrowForwardOutlined />}
          onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
          sx={{
            bgcolor: ACCENT, color: "#0b1b1f",
            fontFamily: "Poppins", fontWeight: 700, fontSize: "15px",
            textTransform: "none", borderRadius: 1.5,
            px: 4, py: 1.5,
            boxShadow: "0 0 24px rgba(12,218,139,0.30)",
            "&:hover": { bgcolor: ACCENT_DIM, boxShadow: "0 0 36px rgba(12,218,139,0.45)" },
          }}
        >
          Start Hiring Smarter Today
        </Button>
        <Typography sx={{
          fontFamily: "Poppins", fontSize: "13px",
          color: "rgba(255,255,255,0.35)", lineHeight: 1.6,
        }}>
          Free to start. No credit card.{" "}
          <Box component="span" sx={{ color: "rgba(255,255,255,0.55)" }}>Pipeline live in 30 minutes.</Box>
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default StakesSection;
