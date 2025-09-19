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
        py: { xs: 6, md: 10 },
        backgroundColor: "#ffffff",
        color: "#000000",
        position: 'relative',
        overflow: 'hidden',
        ...(type === 'company' && {
          backgroundImage:
            `linear-gradient(#f6f8fb 1px, transparent 1px), linear-gradient(90deg, #f6f8fb 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          backgroundPosition: 'center top',
        })
      }}
    >
      {type === 'company' ? (
        <>
          <Box sx={{ width: '100%', mx: 0, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                fontWeight: 600,
                fontStyle: 'normal',
                fontSize: { xs: '32px', sm: '40px', md: '48px' },
                lineHeight: '164%',
                letterSpacing: 0,
                textAlign: 'center',
                verticalAlign: 'middle',
                mb: 1,
              }}
            >
              Revolutionize Your Hiring
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 720,
                mx: 'auto',
                color: 'text.secondary',
                mb: 3,
                fontFamily: 'Fustat, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0',
                textAlign: 'center',
                verticalAlign: 'middle',
              }}
            >
              Streamline recruitment from sourcing to onboarding with AI-powered workflows that
              cut hiring time in half while finding the perfect candidates every time.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: { xs: 6, md: 10 } }}>
              <Button
                variant="contained"
                onClick={() => router.push('/contact')}
                sx={{
                  backgroundColor: '#22d3a6',
                  color: '#0b1b1f',
                  boxShadow: 'none',
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  '&:hover': { backgroundColor: '#20c39a' }
                }}
              >
                Request a Demo
              </Button>

              <Button
                variant="outlined"
                onClick={() => router.push('/signin')}
                sx={{
                  borderColor: '#0b1b1f',
                  color: '#0b1b1f',
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Get Early Access
              </Button>
            </Stack>
          </Box>

          {/* Showcase cards */}
          <Box sx={{
            width: '100%',
            position: 'relative',
            height: { xs: 200, md: 250 },
          }}>
            {/* Left blur cards */}
            <Box sx={{
              position: 'absolute',
              left: { xs: 8, md: 24 },
              bottom: 0,
              filter: 'blur(3px)',
              opacity: 0.6,
              display: { xs: 'none', md: 'block' },

            }}>
              <Box sx={{
                width: 280,
                height: 250,
                bgcolor: '#fff',
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                p: 2,
                overflow: 'hidden'
              }}>
                <img
                  src="/images/home/Ai.png"
                  alt="AI Insights Blur"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            </Box>

            {/* Center cards */}
            <Box sx={{
              position: 'absolute',
              left: { xs: '50%', md: '50%' },
              transform: 'translateX(-50%)',
              bottom: 0,
              display: 'flex',
              gap: 0,
              animation: 'slideUp 1s ease-out'
            }}>
              {/* Candidate Profile Card */}
              <img
                src="/images/home/Michael.png"
                alt="Michael Brown Profile"
              />

              {/* AI Insights Card - Main focus */}
              <Box sx={{
                width: { xs: 280, md: 320 },
                height: { xs: 200, md: 240 },
                bgcolor: '#fff',
                borderRadius: 3,

                zIndex: 2,

              }}>
                <img
                  src="/images/home/Ai.png"
                  alt="AI Insights Dashboard"

                />
              </Box>

              {/* Hiring Pipeline Card */}
              <img
                src="/images/home/Hiring.png"
                alt="Hiring Pipeline Dashboard"
              />
            </Box>

            {/* Right blur cards */}
            <Box sx={{
              position: 'absolute',
              right: { xs: 8, md: 1 },
              bottom: 0,
              filter: 'blur(3px)',
              opacity: 0.6,
              display: { xs: 'none', md: 'block' },
             
            }}>
              <Box sx={{
                width: 280,
                height: 220,
                bgcolor: '#fff',
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                p: 2,
                overflow: 'hidden'
              }}>
                <img
                  src="/images/home/Michael.png"
                  alt="Michael Brown Profile Blur"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </>
      ) : (
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
            <Box sx={{ position: "relative", width: "90%", height: type === "company" ? "100%" : "450px" }}>
              <img
                src={type === "company" ? "/images/home/jobSeekerImage.jpg" : "/images/home/CompanyImage.jpg"}
                alt="Hero Section"
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
              {/* <Box
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
            /> */}
            </Box>
          </Box>
        </Stack >
      )}
    </Box >
  );
};

export default HeroSection;