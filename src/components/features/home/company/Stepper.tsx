import { Box, Typography } from "@mui/material";
import TuneOutlined            from "@mui/icons-material/TuneOutlined";
import PsychologyOutlined       from "@mui/icons-material/PsychologyOutlined";
import WorkspacePremiumOutlined from "@mui/icons-material/WorkspacePremiumOutlined";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const ACCENT       = "#9CA3AF";
const ACCENT_BG    = "rgba(156,163,175,0.10)";
const ACCENT_LIGHT = "rgba(156,163,175,0.25)";
const ease = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, margin: "-60px" };

const STEP_ICONS = [TuneOutlined, PsychologyOutlined, WorkspacePremiumOutlined];
const STEP_NUMBERS = ["01", "02", "03"];

export default function GradientStepper() {
  const { t } = useTranslation("home");

  const steps = [
    { number: STEP_NUMBERS[0], tag: t("plan.step_1_tag"), label: t("plan.step_1_label"), desc: t("plan.step_1_desc"), Icon: STEP_ICONS[0] },
    { number: STEP_NUMBERS[1], tag: t("plan.step_2_tag"), label: t("plan.step_2_label"), desc: t("plan.step_2_desc"), Icon: STEP_ICONS[1] },
    { number: STEP_NUMBERS[2], tag: t("plan.step_3_tag"), label: t("plan.step_3_label"), desc: t("plan.step_3_desc"), Icon: STEP_ICONS[2] },
  ];

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      {steps.map((step, i) => (
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

              {i < steps.length - 1 && (
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
            <Box sx={{ flex: 1, mb: i < steps.length - 1 ? { xs: 3, md: 4 } : 0 }}>
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
                  <Box sx={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                    background: `linear-gradient(90deg, #D1D5DB 0%, rgba(209,213,219,0.15) 100%)`,
                    borderRadius: "20px 20px 0 0",
                  }} />

                  <Typography sx={{
                    position: "absolute", bottom: -10, right: 16,
                    fontFamily: "Poppins", fontWeight: 900,
                    fontSize: "80px", lineHeight: 1,
                    color: "rgba(0,0,0,0.04)",
                    letterSpacing: "-4px", userSelect: "none", pointerEvents: "none",
                  }}>
                    {step.number}
                  </Typography>

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
                      {t("plan.step_prefix")} {step.number}
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
