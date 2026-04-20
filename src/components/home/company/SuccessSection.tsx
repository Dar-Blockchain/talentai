import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";

const VP   = { once: true, margin: "-60px" };
const ease = [0.22, 1, 0.36, 1] as const;

const ROWS = [
  {
    metric:  "Time to fill a role",
    before:  "42 days",
    after:   "10 days",
    delta:   "−76%",
    color:   "#4ADE80",     // green
    colorBg: "rgba(74,222,128,0.12)",
  },
  {
    metric:  "Weekly scheduling hours",
    before:  "23 hrs / week",
    after:   "0 hrs",
    delta:   "Automated",
    color:   "#38BDF8",     // sky blue
    colorBg: "rgba(56,189,248,0.12)",
  },
  {
    metric:  "Poor hire rate",
    before:  "39%",
    after:   "< 5%",
    delta:   "−89%",
    color:   "#4ADE80",
    colorBg: "rgba(74,222,128,0.12)",
  },
  {
    metric:  "Interview consistency",
    before:  "40%",
    after:   "98%",
    delta:   "+145%",
    color:   "#A78BFA",     // violet
    colorBg: "rgba(167,139,250,0.12)",
  },
  {
    metric:  "Candidate shortlisting",
    before:  "200+ reviewed",
    after:   "5 top-ranked",
    delta:   "10× faster",
    color:   "#FB923C",     // orange
    colorBg: "rgba(251,146,60,0.12)",
  },
];

const HEADLINE_STATS = [
  { value: "4×",    label: "faster hiring",    color: "#4ADE80" },
  { value: "75%",   label: "less manual work", color: "#38BDF8" },
  { value: "< 5%",  label: "bad hire rate",    color: "#A78BFA" },
];

