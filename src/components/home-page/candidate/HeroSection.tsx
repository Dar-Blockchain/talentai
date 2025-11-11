import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter } from "next/router";
type HeroSectionProps = {
  color?: string;
  title?: string;
  subtitle?: string;
};
const CandidateHeroSection = ({ color, title, subtitle }: HeroSectionProps) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Job search states
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  // Statistics states
  const [stats, setStats] = useState({
    users: "100K+",
    jobs: "20K+",
    companies: "+500",
  });

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

    fetchStats();
  }, []);

  // Handle job search
  const handleJobSearch = () => {
    const params = new URLSearchParams();
    if (jobTitle) params.append("search", jobTitle);
    if (location) params.append("location", location);

    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
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
        maxWidth: "100%",
        borderRadius: "10px",
        mx: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 3, lg: 4 }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "center", lg: "flex-start" },
          minHeight: { xs: "auto", lg: "600px" },
          ml: 8,
        }}
      >
        <Box
          sx={{ flex: 1, maxWidth: { xs: "100%", lg: "600px" }, width: "100%" }}
        >
          <Typography
            variant="h2"
            fontWeight={700}
            gutterBottom
            sx={{
              fontSize: { xs: "32px", sm: "48px", md: "64px", lg: "72px" },
              lineHeight: 1.2,
              mb: 1,
              color: "#000000",
              textAlign: { xs: "center", lg: "left" },
            }}
          >
            {title}
            <span style={{ color: color }}>.</span>
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
              textAlign: { xs: "center", lg: "left" },
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
              px: { xs: 2, sm: 0 },
            }}
          >
            Begin Your Professional Journey with TalentAI, Your Trusted
            Companion in Navigating the Dynamic Landscape of Career
            Opportunities, Offering Tailored Solutions for Your Success.
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
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              overflow: "hidden",
            }}
          >
            <TextField
              placeholder="Job Title"
              variant="outlined"
              size="medium"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
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
                },
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
                if (e.key === "Enter") {
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
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon
                      sx={{ color: "#6b7280", fontSize: "20px" }}
                    />
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
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ flex: 1, p: 3, textAlign: "center" }}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="#000"
                sx={{ mb: 0.5 }}
              >
                {stats.users}
              </Typography>
              <Typography
                variant="body2"
                color="#6b7280"
                sx={{ fontSize: "14px", fontWeight: 500 }}
              >
                Users
              </Typography>
            </Box>
            <Box sx={{ width: "1px", backgroundColor: "#e5e7eb", my: 2 }} />
            <Box sx={{ flex: 1, p: 3, textAlign: "center" }}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="#000"
                sx={{ mb: 0.5 }}
              >
                {stats.jobs}
              </Typography>
              <Typography
                variant="body2"
                color="#6b7280"
                sx={{ fontSize: "14px", fontWeight: 500 }}
              >
                Job Vacancy
              </Typography>
            </Box>
            <Box sx={{ width: "1px", backgroundColor: "#e5e7eb", my: 2 }} />
            <Box sx={{ flex: 1, p: 3, textAlign: "center" }}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="#000"
                sx={{ mb: 0.5 }}
              >
                {stats.companies}
              </Typography>
              <Typography
                variant="body2"
                color="#6b7280"
                sx={{ fontSize: "14px", fontWeight: 500 }}
              >
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
              px: { xs: 2, sm: 0 },
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
            display: "flex",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              mb: { xs: 2, lg: 3 },
              px: { xs: 2, sm: 4, lg: 0 },
            }}
          >
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
                display: "block",
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
              px: { xs: 2, sm: 4, lg: 0 },
            }}
          >
            Work with top companies, earn on your terms, and create a career
            without borders. Connect directly with industry leaders through
            AI-powered matching, access competitive salaries and flexible
            opportunities that fit your lifestyle, and build a global career
            with remote roles that let you work anywhere.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default CandidateHeroSection;
