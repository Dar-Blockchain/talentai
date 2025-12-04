import React, { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, IconButton, Chip } from "@mui/material";
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
import PostDetailsModal from "../posts/PostDetailsModal";

export type RecommendedOpportunity = {
  _id?: string;
  id?: string;
  title?: string;
  company?: string;
  companyName?: string;
  location?: string;
  description?: string;
  createdAt?: string | number | Date;
  type?: string;
  employmentType?: string;
  firstStepId?: string;
  requiredSkills?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skillAnalysis?: {
    requiredSkills?: Array<{
      name: string;
      level?: string;
      importance?: string;
      category?: string;
      percentage?: number;
    }>;
  };
  jobDetails?: {
    title?: string;
    employmentType?: string;
    location?: string;
    requiredSkills?: string[];
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
    company?: string;
    companyName?: string;
  };
};

export default function RecommendedOpportunities() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: recommendedPosts,
    loading,
    error,
  } = useSelector(selectRecommended);

  const [selectedJob, setSelectedJob] = useState<RecommendedOpportunity | null>(
    null
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchRecommendedPosts());
  }, [dispatch]);

  useEffect(() => {
    console.log("Recommended opportunities data updated:", recommendedPosts);
  }, [recommendedPosts]);

  const handleOpen = async (row: RecommendedOpportunity) => {
    setSelectedJob(row);
  };

  const handleClose = () => {
    setSelectedJob(null);
  };

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

      {recommendedPosts && recommendedPosts.length === 0 && (
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
      {recommendedPosts && recommendedPosts.length > 0 && (
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
              salary = `${currency}${min.toLocaleString()}-${max.toLocaleString()}`;
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
                  border: "1px solid #E0E0E0",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                  },
                }}
                onClick={() => handleOpen(item)}
              >
                <Box>
                  {/* Job Title */}
                  {item?.jobDetails?.title && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#000000",
                        fontSize: "1.125rem",
                        mb: 2,
                        pr: 4,
                        lineHeight: 1.3,
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
                          label={item?.jobDetails?.employmentType}
                          size="small"
                          sx={{
                            backgroundColor: "#4CAF50",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 24,
                            borderRadius: 1,
                          }}
                        />
                      )}
                      {salary && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666666",
                            fontSize: "0.875rem",
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

      <PostDetailsModal
        open={!!selectedJob}
        selectedJob={selectedJob}
        handleClose={handleClose}
      />
    </Box>
  );
}
