import { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlined     from "@mui/icons-material/CancelOutlined";
import CaptchaModal       from "./CaptchaModal";
import { motion }         from "framer-motion";

const ACCENT   = "#0D9488";
const CALENDLY = "https://calendly.com/talent__ai/30min";
const ease     = [0.22, 1, 0.36, 1] as const;
const VP       = { once: true, margin: "-60px" };

const TRUST_BADGES = [
  { icon: <AccessTimeOutlined sx={{ fontSize: 13 }} />, label: "30-minute setup"  },
  { icon: <CancelOutlined     sx={{ fontSize: 13 }} />, label: "Cancel anytime"   },
];

const FinalCTA: React.FC = () => {
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const handleVerified = () => window.open(CALENDLY, "_blank");

  return (
    <Box sx={{ position: "relative", overflow: "hidden", py: { xs: 6, md: 9 } }}>

      {/* ── Full-width background layer ── */}

      {/* Animated grid — drifting */}
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "64px 64px"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px" }}
      />

      {/* Center glow — pulsing */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.5, 0.9] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "80vw", height: "60vh", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(13,148,136,0.14) 0%, transparent 65%)", pointerEvents: "none" }}
      />

      {/* Top-left glow — drifting */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -100, left: -100, width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,148,136,0.13) 0%, transparent 70%)", pointerEvents: "none" }}
      />

      {/* Bottom-right glow — drifting */}
      <motion.div
        animate={{ x: [0, -35, 0], y: [0, -25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: "absolute", bottom: -100, right: -100, width: 450, height: 450, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)", pointerEvents: "none" }}
      />

      {/* Top-right glow — drifting */}
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{ position: "absolute", top: -60, right: "15%", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)", pointerEvents: "none" }}
      />

      {/* Concentric rings — pulsing at different rates */}
      {[
        { size: 500,  dur: 7,  delay: 0 },
        { size: 750,  dur: 10, delay: 1.5 },
        { size: 1050, dur: 13, delay: 3 },
      ].map(({ size, dur, delay }, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.06, 1], opacity: [0.07 - i * 0.02, 0.02, 0.07 - i * 0.02] }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: size, height: size, borderRadius: "50%",
            border: `1px solid rgba(13,148,136,${0.07 - i * 0.02})`, pointerEvents: "none" }}
        />
      ))}

      {/* Sweeping beam */}
      <motion.div
        animate={{ x: ["-130%", "230%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", repeatDelay: 6 }}
        style={{ position: "absolute", top: "-10%", left: 0, width: "28%", height: "120%",
          background: "linear-gradient(105deg, transparent 25%, rgba(13,148,136,0.07) 50%, transparent 75%)",
          transform: "skewX(-12deg)", pointerEvents: "none" }}
      />

      {/* Floating diamonds */}
      <motion.div
        animate={{ y: [0, -24, 0], rotate: [45, 70, 45], opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "10%", left: "5%", width: 60, height: 60,
          border: "1px solid rgba(13,148,136,0.40)", transform: "rotate(45deg)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [45, 20, 45], opacity: [0.10, 0.22, 0.10] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{ position: "absolute", bottom: "15%", right: "6%", width: 44, height: 44,
          border: "1px solid rgba(13,148,136,0.30)", transform: "rotate(45deg)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [45, 65, 45], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        style={{ position: "absolute", top: "55%", right: "3%", width: 32, height: 32,
          border: "1px solid rgba(13,148,136,0.25)", transform: "rotate(45deg)", pointerEvents: "none" }}
      />

      {/* ── Content ── */}
      <Box sx={{
        maxWidth: 1200, mx: "auto",
        px: { xs: 3, md: 8 },
        textAlign: "center",
        position: "relative",
      }}>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.6, ease }}
      >
        {/* Overline */}
        <Box sx={{
          display: "inline-flex", alignItems: "center",
          bgcolor: "rgba(13,148,136,0.10)", border: "1.5px solid rgba(13,148,136,0.35)",
          borderRadius: "24px", px: 2.5, py: 0.9, mb: 3,
        }}>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 700, color: ACCENT, letterSpacing: "1.2px", textTransform: "uppercase" }}>
            Don't Wait
          </Typography>
        </Box>

        {/* Headline */}
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 800,
          fontSize: { xs: "28px", sm: "36px", md: "52px" },
          lineHeight: 1.1, color: "#fff",
          letterSpacing: { xs: "-0.5px", md: "-1px" },
          mb: 2, mx: "auto", maxWidth: 780,
        }}>
          Your Next Great Hire Is Waiting.{" "}
          <Box component="span" sx={{ color: ACCENT }}>
            Your Competitors Aren't.
          </Box>
        </Typography>

        {/* Body */}
        <Typography sx={{
          fontFamily: "Poppins", fontSize: { xs: "15px", md: "17px" },
          color: "rgba(255,255,255,0.45)", lineHeight: 1.75,
          maxWidth: 520, mx: "auto", mb: 5,
        }}>
          While you're reading this, AI-powered companies are already interviewing your candidates.
          TalentAI deploys in 30 minutes. Your first AI interview can happen today.
        </Typography>

        {/* CTA buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
          >
            <Button
              variant="contained"
              onClick={() => setCaptchaOpen(true)}
              sx={{
                bgcolor: ACCENT, color: "#fff",
                fontFamily: "Poppins", fontWeight: 700, fontSize: "15px",
                textTransform: "none", borderRadius: "10px",
                px: 4, py: 1.5,
                boxShadow: `0 4px 20px rgba(13,148,136,0.40)`,
                "&:hover": { bgcolor: ACCENT, boxShadow: `0 8px 30px rgba(13,148,136,0.50)` },
              }}
            >
              Start Hiring Smarter — Free to Try →
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
          >
            <Button
              variant="outlined"
              onClick={() => setCaptchaOpen(true)}
              sx={{
                borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.70)",
                fontFamily: "Poppins", fontWeight: 600, fontSize: "15px",
                textTransform: "none", borderRadius: "10px",
                px: 4, py: 1.5,
                "&:hover": { borderColor: ACCENT, color: ACCENT, bgcolor: "rgba(13,148,136,0.08)" },
              }}
            >
              Book a 15-Minute Strategy Call →
            </Button>
          </motion.div>
        </Stack>

        {/* Trust badges */}
        <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
          {TRUST_BADGES.map((badge) => (
            <Box key={badge.label} sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "rgba(255,255,255,0.30)" }}>
              {badge.icon}
              <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.30)" }}>
                {badge.label}
              </Typography>
            </Box>
          ))}
        </Stack>

      </motion.div>

      <CaptchaModal open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
      </Box>
    </Box>
  );
};

export default FinalCTA;
