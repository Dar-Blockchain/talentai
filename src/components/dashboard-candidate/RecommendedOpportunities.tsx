import React, { useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  fetchRecommendedPosts,
  selectRecommended,
} from "@/store/slices/postSlice";
import { SearchOff } from "@mui/icons-material";
<<<<<<< HEAD
// import PostDetailsModal from "../posts/PostDetailsModal";
=======
import { useRouter } from "next/router";
>>>>>>> 700c04ab695a912086ab1cdc1af1f4fe160ea6a1

export default function RecommendedOpportunities() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: recommendedPosts, loading } = useSelector(selectRecommended);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchRecommendedPosts());
  }, [dispatch]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <Box
      sx={{
        background: "rgba(255, 255, 255, 1)",
        color: "#000000",
        px: 5,
        py: 3,
        marginBottom: 2,
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        maxWidth: "100%",
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#000000",
              fontSize: "20px",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-4px",
                left: 0,
                width: "40px",
                height: "5px",
                background: "rgba(131, 16, 255, 1)",
                borderRadius: "2px",
              },
            }}
          >
            Recommended Opportunities
          </Typography>
        </Box>

        {/* Navigation Arrows */}
        <Box sx={{ display: "flex" }}>
          <IconButton
            onClick={scrollLeft}
            sx={{
              color: "rgba(131, 16, 255, 1)",
              transition: "transform 0.2s ease",
              "&:hover": {
                background: "transparent",
                transform: "scale(1.4)",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={scrollRight}
            sx={{
              color: "rgba(131, 16, 255, 1)",
              transition: "transform 0.2s ease",
              "&:hover": {
                background: "transparent",
                transform: "scale(1.4)",
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
            backgroundColor: "rgba(131, 16, 255, 0.02)",
            borderRadius: "8px",
            border: "1px solid rgba(98, 111, 134, 0.18)",
            textAlign: "center",
          }}
        >
          {" "}
          <CircularProgress
            sx={{ color: "rgba(131, 16, 255, 1)", mb: 3 }}
          />{" "}
        </Box>
      )}

      {!loading && recommendedPosts && recommendedPosts.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
            backgroundColor: "rgba(131, 16, 255, 0.02)",
            borderRadius: "8px",
            border: "1px solid rgba(98, 111, 134, 0.18)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(131, 16, 255, 0.1)",
              width: 100,
              height: 100,
              borderRadius: "50%",
            }}
          >
            <SearchOff sx={{ fontSize: 48, color: "rgba(131, 16, 255, 1)" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(131, 16, 255, 1)",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontStyle: "medium",
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "0",
              mb: 1,
            }}
          >
            No recommended opportunities found
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(147, 147, 147, 1)",
              maxWidth: "500px",
              mb: 4,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontStyle: "normal",
              fontSize: "14px",
              lineHeight: "25px",
              letterSpacing: "0px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            You need to pass a test with a score of <b>'Good'</b> or <b>20%</b>{" "}
            to see recommended opportunities
          </Typography>
        </Box>
      )}
      {!loading && recommendedPosts && recommendedPosts.length > 0 && (
        <Box
          ref={scrollContainerRef}
          sx={{
            display: "flex",
            gap: 3,
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            pb: 2,
          }}
        >
          {recommendedPosts.map((item) => {
            let salary: string | undefined = undefined;
            const salaryData = item?.jobDetails?.salary;
            if (salaryData) {
              const { currency, min, max } = salaryData;
              salary = `${currency}${min.toLocaleString()}-${currency}${max.toLocaleString()}`;
            }
            const skills =
              item?.skillAnalysis?.requiredSkills?.map((skill) => skill.name) ||
              [];

            return (
              <Paper
                key={item?._id}
                elevation={2}
                sx={{
                  minWidth: 400,
                  maxWidth: 400,
                  height: "auto",
                  minHeight: 180,
                  p: 3,
                  borderRadius: 2,
                  background: "#ffffff",
                  border: "1px solid rgba(228, 229, 232, 1)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                  },
                }}
                onClick={() => router.push('/posts/' + item?._id)}
              >
                <Box>
                  {/* Job Title */}
                  {item?.jobDetails?.title && (
                    <Typography
                      variant="h6"
                      sx={{
                        color: "rgba(24, 25, 28, 1)",
                        fontWeight: 500,
                        fontSize: "18px",
                        lineHeight: "28px",
                        letterSpacing: "0%",
                        mb: 0.5,
                      }}
                    >
                      {item?.jobDetails?.title}
                    </Typography>
                  )}

                  {/* Employment Type and Salary */}
                  {(item?.jobDetails?.employmentType || salary) && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      {item?.jobDetails?.employmentType && (
                        <Chip
                          label={item?.jobDetails?.employmentType.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(231, 246, 234, 1)",
                            color: "rgba(11, 160, 44, 1)",
                            fontWeight: 600,
                            fontSize: "12px",
                            height: "12px",
                            borderRadius: "33px",
                            px: 0.5,
                            py: 1.5,
                          }}
                        />
                      )}
                      {salary && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(118, 127, 140, 1)",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                          }}
                        >
                          Salary: {salary}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Skills */}
                  {skills && skills.length > 0 && (
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {skills
                        .slice(0, 4)
                        .map((skill: string, index: number) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(131, 16, 255, 0.1)",
                              color: "#8310FF",
                              fontWeight: 500,
                              fontSize: "0.7rem",
                              height: 22,
                              borderRadius: 1,
                            }}
                          />
                        ))}
                      {skills.length > 4 && (
                        <Chip
                          label={`+${skills.length - 4}`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(131, 16, 255, 0.1)",
                            color: "#8310FF",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 22,
                            borderRadius: 1,
                          }}
                        />
                      )}
                    </Box>
                  )}
                </Box>

                {/* Location */}
                {item?.jobDetails?.location && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon
                      sx={{ color: "#666666", fontSize: "1rem" }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666666",
                        fontSize: "0.875rem",
                      }}
                    >
                      {item?.jobDetails?.location}
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
<<<<<<< HEAD

      {/* <PostDetailsModal
        open={!!selectedJob}
        selectedJob={selectedJob}
        handleClose={handleClose}
      /> */}
=======
>>>>>>> 700c04ab695a912086ab1cdc1af1f4fe160ea6a1
    </Box>
  );
}
