import React, { useRef, useState } from "react";
import { Box, Button, Typography, Stack, IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import StatList from "./components/StatList";
import { useRouter } from "next/router";
import { BOOK_DEMO_URL } from "@/constants";
type HeroSectionProps = {
  color?: string;
  title?: string;
  subtitle?: string;
  type?: string;
};
const HeroSection = ({ color, title, subtitle, type }: HeroSectionProps) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Box
      sx={{
        px: 3,
        py: { xs: 3, sm: 4, md: 5 },
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box >
          <Typography
            variant="h3"
            fontWeight={500}
            gutterBottom
            sx={{
              fontSize: type === 'company' ? 'clamp(1rem, 5vw, 3rem)' : "96px",
              lineHeight: 1.3,
              fontWeight: type === "jobseeker" ? '700' : 0,
              mb: 0,
            }}
          >
            {title}{type == "jobseeker" && <span style={{ color: color }}>.</span>}
          </Typography>

          <Typography
            fontWeight={800}
            gutterBottom
            sx={{
              fontSize: 'clamp(1rem, 5vw, 3rem)',
              backgroundColor: color,
              display: "inline-block",
              px: 2,
              py: 1,
              borderRadius: 1,
              lineHeight: 1.3,
              mb: 0,
              color: type === "jobseeker" ? "#fff" : "#000",
            }}
          >
            {subtitle}
          </Typography>
          {type === "jobseeker" && (
            <Typography
              variant="body1"
              color="#000000"
              sx={{
                my: { xs: 2, md: 2 },
                maxWidth: 500,
                fontSize: { xs: "0.95rem", sm: "1rem" },
              }}
            >
              Showcase your verified skills, stand out to top recruiters, and control your career—backed by AI and blockchain.
            </Typography>
          )}
          <Stack
            direction="row"
            sx={{ flexWrap: "wrap", gap: '1rem', flex: { xs: 1, sm: 1, md: 'none' }, mt: 3 }}
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
                  sx={{ color: color }}
                />
              }
            >
              {type === "company" ? "Get Early Access" : "Join Talent AI Today"}
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
                borderColor: type === "jobseeker" ? "#8310FF" : "#000",
              }}
              endIcon={
                <PlayCircleOutlineIcon sx={{ color: type === "jobseeker" ? "#8310FF" : "#000" }} />
              }
            >
              {type === "company" ? "Book Demo" : "See How it Works"}
            </Button>
          </Stack>

          <StatList type={type} color={color} />
        </Box>

        <Box
          display={{ xs: "none", lg: "flex" }}
          sx={{
            justifyContent: "center",
            flex: 1,
            position: "relative",
            pt: 6,
          }}
        >
          <Box sx={{ position: "relative", width: "90%", height: 450 }}>
            <video
              ref={videoRef}
              src="/videos/hero.mp4"
              autoPlay={false}
              muted={false}
              loop={false}
              playsInline
              controls={false}
              preload="metadata"
              onEnded={handleVideoEnded}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "16px",
                position: "relative",
                zIndex: 3,
                objectFit: "contain",
                display: "block",
                backgroundColor: "#000"
              }}
            />
            <IconButton
              onClick={handlePlayPause}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 4,
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              {isPlaying ? (
                <PauseCircleOutlineIcon sx={{ fontSize: 48, color: "white" }} />
              ) : (
                <PlayCircleOutlineIcon sx={{ fontSize: 48, color: "white" }} />
              )}
            </IconButton>
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
      </Stack >
    </Box >
  );
};

export default HeroSection;