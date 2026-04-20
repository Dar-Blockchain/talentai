import { Box, Typography } from "@mui/material";
import TuneOutlined            from "@mui/icons-material/TuneOutlined";
import PsychologyOutlined       from "@mui/icons-material/PsychologyOutlined";
import WorkspacePremiumOutlined from "@mui/icons-material/WorkspacePremiumOutlined";
import { motion } from "framer-motion";

const ACCENT       = "#9CA3AF";
const ACCENT_BG    = "rgba(156,163,175,0.10)";
const ACCENT_LIGHT = "rgba(156,163,175,0.25)";
const ease = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, margin: "-60px" };

const STEPS = [
  {
    number: "01",
    tag:    "Setup",
    label:  "Build Your Pipeline",
    desc:   "Choose your interview modules, set pass/fail thresholds, and launch your first AI-driven role in under 30 minutes. No IT required.",
    Icon:   TuneOutlined,
  },
  {
    number: "02",
    tag:    "Automated",
    label:  "AI Agents Interview Candidates",
    desc:   "Your AI recruiter runs 24/7 — assessing technical depth, soft skills, and culture fit through natural conversation, at scale, without bias.",
    Icon:   PsychologyOutlined,
  },
  {
    number: "03",
    tag:    "Decision",
    label:  "Review & Hire",
    desc:   "Receive auto-ranked shortlists with blockchain-verified credentials. Compare candidates side-by-side and extend offers with full confidence.",
    Icon:   WorkspacePremiumOutlined,
  },
];

export default function GradientStepper() {
  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      {STEPS.map((step, i) => (
        <motion.div
          key={step.number}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 0.55, delay: i * 0.12, ease }}
        >
          <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, alignItems: "flex-start" }}>

            {/* ── Left: circle + connector line ── */}
            <Box sx={{
              display: "flex", flexDirection: "column",
              alignItems: "center", flexShrink: 0, pt: 0.5,
            }}>
              {/* Icon circle */}
              <Box sx={{
                width: { xs: 44, md: 52 },
                height: { xs: 44, md: 52 },
                borderRadius: "50%",
                bgcolor: ACCENT,
                boxShadow: `0 0 0 6px rgba(156,163,175,0.12)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <step.Icon sx={{ fontSize: { xs: 20, md: 24 }, color: "#fff" }} />
              </Box>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <Box sx={{
                  width: "2px",
                  flex: 1,
                  minHeight: { xs: 48, md: 56 },
                  mt: 1, mb: 1,
                  background: `linear-gradient(180deg, #9CA3AF 0%, rgba(156,163,175,0.12) 100%)`,
                  borderRadius: "2px",
                }} />
              )}
            </Box>

            {/* ── Right: card ── */}
            <Box sx={{ flex: 1, mb: i < STEPS.length - 1 ? { xs: 3, md: 4 } : 0 }}>
              <motion.div
                whileHover={{ x: 4, transition: { type: "spring", stiffness: 300, damping: 22 } }}
              >
                <Box sx={{
                  bgcolor: "#fff",
                  borderRadius: "20px",
                  border: "1px solid #E5E7EB",
                  p: { xs: 2.5, md: 3.5 },
                  position: "relative", overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    borderColor: "rgba(0,0,0,0.18)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  },
                }}>

                  {/* Top gradient bar */}
                  <Box sx={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                    background: `linear-gradient(90deg, #D1D5DB 0%, rgba(209,213,219,0.15) 100%)`,
                    borderRadius: "20px 20px 0 0",
                  }} />

                  {/* Watermark number */}
                  <Typography sx={{
                    position: "absolute", bottom: -10, right: 16,
                    fontFamily: "Poppins", fontWeight: 900,
                    fontSize: "80px", lineHeight: 1,
                    color: "rgba(0,0,0,0.04)",
                    letterSpacing: "-4px", userSelect: "none", pointerEvents: "none",
                  }}>
                    {step.number}
                  </Typography>

                  {/* Tag row */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    <Box sx={{
                      display: "inline-flex", alignItems: "center",
                      bgcolor: ACCENT_BG, border: `1px solid ${ACCENT_LIGHT}`,
                      borderRadius: "20px", px: 1.5, py: 0.4,
                    }}>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", fontWeight: 700, color: ACCENT, letterSpacing: "0.6px", textTransform: "uppercase" }}>
                        {step.tag}
                      </Typography>
                    </Box>
                    <Typography sx={{
                      fontFamily: "Poppins", fontSize: "11px", fontWeight: 700,
                      color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase",
                    }}>
                      Step {step.number}
                    </Typography>
                  </Box>

                  <Typography sx={{
                    fontFamily: "Poppins", fontWeight: 700,
                    fontSize: { xs: "17px", md: "20px" },
                    color: "#111827", lineHeight: 1.3, mb: 1,
                  }}>
                    {step.label}
                  </Typography>

                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: { xs: "13px", md: "14px" },
                    color: "#6B7280", lineHeight: 1.75,
                  }}>
                    {step.desc}
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}
