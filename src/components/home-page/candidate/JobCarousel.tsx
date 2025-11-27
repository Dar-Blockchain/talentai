import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  Fade,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRouter } from "next/router";
import Image from "next/image";

const JobCarousel = ({ jobs = [], loading }) => {
  const theme = useTheme();
  const router = useRouter();

  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600–900px
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // ≥900px

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentJobs, setCurrentJobs] = useState([]);

  const itemsPerSlide = isXs ? 1 : isSm ? 2 : 3;
  const totalSlides = Math.ceil(jobs.length / itemsPerSlide);

  useEffect(() => {
    const startIndex = currentSlide * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    setCurrentJobs(jobs.slice(startIndex, endIndex));
  }, [currentSlide, jobs, itemsPerSlide]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [itemsPerSlide, jobs.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => setCurrentSlide(index);

  useEffect(() => {
    console.log(currentJobs, "currentJobs");
  }, [currentJobs]);

  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Carousel Row (Arrows + Cards) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 1300,
          //   mx: "auto",
          gap: { xs: 1, sm: 2, md: 3 }, // space between arrows and cards
        }}
      >
        {/* Left Arrow */}
        {!loading && jobs.length > itemsPerSlide && (
          <IconButton
            onClick={prevSlide}
            sx={{
              "&:hover": {
                width: 30,
                height: 30,
                backgroundColor: "rgba(211, 211, 211, 0.5)",
                "& svg": { color: "#fff" },
              },
              zIndex: 3,
            }}
          >
            <ArrowBackIosNewIcon
              sx={{
                color: "rgba(211, 211, 211, 1)",
                width: "12px",
                height: "24px",
              }}
            />
          </IconButton>
        )}

        {/* Cards */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
              width: "100%",
            }}
          >
            <CircularProgress sx={{ color: "#8310FF" }} />
          </Box>
        ) : (
          <Fade in timeout={500}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: { xs: 2, sm: 3 },
                width: "100%",
                transition: "all 0.3s ease",
              }}
            >
              {currentJobs.map((job, index) => (
                <Card
                  key={job.id || index}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(228, 229, 232, 1)",
                    boxShadow: "0px 6px 18px rgba(24, 25, 28, 0.06)",
                    background:
                      "linear-gradient(180deg, #fff 0%, #faf8ff 100%)",
                    cursor: "pointer",
                    transition: "transform 0.35s ease, box-shadow 0.35s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 8px 24px rgba(131, 16, 255, 0.25)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 600,
                          fontSize: "16px",
                          color: "rgba(24, 25, 28, 1)",
                          lineHeight: 1.3,
                        }}
                      >
                        {job.title}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={job.type}
                        size="small"
                        sx={{
                          background: "rgba(231, 246, 234, 1)",
                          color: "rgba(11, 160, 44, 1)",
                          fontWeight: 600,
                          fontSize: "11px",
                          height: 24,
                          "& .MuiChip-label": { px: 1.5 },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(118, 127, 140, 1)",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        Salary: {job.salary}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          backgroundColor: "#8310FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "14px",
                          flexShrink: 0,
                        }}
                      >
                        {job.logo}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "rgba(24, 25, 28, 1)",
                            fontSize: "13px",
                            mb: 0.5,
                          }}
                        >
                          {job.company}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            flexWrap: "nowrap",
                          }}
                        >
                          <LocationOnIcon
                            sx={{ color: "#666", fontSize: 14 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#666",
                              fontSize: "11px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {job.location}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Image
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          src="/icons/arrow-up.svg"
                          alt="search"
                          width={24}
                          height={24}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Fade>
        )}

        {/* Right Arrow */}
        {!loading && jobs.length > itemsPerSlide && (
          <IconButton
            onClick={nextSlide}
            sx={{
              "&:hover": {
                width: 30,
                height: 30,
                backgroundColor: "rgba(211, 211, 211, 0.5)",
                "& svg": { color: "#fff" },
              },
              zIndex: 3,
            }}
          >
            <ArrowForwardIosIcon
              sx={{
                color: "rgba(211, 211, 211, 1)",
                width: "12px",
                height: "24px",
              }}
            />
          </IconButton>
        )}
      </Box>

      {/* Pagination Dots */}
      {!loading && jobs.length > itemsPerSlide && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.5,
            mt: 3,
          }}
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: index === currentSlide ? "30px" : "8px",
                height: index === currentSlide ? "8px" : "8px",
                borderRadius: "20px",
                backgroundColor:
                  index === currentSlide
                    ? "rgba(189, 133, 255, 1)"
                    : "rgba(211, 211, 211, 1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default JobCarousel;
