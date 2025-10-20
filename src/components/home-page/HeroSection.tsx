import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Typography, Stack, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useRouter } from "next/router";
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
background: "linear-gradient(0deg, #F3F7FB, #F3F7FB), linear-gradient(180deg, rgba(255, 255, 255, 0) 59.69%, #FFFFFF 100%)",
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
            height: { xs: 150, sm: 200, md: 250 },
            mb: { xs: 4, md: 0 }
          }}>
            {/* Left blur cards - Desktop only */}
            <Box sx={{
              position: 'absolute',
              left: { md: 24 },
              bottom: 0,
              filter: 'blur(3px)',
              opacity: 0.6,
              display: { xs: 'none', lg: 'block' },
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
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 0,
              display: 'flex',
              gap: { xs: 0, sm: 1 },
              animation: 'slideUp 1s ease-out',
              width: { xs: '90%', sm: 'auto' },
              justifyContent: 'center'
            }}>
              {/* Candidate Profile Card */}
              <Box
                component="img"
                src="/images/home/Michael.png"
                alt="Michael Brown Profile"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  height: { md: 200, lg: 240 },
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />

              {/* AI Insights Card - Main focus */}
              <Box sx={{
                width: { xs: '100%', sm: 280, md: 320 },
                height: { xs: 150, sm: 200, md: 240 },
                bgcolor: '#fff',
                borderRadius: 3,
                zIndex: 2,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src="/images/home/Ai.png"
                  alt="AI Insights Dashboard"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Box>

              {/* Hiring Pipeline Card */}
              <Box
                component="img"
                src="/images/home/Hiring.png"
                alt="Hiring Pipeline Dashboard"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  height: { md: 200, lg: 240 },
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Box>

            {/* Right blur cards - Desktop only */}
            <Box sx={{
              position: 'absolute',
              right: { md: 1 },
              bottom: 0,
              filter: 'blur(3px)',
              opacity: 0.6,
              display: { xs: 'none', lg: 'block' },
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
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 3, lg: 4 }}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "center", lg: "flex-start" },
            minHeight: { xs: "auto", lg: "600px" }
          }}
        >
          <Box sx={{ flex: 1, maxWidth: { xs: "100%", lg: "600px" }, width: "100%" }}>
            <Typography
              variant="h2"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: { xs: "32px", sm: "48px", md: "64px", lg: "72px" },
                lineHeight: 1.2,
                mb: 1,
                color: "#000000",
                textAlign: { xs: "center", lg: "left" }
              }}
            >
              {title}<span style={{ color: color }}>.</span>
            </Typography>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontStyle: "normal",
                fontSize: { xs: "24px", sm: "36px", md: "50px" },
                lineHeight: "100%",
                mb: 3,
                color: "#666666",
                textAlign: { xs: "center", lg: "left" }
              }}
            >
              {subtitle}
            </Typography>
            <Typography
              variant="body1"
              color="#666666"
              sx={{
                mb: 4,
                maxWidth: { xs: "100%", lg: 500 },
                fontSize: { xs: "14px", md: "16px" },
                lineHeight: 1.6,
                textAlign: { xs: "center", lg: "left" },
                px: { xs: 2, sm: 0 }
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
                fontWeight: 600,
                fontStyle: "normal",
                fontSize: { xs: "20px", sm: "28px", md: "48px" },
                lineHeight: "145%",
                letterSpacing: "0%",
                mb: 2,
                mt: { xs: 8, md: 20 },
                color: "#000",
                textAlign: { xs: "center", lg: "left" },
                px: { xs: 2, sm: 0 }
              }}
            >
              Your skills deserve to be shown to the world.
            </Typography>



          </Box>

          {/* Right Side - Get Hired Image */}
          <Box
            sx={{
              flex: 1,
              position: "relative",
              justifyContent: "center",
              alignItems: { xs: "center", lg: "flex-start" },
              maxWidth: { xs: "100%", lg: "600px" },
              width: "100%",
              flexDirection: "column",
              display: "flex"
            }}
          >
            <Box sx={{ 
              position: "relative", 
              width: "100%", 
              mb: { xs: 2, lg: 3 },
              px: { xs: 2, sm: 4, lg: 0 }
            }}>
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
                fontSize: { xs: "14px", md: "16px" },
                lineHeight: 1.6,
                fontWeight: 400,
                textAlign: { xs: "center", lg: "left" },
                maxWidth: "100%",
                px: { xs: 2, sm: 4, lg: 0 }
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