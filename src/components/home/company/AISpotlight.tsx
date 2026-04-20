import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import WarningAmberOutlined  from "@mui/icons-material/WarningAmberOutlined";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

const ACCENT    = "#0D9488";
const ACCENT_BG = "rgba(13,148,136,0.10)";
const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { target: 42,  suffix: "+",  unit: "days",    label: "Average hiring cycle",        bar: 72, color: "#F87171" },
  { target: 500, prefix: "$",  unit: "/ day",   label: "Lost per open role daily",    bar: 85, color: "#FB923C" },
  { target: 25,  prefix: "$",  suffix: "K",     label: "Cost of one bad hire",        bar: 60, color: "#FBBF24" },
  { target: 200, suffix: "+",  unit: "resumes", label: "Screened manually per role",  bar: 90, color: "#A78BFA" },
];

const PAIN_POINTS = [
  "Top candidates accept competing offers in under 14 days",
  "HR teams spend 23+ hours per week just scheduling interviews",
  "39% of hires underperform due to inconsistent evaluation",
];

/* ── Animated counter ─────────────────────────────── */
const Counter: React.FC<{
  target: number; prefix?: string; suffix?: string;
  color: string; started: boolean;
}> = ({ target, prefix = "", suffix = "", color, started }) => {
  const raw = useMotionValue(0);
  const num = useTransform(raw, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (started) animate(raw, target, { duration: 1.6, ease: "easeOut" });
  }, [started, raw, target]);

  return (
    <Box sx={{ display: "inline-flex", alignItems: "baseline", gap: 0.25 }}>
      {prefix && (
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "14px", color, lineHeight: 1 }}>
          {prefix}
        </Typography>
      )}
      <motion.span style={{
        fontFamily: "Poppins", fontWeight: 900,
        fontSize: "clamp(24px, 3vw, 32px)", lineHeight: 1, color,
      }}>
        {num}
      </motion.span>
      {suffix && (
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "14px", color, lineHeight: 1 }}>
          {suffix}
        </Typography>
      )}
    </Box>
  );
};

/* ── Stat row ─────────────────────────────────────── */
const StatRow: React.FC<{ stat: typeof STATS[number]; index: number; started: boolean }> = ({ stat, index, started }) => (
  <motion.div
    variants={{
      hidden:  { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.45, delay: index * 0.09, ease } },
    }}
  >
    <Box sx={{
      display: "flex", alignItems: "center", gap: 2,
      px: 2.5, py: 2,
      borderRadius: "12px",
      bgcolor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      transition: "background 0.2s, border-color 0.2s",
      "&:hover": {
        bgcolor: "rgba(255,255,255,0.05)",
        borderColor: `${stat.color}30`,
      },
    }}>
      {/* Left accent bar */}
      <Box sx={{ width: "3px", height: 40, borderRadius: "3px", bgcolor: stat.color, flexShrink: 0, opacity: 0.85 }} />

      {/* Number */}
      <Box sx={{ minWidth: 90, flexShrink: 0 }}>
        <Counter
          target={stat.target}
          prefix={stat.prefix}
          suffix={stat.suffix}
          color={stat.color}
          started={started}
        />
        {stat.unit && (
          <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", color: "rgba(255,255,255,0.30)", mt: 0.1 }}>
            {stat.unit}
          </Typography>
        )}
      </Box>

      {/* Label + bar */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{
          fontFamily: "Poppins", fontSize: "12.5px", fontWeight: 600,
          color: "rgba(255,255,255,0.65)", lineHeight: 1.3, mb: 0.75,
        }}>
          {stat.label}
        </Typography>
        <Box sx={{ height: "3px", width: "100%", bgcolor: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={started ? { width: `${stat.bar}%` } : { width: 0 }}
            transition={{ duration: 1.4, delay: 0.3 + index * 0.1, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${stat.color}, ${stat.color}55)`,
              borderRadius: 2,
            }}
          />
        </Box>
      </Box>
    </Box>
  </motion.div>
);

/* ── Main component ───────────────────────────────── */
const AISpotlight: React.FC = () => {
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Box ref={ref} sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 6, md: 8 },
        alignItems: "center",
      }}>

        {/* ── LEFT: copy ── */}
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VP}
          transition={{ duration: 0.65, ease }}
        >
          {/* Overline */}
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            bgcolor: ACCENT_BG, border: "1.5px solid rgba(13,148,136,0.40)",
            borderRadius: "24px", px: 2.5, py: 0.9, mb: 3,
          }}>
            <WarningAmberOutlined sx={{ fontSize: 14, color: ACCENT }} />
            <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 700, color: ACCENT, letterSpacing: "0.8px", textTransform: "uppercase" }}>
              The Hiring Crisis Is Real
            </Typography>
          </Box>

          {/* Headline */}
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 800,
            fontSize: { xs: "26px", sm: "32px", md: "42px" },
            lineHeight: 1.12, color: "#fff", mb: 2,
            letterSpacing: "-0.5px",
          }}>
            200+ Resumes.{" "}
            <Box component="span" sx={{
              color: ACCENT,
              textShadow: "0 0 32px rgba(13,148,136,0.45)",
            }}>
              Zero Time.
            </Box>
            <br />
            Your Best Hire Just{" "}
            <Box component="span" sx={{ color: "rgba(255,255,255,0.55)" }}>
              Accepted Another Offer.
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography sx={{
            fontFamily: "Poppins", fontSize: { xs: "14px", md: "15px" },
            color: "rgba(255,255,255,0.40)", lineHeight: 1.75, mb: 3.5, maxWidth: 440,
          }}>
            Every minute your seat stays empty, your competitors get stronger. Here's what slow hiring is costing you right now.
          </Typography>

          {/* Pain points */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {PAIN_POINTS.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VP}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box sx={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0, mt: 0.15,
                    bgcolor: "rgba(248,113,113,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#F87171" }} />
                  </Box>
                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: "13px",
                    color: "rgba(255,255,255,0.50)", lineHeight: 1.55,
                  }}>
                    {point}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* ── RIGHT: damage report card ── */}
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VP}
          transition={{ duration: 0.65, delay: 0.15, ease }}
        >
          <Box sx={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            bgcolor: "#0A0B0C",
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
          }}>

            {/* Card header */}
            <Box sx={{
              px: 3, py: 1.75,
              bgcolor: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", gap: 0.6 }}>
                  {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
                    <Box key={c} sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: c, opacity: 0.85 }} />
                  ))}
                </Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.22)" }}>
                  hiring_damage_report.live
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#F87171" }} />
                </motion.div>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.5px" }}>
                  LIVE
                </Typography>
              </Box>
            </Box>

            {/* Stat rows */}
            <Box sx={{ p: 2 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={VP}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {STATS.map((s, i) => (
                    <StatRow key={i} stat={s} index={i} started={inView} />
                  ))}
                </Box>
              </motion.div>
            </Box>

            {/* Card footer */}
            <Box sx={{
              px: 3, py: 1.25,
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "10px", color: "rgba(255,255,255,0.18)" }}>
                Industry averages · 2024
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[0.6, 0.35, 0.15].map((o, i) => (
                  <Box key={i} sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#F87171", opacity: o }} />
                ))}
              </Box>
            </Box>
          </Box>
        </motion.div>

      </Box>
    </Box>
  );
};

export default AISpotlight;
