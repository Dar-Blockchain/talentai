import React from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StatList from "./components/StatList";
import { useRouter } from "next/router";
import { BOOK_DEMO_URL } from "@/constants";

const HeroSection = () => {
  const router = useRouter();
  return (
    <Box
      sx={{
        px: 3,
        py: {xs: 3, sm: 4, md:5},
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      <Stack direction="row" spacing={2}>
        <Box>
          <Typography
            variant="h3"
            fontWeight={500}
            gutterBottom
            sx={{
              fontSize: 'clamp(1rem, 5vw, 3rem)',
              lineHeight: 1.3,
              mb: 0,
            }}
          >
            Revolutionize Your Hiring with
          </Typography>

          <Typography
            fontWeight={800}
            gutterBottom
            sx={{
              fontSize: 'clamp(1rem, 5vw, 3rem)',
              backgroundColor: "rgba(0, 255, 157, 1)",
              display: "inline-block",
              px: 2,
              py: 1,
              borderRadius: 1,
              lineHeight: 1.3,
              mb: 0,
            }}
          >
            AI-Powered Intelligence
          </Typography>

          <Typography
            variant="body1"
            color="#000000"
            sx={{
              my: { xs: 2, md: 2 },
              maxWidth: 500,
              fontSize: { xs: "0.95rem", sm: "1rem" },
            }}
          >
            Experience 3x faster hiring, 90% better candidate matches, and
            data-driven decisions with our advanced AI recruitment platform.
          </Typography>

          <Stack
            direction="row"
            sx={{flexWrap: "wrap", gap: '1rem', flex: {xs: 1, sm: 1, md: 'none'}}}
            mb={{ xs: 3, md: 4 }}
          >
            <Button
              variant="contained"
              onClick={() => router.push('/signin')}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: 999,
                textTransform: "none",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 1, sm: 1, md: 1.5 },
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.85rem", md: "1rem" },
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
              endIcon={
                <ArrowForwardIcon
                  fontSize="small"
                  sx={{ color: "rgba(0, 255, 157, 1)" }}
                />
              }
            >
              Get Early Access
            </Button>

            <Button
              variant="outlined"
              href={BOOK_DEMO_URL}
              target='_blank'
              sx={{
                borderRadius: 999,
                textTransform: "none",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 1, sm: 1.5, md: 1.5 },
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.85rem", md: "1rem" },
                color: "#000",
                borderColor: "#ccc",
              }}
              endIcon={
                <PlayCircleOutlineIcon sx={{ color: "rgba(0, 255, 157, 1)" }} />
              }
            >
              Book Demo
            </Button>
          </Stack>

          <StatList />
        </Box>

        <Box
          display={{ xs: "none", lg: "flex" }}
          sx={{ justifyContent: "center", flexGrow: 1, position: "relative", pt: 6 }}
        >
          <Box sx={{ position: "relative", width: "90%", height: 450 }}>
            <Box
              component="img"
              src="/images/home/hero.png"
              alt="TalentAI Logo"
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 2,
                position: "relative",
                zIndex: 3,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -20,
                left: "30%",
                width: "90%",
                height: 180,
                backgroundColor: "rgba(0, 255, 157, 0.2)",
                borderRadius: "50%",
                filter: "blur(60px)",
                zIndex: 2,
              }}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default HeroSection;