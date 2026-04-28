import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";

const ACCENT = "#0D9488";
const VP     = { once: true, margin: "-80px" };
const ease   = [0.22, 1, 0.36, 1] as const;

const DRAIN_PER_SECOND = 500 / 86400;

/* ── Animated counter ─────────────────────────────── */
const Counter: React.FC<{ target: number; prefix?: string; suffix?: string; started: boolean; size?: string }> =
  ({ target, prefix = "", suffix = "", started, size = "clamp(32px, 4vw, 48px)" }) => {
  const raw = useMotionValue(0);
  const num = useTransform(raw, (v) => Math.round(v).toLocaleString());
  useEffect(() => { if (started) animate(raw, target, { duration: 1.8, ease: "easeOut" }); }, [started, raw, target]);
  return (
    <Box sx={{ display: "inline-flex", alignItems: "baseline", gap: "2px" }}>
      {prefix && <Typography component="span" sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "85%", color: "inherit", lineHeight: 1 }}>{prefix}</Typography>}
      <motion.span style={{ fontFamily: "Poppins", fontWeight: 900, fontSize: size, lineHeight: 1, color: "inherit" }}>{num}</motion.span>
      {suffix && <Typography component="span" sx={{ fontFamily: "Poppins", fontWeight: 900, fontSize: "85%", color: "inherit", lineHeight: 1 }}>{suffix}</Typography>}
    </Box>
  );
};

/* ── Main component ───────────────────────────────── */
const AISpotlight: React.FC = () => {
  const { t } = useTranslation("home");

  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [elapsed, setElapsed]   = useState(0);
  const [started, setStarted]   = useState(false);
  const startTime                = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    setStarted(true);
    startTime.current = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - startTime.current!) / 1000);
    }, 50);
    return () => clearInterval(id);
  }, [inView]);

  const drainedAmount = (elapsed * DRAIN_PER_SECOND).toFixed(2);

  const STATS = [
    { target: 42,  suffix: "+", unit: t("spotlight.stats.days_unit"),     label: t("spotlight.stats.days_label")   },
    { target: 500, prefix: "$", unit: t("spotlight.stats.cost_unit"),     label: t("spotlight.stats.cost_label")   },
    { target: 25,  prefix: "$", suffix: "K", unit: t("spotlight.stats.bad_hire_unit"), label: t("spotlight.stats.bad_hire_label") },
    { target: 200, suffix: "+", unit: t("spotlight.stats.resumes_unit"),  label: t("spotlight.stats.resumes_label") },
  ];

  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      <Box sx={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 22, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{ position: "absolute", bottom: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)", pointerEvents: "none" }}
      />

      <Box ref={ref} sx={{ maxWidth: 1000, mx: "auto", px: { xs: 3, md: 6 }, py: { xs: 2, md: 3 }, position: "relative", textAlign: "center" }}>

        {/* Overline */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.55, ease }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "24px", px: 2.5, py: 0.85, mb: 3,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }} />
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "1px", textTransform: "uppercase" }}>
              {t("spotlight.overline")}
            </Typography>
          </Box>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.6, delay: 0.05, ease }}>
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 800,
            fontSize: { xs: "28px", sm: "36px", md: "52px" },
            lineHeight: 1.1, color: "#fff", mb: 1.5,
            letterSpacing: { xs: "-0.5px", md: "-1.5px" },
          }}>
            {t("spotlight.headline_1")}{" "}
            <Box component="span" sx={{ color: ACCENT }}>{t("spotlight.headline_accent")}</Box>
          </Typography>
          <Typography sx={{ fontFamily: "Poppins", fontSize: { xs: "14px", md: "16px" }, color: "rgba(255,255,255,0.32)", mb: { xs: 5, md: 7 }, maxWidth: 480, mx: "auto" }}>
            {t("spotlight.body")}
          </Typography>
        </motion.div>

        {/* 4 stats row */}
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.6, delay: 0.1, ease }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            mb: { xs: 5, md: 7 },
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}>
            {STATS.map((s, i) => (
              <Box key={i} sx={{
                px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 },
                borderRight: {
                  xs: i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  md: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                },
                borderBottom: { xs: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", md: "none" },
                position: "relative",
                transition: "background 0.22s",
                "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
              }}>
                <Box sx={{
                  position: "absolute", top: 0, left: "20%", right: "20%", height: "2px",
                  background: `linear-gradient(90deg, transparent, ${ACCENT}60, transparent)`,
                }} />
                <Box sx={{ color: "#fff", mb: 0.75 }}>
                  <Counter target={s.target} prefix={(s as any).prefix} suffix={(s as any).suffix} started={started} />
                </Box>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.30)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {s.unit}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>

        {/* Live drain counter */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.6, delay: 0.2, ease }}>
          <Box sx={{
            mx: "auto", maxWidth: 620,
            px: { xs: 3, md: 5 }, py: { xs: 3, md: 3.5 },
            borderRadius: "16px",
            bgcolor: "rgba(13,148,136,0.05)",
            border: "1px solid rgba(13,148,136,0.18)",
            position: "relative", overflow: "hidden",
          }}>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "16px", boxShadow: `inset 0 0 24px rgba(13,148,136,0.08)`, pointerEvents: "none" }}
            />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.75 }}>
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
              </motion.div>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", textTransform: "uppercase" }}>
                {t("spotlight.drain_label")}
              </Typography>
            </Box>
            <Typography sx={{
              fontFamily: "Poppins", fontWeight: 900,
              fontSize: { xs: "36px", md: "52px" },
              letterSpacing: "-2px", lineHeight: 1,
              color: ACCENT,
            }}>
              ${drainedAmount}
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "11.5px", color: "rgba(255,255,255,0.22)", mt: 0.75 }}>
              {t("spotlight.drain_sub")}
            </Typography>
          </Box>
        </motion.div>

      </Box>
    </Box>
  );
};

export default AISpotlight;
