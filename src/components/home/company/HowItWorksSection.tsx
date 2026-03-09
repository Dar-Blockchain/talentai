import React from "react";
import { Box, Typography } from "@mui/material";
import GradientStepper from "./Stepper";

const ACCENT    = "rgba(12,218,139,1)";
const ACCENT_BG = "rgba(12,218,139,0.10)";

const SolutionsSection = () => {
  return (
    <Box
      id="howitworks"
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: { xs: 3, md: 5 } }}>
        {/* Overline pill */}
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.75,
          bgcolor: ACCENT_BG, border: "1px solid rgba(12,218,139,0.25)",
          borderRadius: "20px", px: 2, py: 0.5, mb: 2,
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ACCENT }} />
          <Typography sx={{ fontFamily: "Poppins", fontSize: "12px", fontWeight: 600, color: "#059669", letterSpacing: "0.5px" }}>
            The Plan
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: { xs: "26px", md: "38px" },
            lineHeight: 1.2,
            textAlign: "center",
            color: "#111827",
            mb: 1.5,
          }}
        >
          Three Steps From Open Role to Hired
        </Typography>
        <Typography sx={{
          fontFamily: "Poppins",
          fontWeight: 400,
          fontSize: { xs: "15px", md: "17px" },
          lineHeight: 1.65,
          textAlign: "center",
          color: "#4B5563",
          maxWidth: 540,
        }}>
          No ramp-up time. No consultant fees. No process redesign.<br />
          Build your pipeline today. Start interviewing candidates tonight.
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <GradientStepper />
      </Box>
    </Box>
  );
};

export default SolutionsSection;