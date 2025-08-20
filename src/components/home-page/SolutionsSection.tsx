import React from "react";
import { Box, Typography, Stack, useTheme, useMediaQuery } from "@mui/material";
import GradientStepper from "./components/Stepper";

type SolutionsSectionProps = {
  color?: string;
  type?: string;
  title?: string;
  subtitle?: string;

};
const SolutionsSection = ({ type, color, title, subtitle }: SolutionsSectionProps) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <Box
      id="solutions"
      sx={{
        px: 3,
        py: { xs: 3, sm: 4, md: 5 },
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      {" "}
      <Typography
        variant="h3"
        fontWeight={600}
        gutterBottom
        sx={{
          fontSize: "clamp(1rem, 7vw, 3.25rem)",
          lineHeight: 1.3,
          mb: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {title}
        {type === "company" && (
          <Box
            component="img"
            src="/logo.svg"
            alt="TalentAI Logo"
            sx={{
              height: "1em",
              display: "inline-block",
            }}
          />)}
      </Typography>
      <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1rem" }, mt: 1 }}>
        {subtitle}
      </Typography>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          pt: { xs: 2, sm: 3, md: 8 },
          pb: { xs: 0, sm: 0, md: 8 },
        }}
        spacing={3}
      >
        <Box sx={{ display: { xs: "none", sm: "none", md: "inline-block" } }}>
          <Typography
            variant="h5"
            fontWeight={400}
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.5rem",
                md: "2rem",
                lg: "2.25rem",
              },
              pt: "-10px",
            }}
          >
            {type === "company" ? <>
              Simplified
              <br />
              Hiring Process
            </> : <>
              Application               <br />
              Process
            </>}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            {type === "company" ? <>
              From Guesswork to Precision
              <br />
              Redefine How You Hire
            </> : <>
              From Resumes to Real Recognition              <br />
              Redefine how you get noticed, <br />  verified, and hired.
            </>}
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          <GradientStepper type={type} />
        </Box>
      </Stack>
    </Box>
  );
};

export default SolutionsSection;
