import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import PlayArrowRounded    from "@mui/icons-material/PlayArrowRounded";
import CaptchaModal   from "./CaptchaModal";
import DemoVideoModal from "./DemoVideoModal";
import { motion } from "framer-motion";

const ACCENT    = "#0D9488";
const ACCENT_BG = "rgba(13,148,136,0.08)";
const CALENDLY  = "https://calendly.com/talent__ai/30min";
const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;

const BULLETS = [
  "AI Video Interviews — No Scheduling Needed",
  "Drag-&-Drop Pipeline, Live in 30 Minutes",
  "Auto-Ranked Shortlists — You Just Approve",
  "Pay-Per-Hire Credits, No Bloated Contracts",
];

const PILLS = [
  { label: "Technical", icon: "/icons/technical.svg" },
  { label: "Task",      icon: "/icons/task.svg" },
  { label: "Soft",      icon: "/icons/soft.svg" },
  { label: "Condition", icon: "/icons/condition.svg" },
  { label: "HR",        icon: "/icons/hr.svg" },
  { label: "Email",     icon: "/icons/email.svg" },
];

const QUICK_STATS = [
  { value: "75%",     label: "less hiring work" },
  { value: "30 min",  label: "to go live" },
  { value: "10×",     label: "faster shortlisting" },
];

const BiasFreeEvaluation: React.FC = () => {
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [videoOpen,   setVideoOpen]   = useState(false);

  const handleVerified = () => window.open(CALENDLY, "_blank");

  return (
    <Box id="features" sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.6, ease }}
      >
        <Box sx={{ mb: { xs: 5, md: 7 } }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center",
            bgcolor: ACCENT_BG, border: "1.5px solid rgba(13,148,136,0.40)",
            borderRadius: "24px", px: 2.5, py: 0.9, mb: 2.5,
          }}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: 700, color: ACCENT, letterSpacing: "0.8px", textTransform: "uppercase" }}>
              The Solution
            </Typography>
          </Box>
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 700,
            fontSize: { xs: "26px", md: "42px" },
            lineHeight: 1.15, color: "#111827", mb: 1.5,
          }}>
            Stop Guessing.{" "}
            <Box component="span" sx={{ color: ACCENT }}>Start Hiring With Confidence.</Box>
          </Typography>
          <Typography sx={{
            fontFamily: "Poppins", fontSize: { xs: "15px", md: "16px" },
            lineHeight: 1.65, color: "#6B7280", maxWidth: 560,
          }}>
            AI-driven interviews and blockchain-verified proof — every hire based on performance, not paperwork.
          </Typography>
        </Box>
      </motion.div>

      {/* ── Two-column body ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 5, md: 8 },
        alignItems: "start",
      }}>

        {/* ── LEFT — video card + quick stats ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VP}
          transition={{ duration: 0.65, ease }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Video card with play overlay */}
            <Box
              onClick={() => setVideoOpen(true)}
              sx={{
                position: "relative", borderRadius: "16px", overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(13,148,136,0.14)",
                transition: "box-shadow 0.25s, transform 0.25s",
                "&:hover": {
                  boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(13,148,136,0.35)",
                  transform: "translateY(-3px)",
                },
                "&:hover .play-btn": {
                  transform: "scale(1.12)",
                  boxShadow: `0 0 0 10px rgba(13,148,136,0.22)`,
                },
              }}
            >
              <img
                src="/images/home/Iframe.png"
                alt="AI Interview Demo"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              {/* Dark overlay */}
              <Box sx={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.15) 100%)",
              }} />
              {/* Play button */}
              <Box sx={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Box className="play-btn" sx={{
                  width: 60, height: 60, borderRadius: "50%",
                  bgcolor: ACCENT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 0 8px rgba(13,148,136,0.25)`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}>
                  <PlayArrowRounded sx={{ fontSize: 30, color: "#fff", ml: "3px" }} />
                </Box>
              </Box>
              {/* Top-left badge */}
              <Box sx={{
                position: "absolute", top: 14, left: 14,
                bgcolor: "rgba(13,148,136,0.90)", borderRadius: "8px",
                px: 1.5, py: 0.5, backdropFilter: "blur(8px)",
              }}>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>
                  LIVE DEMO
                </Typography>
              </Box>
            </Box>

            {/* Quick stats row */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
            >
              <Box sx={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                borderRadius: "14px", overflow: "hidden",
                border: "1px solid #E5E7EB",
              }}>
                {QUICK_STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } }}
                  >
                    <Box sx={{
                      px: 2, py: 2, textAlign: "center",
                      bgcolor: "#fff",
                      borderRight: i < 2 ? "1px solid #E5E7EB" : "none",
                    }}>
                      <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "20px", color: ACCENT, lineHeight: 1 }}>
                        {s.value}
                      </Typography>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "#9CA3AF", mt: 0.5, lineHeight: 1.3 }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
        </motion.div>

        {/* ── RIGHT — bullets + module grid ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VP}
          transition={{ duration: 0.65, delay: 0.1, ease }}
        >
          <Box>
            <Typography sx={{
              fontFamily: "Poppins", fontWeight: 700,
              fontSize: { xs: "20px", md: "26px" },
              lineHeight: 1.25, color: "#111827", mb: 0.75,
            }}>
              Every Candidate Evaluated{" "}
              <Box component="span" sx={{ color: ACCENT }}>on Merit. Nothing Else.</Box>
            </Typography>
            <Typography sx={{
              fontFamily: "Poppins", fontSize: "14px",
              color: "#6B7280", lineHeight: 1.65, mb: 3.5,
            }}>
              Same criteria, every time — skills, communication, culture fit. Zero gut-feel overrides.
            </Typography>

            {/* Bullets */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
            >
              <Stack spacing={1.25} sx={{ mb: 4 }}>
                {BULLETS.map((b) => (
                  <motion.div
                    key={b}
                    variants={{ hidden: { opacity: 0, x: 16 }, visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease } } }}
                  >
                    <Box sx={{
                      display: "flex", alignItems: "center", gap: 1.5,
                      px: 2, py: 1.25, borderRadius: "10px",
                      bgcolor: "#fff", border: "1px solid #E5E7EB",
                      transition: "border-color 0.18s",
                      "&:hover": { borderColor: "rgba(13,148,136,0.30)" },
                    }}>
                      <CheckCircleOutlined sx={{ fontSize: 17, color: ACCENT, flexShrink: 0 }} />
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "13.5px", fontWeight: 500, color: "#374151", lineHeight: 1.4 }}>
                        {b}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>

            

            {/* CTA */}
            <Box sx={{ mt: 3.5 }}>
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{ display: "inline-block" }}
              >
                <Button
                  variant="contained"
                  onClick={() => setCaptchaOpen(true)}
                  sx={{
                    bgcolor: ACCENT, color: "#fff",
                    fontFamily: "Poppins", fontWeight: 700, fontSize: "15px",
                    textTransform: "none", borderRadius: "10px",
                    px: 4, py: 1.6,
                    boxShadow: `0 4px 18px rgba(13,148,136,0.40)`,
                    "&:hover": { bgcolor: ACCENT, boxShadow: `0 6px 24px rgba(13,148,136,0.50)` },
                  }}
                >
                  Start Hiring Smarter — Free to Try →
                </Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <CaptchaModal  open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
      <DemoVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </Box>
  );
};

export default BiasFreeEvaluation;
