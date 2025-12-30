import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const AISpotlight: React.FC = () => {
  return (
    <Box sx={{ px: 3, py: { xs: 3, md: 4 }, mb: { xs: 2, md: 3 } , maxWidth: 1100, mx: 'auto' }}>
      <Box
        sx={{
          backgroundColor: "#121212",
          color: "#fff",
          borderRadius: 2,
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        {/* Left copy */}
        <Box sx={{ maxWidth: 560 }}>
          <Typography
            variant="overline"
            sx={{ color: "#9CA3AF", letterSpacing: 1, fontWeight: 600 }}
          >
            AI SPOTLIGHT
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mt: 1,
              fontFamily:
                'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            Intelligent Recruitment Workflows
            <br />
            That Work Around the Clock
          </Typography>
          <Typography sx={{ mt: 1.5, color: "#D1D5DB" }}>
            Deploy AI-powered automation across your entire hiring funnel - from initial
            candidate outreach to final offer acceptance.
          </Typography>

          {/* <Button
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "#ffffff",
              color: "#111827",
              borderRadius: 2,
              textTransform: "none",
              px: 2.5,
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
            endIcon={<ArrowForwardIcon />}
            href="#features"
          >
            Explore the product
          </Button> */}
        </Box>

        {/* Right AI Spotlight Image */}
        <Box
          sx={{
            flex: 1,
            minHeight: 160,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <img
            src="/images/home/AiSpotlight.png"
            alt="AI Spotlight Dashboard"
            style={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: 200,
              borderRadius: '8px'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AISpotlight;


