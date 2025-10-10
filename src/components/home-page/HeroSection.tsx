import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Typography, Stack, IconButton, TextField, InputAdornment } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FilterListIcon from "@mui/icons-material/FilterList";
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
  
  // Job search states
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  
  // Statistics states
  const [stats, setStats] = useState({
    users: '100K+',
    jobs: '20K+',
    companies: '+500'
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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
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
              users: formatNumber(users, false),      // e.g., "100K+" or "500+"
              jobs: formatNumber(posts, false),       // e.g., "20K+" or "150+"
              companies: formatNumber(companies, true) // e.g., "+500" or "2K+"
            });
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (type !== 'company') {
      fetchStats();
    }
  }, [type]);

  // Handle job search
  const handleJobSearch = () => {
    const params = new URLSearchParams();
    if (jobTitle) params.append('search', jobTitle);
    if (location) params.append('location', location);
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ''}`);
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
        maxWidth: 1400,
        mx: 'auto',
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
          spacing={4}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            minHeight: "600px"
          }}
        >
          <Box sx={{ flex: 1, maxWidth: "600px" }}>
            <Typography
              variant="h2"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: { xs: "48px", md: "64px", lg: "72px" },
                lineHeight: 1.2,
                mb: 1,
                color: "#000000"
              }}
            >
              {title}<span style={{ color: color }}>.</span>
            </Typography>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 700, // Bold
                fontStyle: "normal",
                fontSize: { xs: "36px", md: "50px" }, // responsive
                lineHeight: "100%", // matches your spec
                mb: 3,
                color: "#666666"
              }}
            >
              {subtitle}
            </Typography>
            <Typography
              variant="body1"
              color="#666666"
              sx={{
                mb: 4,
                maxWidth: 500,
                fontSize: "16px",
                lineHeight: 1.6,
              }}
            >
              Begin Your Professional Journey with TalentAI, Your Trusted Companion in Navigating the Dynamic Landscape of Career Opportunities, Offering Tailored Solutions for Your Success.
            </Typography>

            {/* Job Search Interface */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 0,
                mb: 4,
                p: 0,
                backgroundColor: "#fff",
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                overflow: "hidden"
              }}
            >
              <TextField
                placeholder="Job Title"
                variant="outlined"
                size="medium"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJobSearch();
                  }
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    border: "none",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#6b7280", fontSize: "20px" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ width: "1px", backgroundColor: "#e5e7eb", my: 1 }} />
              <TextField
                placeholder="All Location"
                variant="outlined"
                size="medium"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJobSearch();
                  }
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    border: "none",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: "#6b7280", fontSize: "20px" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ width: "1px", backgroundColor: "#e5e7eb", my: 1 }} />
              <TextField
                placeholder="Category"
                variant="outlined"
                size="medium"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJobSearch();
                  }
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    border: "none",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon sx={{ color: "#6b7280", fontSize: "20px" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleJobSearch}
                sx={{
                  backgroundColor: color,
                  color: "#fff",
                  borderRadius: 0,
                  textTransform: "none",
                  px: 4,
                  py: 2,
                  fontWeight: 600,
                  fontSize: "16px",
                  minWidth: "140px",
                  "&:hover": {
                    backgroundColor: color,
                    opacity: 0.9,
                  },
                }}
              >
                Search Job
              </Button>
            </Box>

            {/* Statistics */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 0,
                mb: 4,
                backgroundColor: "#fff",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                overflow: "hidden"
              }}
            >
              <Box sx={{ flex: 1, p: 3, textAlign: "center" }}>
                <Typography variant="h4" fontWeight={800} color="#000" sx={{ mb: 0.5 }}>
                  {stats.users}
                </Typography>
                <Typography variant="body2" color="#6b7280" sx={{ fontSize: "14px", fontWeight: 500 }}>
                  Users
                </Typography>
              </Box>
              <Box sx={{ width: "1px", backgroundColor: "#e5e7eb", my: 2 }} />
              <Box sx={{ flex: 1, p: 3, textAlign: "center" }}>
                <Typography variant="h4" fontWeight={800} color="#000" sx={{ mb: 0.5 }}>
                  {stats.jobs}
                </Typography>
                <Typography variant="body2" color="#6b7280" sx={{ fontSize: "14px", fontWeight: 500 }}>
                  Job Vacancy
                </Typography>
              </Box>
              <Box sx={{ width: "1px", backgroundColor: "#e5e7eb", my: 2 }} />
              <Box sx={{ flex: 1, p: 3, textAlign: "center" }}>
                <Typography variant="h4" fontWeight={800} color="#000" sx={{ mb: 0.5 }}>
                  {stats.companies}
                </Typography>
                <Typography variant="body2" color="#6b7280" sx={{ fontSize: "14px", fontWeight: 500 }}>
                  Companies
                </Typography>
              </Box>
            </Box>

            {/* Call to Action */}
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600, // Semibold
                fontStyle: "normal",
                fontSize: { xs: "28px", md: "48px" },
                lineHeight: "145%",  // matches 145%
                letterSpacing: "0%",
                mb: 2,
                mt: 20,
                color: "#000"
              }}
            >
              Your skills deserve to be shown to the world.
            </Typography>



          </Box>

          {/* Right Side - Get Hired Image */}
          <Box
            display={{ xs: "none", lg: "flex" }}
            sx={{
              flex: 1,
              position: "relative",
              justifyContent: "center",
              alignItems: "flex-start",
              maxWidth: "600px",
              flexDirection: "column"
            }}
          >
            <Box sx={{ position: "relative", width: "100%", mb: 3 }}>
              <img
                src="/images/jobseeker_landing/getHired.png"
                alt="Get Hired - TalentAI Platform"
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "16px",
                  position: "relative",
                  zIndex: 3,
                  objectFit: "contain",
                  display: "block"
                }}
              />
            </Box>

            {/* Supporting text under the image */}
            <Typography
              variant="body1"
              color="#6b7280"
              sx={{
                fontSize: "16px",
                lineHeight: 1.6,
                fontWeight: 400,
                textAlign: "left",
                maxWidth: "100%"
              }}
            >
              Work with top companies, earn on your terms, and create a career without borders. Connect directly with industry leaders through AI-powered matching, access competitive salaries and flexible opportunities that fit your lifestyle, and build a global career with remote roles that let you work anywhere.
            </Typography>
          </Box>
        </Stack >
      )}
    </Box >
  );
};

export default HeroSection;