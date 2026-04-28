import { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CaptchaModal from "./CaptchaModal";
import DemoVideoModal from "./DemoVideoModal";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";

const ACCENT   = "#0D9488";
const CALENDLY = "https://calendly.com/talent__ai/30min";

const STAT_TARGETS  = [90, 10, 24, 75];
const STAT_SUFFIXES = ["%", "×", "/7", "%"];

/* ── Animated stat card ──────────────────────────── */
const StatCard: React.FC<{
  target: number; suffix: string;
  label: string; sub: string;
  delay: number; isLast: boolean;
}> = ({ target, suffix, label, sub, delay, isLast }) => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const raw    = useMotionValue(0);
  const num    = useTransform(raw, (v) => Math.round(v).toString());

  useEffect(() => {
    if (inView) animate(raw, target, { duration: 1.8, ease: "easeOut" });
  }, [inView, raw, target]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden:  { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const } },
      }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 340, damping: 20 } }}
    >
      <Box sx={{ px: 2, pl: 0, py: 1, borderRight: isLast ? "none" : "1px solid #E5E7EB" }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.25, mb: 0.75 }}>
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 900,
            fontSize: { xs: "28px", md: "34px" }, lineHeight: 1,
            background: `linear-gradient(135deg, ${ACCENT} 0%, #059669 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            <motion.span>{num}</motion.span>
          </Typography>
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 800,
            fontSize: { xs: "16px", md: "18px" }, lineHeight: 1,
            background: `linear-gradient(135deg, ${ACCENT} 0%, #059669 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {suffix}
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "11.5px", color: "#111827", lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", color: "#9CA3AF", lineHeight: 1.4, mt: 0.4 }}>
          {sub}
        </Typography>
      </Box>
    </motion.div>
  );
};

const fadeUp   = (delay = 0) => ({ initial: { opacity: 0, y: 28 },  animate: { opacity: 1, y: 0 },  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } });
const fadeRight = (delay = 0) => ({ initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } });

const CompanyHeroSection = () => {
  const { t } = useTranslation("home");
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [videoOpen,   setVideoOpen]   = useState(false);

  const handleVerified = () => window.open(CALENDLY, "_blank");

  const STATS = [
    { label: t("hero.stats.screening_label"), sub: t("hero.stats.screening_sub") },
    { label: t("hero.stats.cheaper_label"),   sub: t("hero.stats.cheaper_sub")   },
    { label: t("hero.stats.interviews_label"),sub: t("hero.stats.interviews_sub") },
    { label: t("hero.stats.faster_label"),    sub: t("hero.stats.faster_sub")    },
  ];

  return (
    <Box sx={{
      pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 6 },
      color: "#000000", position: "relative", overflow: "hidden",
      backgroundImage: `
        linear-gradient(0deg, #F2F3F4, #F2F3F4),
        linear-gradient(90deg, rgba(13, 148, 136, 0.12) 1px, transparent 1px),
        linear-gradient(180deg, rgba(13, 148, 136, 0.12) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
      backgroundBlendMode: "overlay",
    }}>
      <Box sx={{
        maxWidth: 1440, mx: "auto", px: { xs: 2, md: 6 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 5, md: 8 }, alignItems: "center",
      }}>

        {/* LEFT column */}
        <Box>
          {/* Headline */}
          <motion.div {...fadeUp(0)}>
            <Typography variant="h1" sx={{
              fontFamily: "Poppins, sans-serif", fontWeight: 700,
              fontSize: { xs: "36px", sm: "44px", md: "52px" },
              lineHeight: 1.08, color: "#111827", mb: 2.5,
            }}>
              {t("hero.headline_1")}
              <br />
              {t("hero.headline_2")}{" "}
              <Box component="span" sx={{ color: ACCENT }}>{t("hero.headline_accent")}</Box>
            </Typography>
          </motion.div>

          {/* Body */}
          <motion.div {...fadeUp(0.12)}>
            <Typography sx={{
              fontFamily: "Poppins, sans-serif",
              fontSize: { xs: "15px", md: "16px" },
              color: "#4B5563", lineHeight: 1.75, mb: 3.5, maxWidth: 520,
            }}>
              {t("hero.body")}{" "}
              <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>
                {t("hero.body_accent")}
              </Box>.
            </Typography>
          </motion.div>

          {/* Buttons */}
          <motion.div {...fadeUp(0.24)}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 1.5 }}>
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{ display: "inline-flex" }}
              >
                <Button
                  variant="contained" onClick={() => setCaptchaOpen(true)}
                  sx={{
                    backgroundColor: ACCENT, color: "#fff",
                    boxShadow: `0 4px 18px ${ACCENT}55`, borderRadius: "10px",
                    textTransform: "none", fontFamily: "Poppins", fontWeight: 700,
                    fontSize: "15px", px: 3.5, py: 1.25,
                    "&:hover": { backgroundColor: ACCENT, boxShadow: `0 8px 28px ${ACCENT}77` },
                  }}
                >
                  {t("hero.cta_primary")}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{ display: "inline-flex" }}
              >
                <Button
                  variant="outlined" onClick={() => setVideoOpen(true)}
                  startIcon={<PlayCircleOutlineIcon />}
                  sx={{
                    border: `2px solid ${ACCENT}`, color: "black", borderRadius: "10px",
                    textTransform: "none", fontFamily: "Poppins", fontWeight: 500,
                    fontSize: "15px", px: 3.5, py: 1.25,
                    "&:hover": { border: `2px solid ${ACCENT}`, backgroundColor: ACCENT, color: "#fff" },
                  }}
                >
                  {t("hero.cta_demo")}
                </Button>
              </motion.div>
            </Stack>
          </motion.div>

          {/* Trust line */}
          <motion.div {...fadeUp(0.32)}>
            <Typography sx={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", color: "#9CA3AF", mb: 5 }}>
              {t("hero.trust")}
            </Typography>
          </motion.div>

          {/* Stats row */}
          <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 3 }}>
            <motion.div
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.42 } } }}
            >
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
                {STATS.map((s, i) => (
                  <StatCard
                    key={i}
                    target={STAT_TARGETS[i]}
                    suffix={STAT_SUFFIXES[i]}
                    label={s.label}
                    sub={s.sub}
                    delay={0.42 + i * 0.1}
                    isLast={i === STATS.length - 1}
                  />
                ))}
              </Box>
            </motion.div>
          </Box>
        </Box>

        {/* RIGHT column */}
        <motion.div {...fadeRight(0.18)} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ display: { xs: "none", md: "block" }, position: "relative", width: "110%", ml: "auto" }}>
            <img
              src="/images/home/HeroSectionLanding.png"
              alt="TalentAI Dashboard"
              style={{ width: "100%", height: "auto", borderRadius: "12px", display: "block" }}
            />
          </Box>
        </motion.div>

      </Box>

      <CaptchaModal open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
      <DemoVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </Box>
  );
};

export default CompanyHeroSection;
