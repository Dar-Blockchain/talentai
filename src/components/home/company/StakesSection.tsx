import { useState, useEffect, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import AccessTimeOutlined   from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlined       from "@mui/icons-material/CancelOutlined";
import CaptchaModal from "./CaptchaModal";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

const WARN    = "rgba(255,255,255,0.55)";
const WARN_BG = "rgba(255,255,255,0.04)";
const ACCENT  = "#0D9488";
const CALENDLY = "https://calendly.com/talent__ai/30min";
const VP   = { once: true, margin: "-60px" };
const ease = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { target: 500,  prefix: "$", suffix: "+", unit: "per role / day",    desc: "Bleeding budget while the seat stays empty" },
  { target: 25,   prefix: "$", suffix: "K", unit: "per bad hire",       desc: "One wrong call wipes out weeks of profit" },
  { target: 42,   prefix: "",  suffix: "",  unit: "days to hire (avg)", desc: "Your top pick accepted elsewhere on day 14" },
  { target: 24,   prefix: "",  suffix: "%", unit: "YoY automation growth", desc: "Competitors are already moving. Fast." },
];

const TRUST = [
  { icon: <AccessTimeOutlined sx={{ fontSize: 13 }} />, label: "Live in 30 min" },
  { icon: <CancelOutlined     sx={{ fontSize: 13 }} />, label: "Cancel anytime" },
];

/* ── Animated counter ─────────────────────────────────────── */
const Counter: React.FC<{ target: number; prefix: string; suffix: string }> = ({ target, prefix, suffix }) => {
  const ref  = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const raw  = useMotionValue(0);
  const num  = useTransform(raw, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (inView) animate(raw, target, { duration: 1.6, ease: "easeOut" });
  }, [inView, raw, target]);

  return (
    <span ref={ref} style={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
      {prefix}<motion.span>{num}</motion.span>{suffix}
    </span>
  );
};

/* ── Main component ───────────────────────────────────────── */
const StakesSection: React.FC = () => {
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const handleVerified = () => window.open(CALENDLY, "_blank");

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", overflow: "hidden" }}>

      {/* Background glow */}
      <Box sx={{
        position: "absolute", top: "40%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Centered header ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.6, ease }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center",
            bgcolor: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.12)",
            borderRadius: "24px", px: 2.5, py: 0.9, mb: 3,
          }}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.9px", textTransform: "uppercase" }}>
              The Cost of Inaction
            </Typography>
          </Box>

          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 700,
            fontSize: { xs: "26px", sm: "34px", md: "48px" },
            lineHeight: 1.1, color: "#fff", mb: 2,
          }}>
            Every Day You Wait,{" "}
            <Box component="span" sx={{ color: ACCENT }}>
              the Meter Keeps Running.
            </Box>
          </Typography>

          <Typography sx={{
            fontFamily: "Poppins", fontSize: { xs: "15px", md: "16px" },
            color: "rgba(255,255,255,0.40)", maxWidth: 520, mx: "auto",
          }}>
            Here's what slow hiring is actually costing your business — in real numbers.
          </Typography>
        </Box>
      </motion.div>

      {/* ── 4-stat horizontal strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.7, delay: 0.1, ease }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Box sx={{
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          mb: { xs: 4, md: 5 },
          position: "relative",
        }}>
          {/* Top accent line */}
          <Box sx={{
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.20) 30%, rgba(255,255,255,0.20) 70%, transparent 100%)",
          }} />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VP}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
              >
                <Box sx={{
                  px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 },
                  borderRight: {
                    xs: i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    md: i < 3       ? "1px solid rgba(255,255,255,0.06)" : "none",
                  },
                  borderBottom: { xs: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", md: "none" },
                  position: "relative", overflow: "hidden",
                  bgcolor: "rgba(0,0,0,0.15)",
                  transition: "background 0.25s",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  "&:hover .stat-bar": { width: "100%" },
                }}>

                  {/* Corner glow */}
                  <Box sx={{
                    position: "absolute", bottom: -20, right: -20,
                    width: 90, height: 90, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }} />

                  {/* Index number */}
                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: "11px", fontWeight: 700,
                    color: "rgba(255,255,255,0.18)", letterSpacing: "1px", mb: 1.5,
                  }}>
                    0{i + 1}
                  </Typography>

                  {/* Animated stat */}
                  <Typography sx={{
                    fontFamily: "Poppins", fontWeight: 900,
                    fontSize: { xs: "34px", md: "44px" },
                    lineHeight: 1, letterSpacing: "-1.5px", mb: 0.75,
                    color: "#fff",
                  }}>
                    <Counter target={s.target} prefix={s.prefix} suffix={s.suffix} />
                  </Typography>

                  {/* Unit */}
                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: "11px", fontWeight: 600,
                    color: "rgba(255,255,255,0.30)", letterSpacing: "0.6px",
                    textTransform: "uppercase", mb: 2,
                  }}>
                    {s.unit}
                  </Typography>

                  {/* Animated drain bar */}
                  <Box sx={{ width: "100%", height: "2px", bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1, mb: 1.75, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "70%" }}
                      viewport={VP}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                      className="stat-bar"
                      style={{
                        height: "100%",
                        background: "linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08))",
                        borderRadius: 4,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </Box>

                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: "12px",
                    color: "rgba(255,255,255,0.35)", lineHeight: 1.5,
                  }}>
                    {s.desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* Bottom bar */}
          <Box sx={{
            px: 3, py: 1.25,
            bgcolor: "rgba(255,255,255,0.02)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.5px" }}>
              Industry averages · 2024
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {[0.4, 0.22, 0.10].map((o, i) => (
                <Box key={i} sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#fff", opacity: o }} />
              ))}
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* ── Bottom CTA banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.6, delay: 0.2, ease }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: { xs: 3, md: 4 },
          px: { xs: 3, md: 5 }, py: { xs: 3.5, md: 4 },
          borderRadius: "16px",
          bgcolor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderLeft: "3px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{
              fontFamily: "Poppins", fontWeight: 700,
              fontSize: { xs: "18px", md: "22px" },
              color: "#fff", mb: 0.5, lineHeight: 1.3,
            }}>
              The companies automating now{" "}
              <Box component="span" sx={{ color: ACCENT }}>will own the talent market.</Box>
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", color: "rgba(255,255,255,0.38)" }}>
              The ones that don't will keep losing their best candidates to faster competitors.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, alignItems: { xs: "flex-start", md: "flex-end" }, flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowForwardOutlined />}
                onClick={() => setCaptchaOpen(true)}
                sx={{
                  bgcolor: ACCENT, color: "#fff",
                  fontFamily: "Poppins", fontWeight: 700, fontSize: "15px",
                  textTransform: "none", borderRadius: "10px",
                  px: 4, py: 1.5, whiteSpace: "nowrap",
                  boxShadow: `0 4px 18px rgba(13,148,136,0.40)`,
                  "&:hover": { bgcolor: ACCENT, boxShadow: `0 6px 24px rgba(13,148,136,0.50)` },
                }}
              >
                Start Hiring Smarter Today
              </Button>
            </motion.div>
            <Box sx={{ display: "flex", gap: 2.5 }}>
              {TRUST.map((t) => (
                <Box key={t.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ color: "rgba(255,255,255,0.25)" }}>{t.icon}</Box>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>
                    {t.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </motion.div>

      <CaptchaModal open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
    </Box>
  );
};

export default StakesSection;