export default function SuccessSection() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.6, ease }}
      >
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <Box sx={{
            display: "inline-flex", alignItems: "center",
            bgcolor: "rgba(13,148,136,0.08)", border: "1.5px solid rgba(13,148,136,0.35)",
            borderRadius: "24px", px: 2.5, py: 0.9, mb: 2,
          }}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: 700, color: "#0D9488", letterSpacing: "0.9px", textTransform: "uppercase" }}>
              The Transformation
            </Typography>
          </Box>
          <Typography sx={{
            fontFamily: "Poppins", fontWeight: 700,
            fontSize: { xs: "26px", md: "44px" },
            lineHeight: 1.15, color: "#111827", mb: 1,
          }}>
            The Numbers Speak{" "}
            <Box component="span" sx={{ color: "#0D9488" }}>for Themselves</Box>
          </Typography>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "15px", color: "#9CA3AF", maxWidth: 460 }}>
            Real outcomes from teams that made the switch.
          </Typography>
        </Box>
      </motion.div>

      {/* ── Terminal card ── */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VP}
        transition={{ duration: 0.7, delay: 0.1, ease }}
      >
        <Box sx={{
          borderRadius: "20px",
          bgcolor: "#0F172A",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
          mb: { xs: 3, md: 4 },
        }}>

          {/* ── Window bar ── */}
          <Box sx={{
            px: 3, py: 1.5,
            bgcolor: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 1.5,
          }}>
            <Box sx={{ display: "flex", gap: 0.75 }}>
              {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
                <Box key={c} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c, opacity: 0.85 }} />
              ))}
            </Box>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Typography sx={{
                fontFamily: "monospace", fontSize: "12px",
                color: "rgba(255,255,255,0.25)", letterSpacing: "0.5px",
              }}>
                hiring_performance_report.exe
              </Typography>
            </Box>
          </Box>

          {/* ── Column labels ── */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr 80px", md: "2fr 1.5fr 1.5fr 100px" },
            px: { xs: 2, md: 3 }, py: 1.25,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["Metric", "Before", "After", "Change"].map((h, i) => (
              <Typography key={h} sx={{
                fontFamily: "Poppins", fontSize: "10px", fontWeight: 700,
                color: "rgba(255,255,255,0.22)", letterSpacing: "1px",
                textTransform: "uppercase",
                display: i === 1 && { xs: "none", md: "block" } as any,
                textAlign: i === 3 ? "right" : "left",
              }}>
                {h}
              </Typography>
            ))}
          </Box>

          {/* ── Rows ── */}
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VP}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08, ease }}
            >
              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr 80px", md: "2fr 1.5fr 1.5fr 100px" },
                alignItems: "center",
                px: { xs: 2, md: 3 }, py: { xs: 1.75, md: 2 },
                borderBottom: i < ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                transition: "background 0.18s",
                "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
              }}>

                {/* Metric */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{
                    width: 6, height: 6, borderRadius: "50%",
                    bgcolor: row.color, flexShrink: 0,
                    boxShadow: `0 0 6px ${row.color}`,
                  }} />
                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: { xs: "13px", md: "14px" },
                    fontWeight: 500, color: "rgba(255,255,255,0.75)",
                  }}>
                    {row.metric}
                  </Typography>
                </Box>

                {/* Before — hidden on mobile */}
                <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: "13px",
                    color: "rgba(255,255,255,0.22)",
                    fontWeight: 400,
                    textDecoration: "line-through",
                    textDecorationColor: "rgba(255,255,255,0.15)",
                  }}>
                    {row.before}
                  </Typography>
                </Box>

                {/* After */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ArrowForwardOutlined sx={{
                    fontSize: 13,
                    color: row.color,
                    opacity: 0.7,
                    display: { xs: "none", md: "block" },
                  }} />
                  <Typography sx={{
                    fontFamily: "Poppins", fontSize: { xs: "13px", md: "14px" },
                    fontWeight: 700, color: "#fff",
                  }}>
                    {row.after}
                  </Typography>
                </Box>

                {/* Delta badge */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center",
                    bgcolor: row.colorBg, border: `1px solid ${row.color}28`,
                    borderRadius: "20px", px: 1.5, py: 0.45,
                  }}>
                    <Typography sx={{
                      fontFamily: "Poppins", fontSize: { xs: "11px", md: "12px" },
                      fontWeight: 700, color: row.color,
                      whiteSpace: "nowrap",
                    }}>
                      {row.delta}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </motion.div>

      {/* ── Headline stats strip ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: { xs: 1.5, md: 2 } }}>
          {HEADLINE_STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            >
              <Box sx={{
                position: "relative",
                borderRadius: "18px",
                bgcolor: "#fff",
                border: "1px solid #F0F0F0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                px: { xs: 2, md: 3.5 }, py: { xs: 3, md: 4 },
                textAlign: "center", overflow: "hidden",
                transition: "box-shadow 0.22s, border-color 0.22s",
                "&:hover": {
                  boxShadow: "0 10px 36px rgba(0,0,0,0.09)",
                  borderColor: `${s.color}40`,
                },
              }}>
                {/* Top accent bar */}
                <Box sx={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                  background: `linear-gradient(90deg, ${s.color} 0%, ${s.color}55 100%)`,
                }} />

                {/* Soft color wash */}
                <Box sx={{
                  position: "absolute", bottom: -30, right: -30,
                  width: 120, height: 120, borderRadius: "50%",
                  background: `radial-gradient(circle, ${s.color}14 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />

                {/* Value */}
                <Typography sx={{
                  fontFamily: "Poppins", fontWeight: 900,
                  fontSize: { xs: "32px", md: "44px" },
                  lineHeight: 1, mb: 0.75,
                  color: s.color,
                  letterSpacing: "-1px",
                }}>
                  {s.value}
                </Typography>

                {/* Label */}
                <Typography sx={{
                  fontFamily: "Poppins", fontWeight: 600,
                  fontSize: { xs: "12px", md: "13px" },
                  color: "#374151", lineHeight: 1.3,
                  textTransform: "capitalize",
                }}>
                  {s.label}
                </Typography>
              </Box>
            </motion.div>
          ))}
      </Box>
    </Box>
  );
}
