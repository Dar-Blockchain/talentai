import React from "react";
import { Box, Typography, Stack, useTheme, useMediaQuery } from "@mui/material";
import GradientStepper from "./Stepper";

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
      id="howitworks"
      sx={{
        px: 3,
        py: { xs: 3, sm: 4, md: 5 },
        color: "#000000",
        display: 'flex',
        flexDirection: 'column',
        mb: 4
      }}
    >
      {" "}
      <Box sx={{display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          mb: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontFamily: "Inter",
  fontWeight: 600,
  fontStyle: "normal",
  fontSize: "36px",
  lineHeight: "43.2px",
  letterSpacing: "0%",
  textAlign: "center",
  verticalAlign: "middle",
        }}
      >
        Hire Better, Faster, Fairer
      </Typography>
      <Typography sx={{ fontFamily: "Fustat",
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: "20px",
  lineHeight: 1.6,
  letterSpacing: 0,
  textAlign: "center", mt: 2 }}>
        From Guesswork to Precision  <br/>
Redefine How You Hire
      </Typography>
      </Box>

        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          <GradientStepper />
        </Box>
    </Box>
  );
};

export default SolutionsSection;