import { Box, Typography } from "@mui/material";
import GradientStepper from "./Stepper";
import { motion } from "framer-motion";

const ACCENT    = "#0D9488";
const ACCENT_BG = "rgba(13,148,136,0.08)";
const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;

const SolutionsSection = () => (
  <Box id="howitworks" sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>

    {/* ── Centered header ── */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VP}
      transition={{ duration: 0.6, ease }}
    >
      <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center",
          bgcolor: ACCENT_BG, border: "1.5px solid rgba(13,148,136,0.40)",
          borderRadius: "24px", px: 2.5, py: 0.9, mb: 2.5,
        }}>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "13px", fontWeight: 700, color: ACCENT, letterSpacing: "0.9px", textTransform: "uppercase" }}>
            The Plan
          </Typography>
        </Box>
        <Typography sx={{
          fontFamily: "Poppins", fontWeight: 700,
          fontSize: { xs: "26px", md: "44px" },
          lineHeight: 1.15, color: "#111827", mb: 1.5,
        }}>
          Three Steps From Open Role{" "}
          <Box component="span" sx={{ color: ACCENT }}>to Hired</Box>
        </Typography>
        <Typography sx={{
          fontFamily: "Poppins", fontSize: { xs: "15px", md: "16px" },
          color: "#6B7280", maxWidth: 480, mx: "auto", lineHeight: 1.65,
        }}>
          No ramp-up. No consultant fees. Build your pipeline today, start interviewing tonight.
        </Typography>
      </Box>
    </motion.div>

    <GradientStepper />
  </Box>
);

export default SolutionsSection;
