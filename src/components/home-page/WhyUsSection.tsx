import React from "react";
import {
  Box,
  Typography,
  Stack,
} from "@mui/material";
import GradientStepper from "./components/Stepper";

const WhyUsSection = () => {
  return (
    <Box
      sx={{
        px: 3,
        py: { sm: 4, md: 5 },
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
          fontSize: {
            xs: "2rem",
            sm: "2.5rem",
            md: "3rem",
            lg: "3.25rem",
          },
          lineHeight: 1.3,
          mb: 0,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Why Choose
        <Box
          component="img"
          src="/logo.svg"
          alt="TalentAI Logo"
          sx={{
            height: "1em",
            display: "inline-block",
          }}
        />
      </Typography>
      <Typography sx={{ mt: 1 }}>
        From Guesswork to Precision—Redefine How You Hire
      </Typography>
      <Stack direction="row" sx={{ alignItems: "center", py: 8 }} spacing={3}>
        <Box>
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
              pt: "-10px"
            }}
          >
            Simplified
            <br />
            Hiring Process
          </Typography>
          <Typography sx={{ mt: 1 }}>
            From Guesswork to Precision
            <br />
            Redefine How You Hire
          </Typography>
        </Box>

        <Box
          sx={{
            transform: "rotate(10deg)",
            flexGrow: 1,
          }}
        >
          <GradientStepper />
        </Box>
      </Stack>
    </Box>
  );
};

export default WhyUsSection;
