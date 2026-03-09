import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import { useRouter } from "next/router";
type HeroSectionProps = {
  color?: string;
  title?: string;
  subtitle?: string;
};
const CompanyHeroSection = ({ color, title, subtitle }: HeroSectionProps) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Job search states
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  // Statistics states
  const [stats, setStats] = useState({
    users: "100K+",
    jobs: "20K+",
    companies: "+500",
  });

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

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}post/public-stats`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const { users, posts, companies } = data.data;

            // Format numbers to match the desired style
            const formatNumber = (num: number, prefix: boolean = false) => {
              if (num >= 1000) {
                const formatted = Math.floor(num / 1000);
                return `${formatted}K+`;
              }
              return prefix ? `+${num}` : `${num}+`;
            };

            setStats({
              users: formatNumber(users, false), // e.g., "100K+" or "500+"
              jobs: formatNumber(posts, false), // e.g., "20K+" or "150+"
              companies: formatNumber(companies, true), // e.g., "+500" or "2K+"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
  }, []);

  // Handle job search
  const handleJobSearch = () => {
    const params = new URLSearchParams();
    if (jobTitle) params.append("search", jobTitle);
    if (location) params.append("location", location);
    if (category) params.append("category", category);

    const queryString = params.toString();
    router.push(`/posts${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <Box
      sx={{
        px: 3,
        pt: 4,
        background:
          "linear-gradient(0deg, #F3F7FB, #F3F7FB), linear-gradient(180deg, rgba(255, 255, 255, 0) 59.69%, #FFFFFF 100%)",
        color: "#000000",
        position: "relative",
        overflow: "hidden",
        maxWidth: "98%",
        borderRadius: "10px",
        mx: "auto",
        backgroundImage: `
      linear-gradient(0deg, #F3F7FB, #F3F7FB),
      linear-gradient(90deg, rgba(0, 255, 157, 0.15) 1px, transparent 1px),
      linear-gradient(180deg, rgba(0, 255, 157, 0.15) 1px, transparent 1px)
    `,
        backgroundSize: "80px 80px", // controls grid spacing
        backgroundBlendMode: "overlay",
      }}
    >
      <>
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily:
                'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontWeight: 600,
              fontStyle: "normal",
              fontSize: { xs: "32px", sm: "40px", md: "48px" },
              lineHeight: "104%",
              letterSpacing: 0,
              textAlign: "center",
              verticalAlign: "middle",
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
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "16px",
              lineHeight: "24px",
              letterSpacing: "0",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            TalentAI's conversational AI agents interview candidates through natural video dialogue, evaluate technical and soft skills in real time, and rank your applicants objectively — cutting your average 42-day hiring cycle by up to 75%.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 1.5 }}
          >
            <Button
              variant="contained"
              onClick={() =>
                window.open("https://calendly.com/talent__ai/30min", "_blank")
              }
              sx={{
                backgroundColor: "rgba(12, 218, 139, 1)",
                color: "#0b1b1f",
                boxShadow: "none",
                borderRadius: 0.5,
                textTransform: "none",
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
                fontWeight: 500,
                px: 3,
              }}
            >
              Watch the 2-Min Demo
            </Button>
          </Stack>

          <Typography
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "13px",
              color: "#6B7280",
              textAlign: "center",
              mb: { xs: 6, md: 10 },
            }}
          >
            No credit card required. Your first pipeline is live in under 30 minutes.
          </Typography>
        </Box>

        {/* Showcase cards */}
        <Box
          sx={{
            width: "95%",
            position: "relative",
            height: { xs: 150, sm: 200, md: 250 },
            mb: { xs: 4, md: 0 },
            maxWidth: "1300px",
            margin: "20px auto",
          }}
        >
          <img
            src="/images/home/heroSection.png"
            alt="AI Insights Blur"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </Box>
      </>
    </Box>
  );
};

export default CompanyHeroSection;