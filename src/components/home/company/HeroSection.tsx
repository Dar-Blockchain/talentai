import React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";

const CompanyHeroSection = () => {
  return (
    <Box
      sx={{
        px: 3,
        pt: 4,
        color: "#000000",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `
          linear-gradient(0deg, #F2F3F4, #F2F3F4),
          linear-gradient(90deg, rgba(0, 255, 157, 0.12) 1px, transparent 1px),
          linear-gradient(180deg, rgba(0, 255, 157, 0.12) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        backgroundBlendMode: "overlay",
      }}
    >
      <Box sx={{ width: "100%", textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontWeight: 600,
            fontSize: { xs: "32px", sm: "40px", md: "48px" },
            lineHeight: "104%",
            textAlign: "center",
            mb: 3,
          }}
        >
          Stop Losing Top Talent
          <br /> to Slow Hiring
        </Typography>

        <Typography
          variant="body1"
          sx={{
            maxWidth: 720,
            mx: "auto",
            color: "text.secondary",
            mb: 1.5,
            fontFamily: "Poppins, sans-serif",
            fontSize: "16px",
            lineHeight: "24px",
            textAlign: "center",
          }}
        >
          TalentAI's conversational AI agents interview candidates through natural video dialogue, evaluate technical and soft skills in real time, and rank your applicants objectively — cutting your average 42-day hiring cycle by up to 75%.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ mb: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
            sx={{
              backgroundColor: "rgba(12, 218, 139, 1)",
              color: "#0b1b1f",
              boxShadow: "none",
              borderRadius: 0.5,
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 600,
              px: 3,
              "&:hover": { backgroundColor: "rgba(12, 218, 139, 0.7)" },
            }}
          >
            Start Hiring Smarter
          </Button>

          <Button
            variant="outlined"
            onClick={() => window.open("https://calendly.com/talent__ai/30min", "_blank")}
            sx={{
              borderColor: "rgba(12, 218, 139, 1)",
              color: "#0b1b1f",
              borderRadius: 0.5,
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              px: 3,
            }}
          >
            Watch the 2-Min Demo
          </Button>
        </Stack>

        <Typography sx={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", color: "#6B7280", textAlign: "center", mb: { xs: 6, md: 10 } }}>
          No credit card required. Your first pipeline is live in under 30 minutes.
        </Typography>
      </Box>

      {/* Hero screenshot */}
      <Box sx={{ width: "95%", position: "relative", height: { xs: 150, sm: 200, md: 250 }, maxWidth: "1300px", margin: "20px auto", mb: { xs: 4, md: 0 } }}>
        <img
          src="/images/home/heroSection.png"
          alt="TalentAI Dashboard"
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
        />
      </Box>
    </Box>
  );
};

export default CompanyHeroSection;
