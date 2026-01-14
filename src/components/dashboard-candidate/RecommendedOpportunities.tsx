import React, { useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Button,
  Skeleton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchRecommendedPosts,
  selectRecommended,
} from "@/store/slices/postSlice";
import { ArrowForward, SearchOff } from "@mui/icons-material";
import { useRouter } from "next/router";
import { formatSalary } from "@/utils/postHelpers";
import Image from "next/image";

export default function RecommendedOpportunities() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: recommendedPosts, loading, pagination } = useSelector(selectRecommended);

  useEffect(() => {
    dispatch(fetchRecommendedPosts({
        page: 1,
        limit: 3}));
  }, [dispatch]);

  return (
    <Box
      sx={{
        px: 5,
        py: 3,
        mb: 2,
        color: "#000",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        backgroundColor: "white",
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#000000",
            fontSize: "20px",
            mb: 3,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-4px",
              left: 0,
              width: "38px",
              height: "5px",
              background: "#8310FF",
              borderRadius: "2px",
            },
          }}
        >
          Recommended Opportunities
        </Typography>
        {pagination?.total > 3 && (
          <Button
            variant="outlined"
            onClick={() => null}
            endIcon={<ArrowForward />}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(131, 16, 255, 1)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              px: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
                border: "none",
              },
            }}
          >
            View All
          </Button>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
            pb: 2,
          }}
        >
          {[...Array(3)].map((_, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                minHeight: 150,
                borderRadius: 2,
              }}
            >
              {/* Title */}
              <Skeleton variant="text" height={24} width="80%" />

              {/* Posted date */}
              <Skeleton variant="text" height={14} width="40%" sx={{ mb: 1 }} />

              {/* Employment type & salary */}
              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                <Skeleton variant="rounded" width={60} height={20} />
                <Skeleton variant="text" width="50%" height={20} />
              </Box>

              {/* Skills */}
              <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="rounded" width={50} height={20} />
                ))}
              </Box>

              {/* Location */}
              <Skeleton variant="text" width="60%" height={18} />
            </Paper>
          ))}
        </Box>
      )}

      {/* No Data State */}
      {!loading && recommendedPosts.length === 0 && (
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
              fontSize: "20px",
              lineHeight: "28px",
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
              fontSize: "14px",
              lineHeight: "25px",
              textAlign: "center",
            }}
          >
            You need to pass a test with a score of <b>'Good'</b> or <b>20%</b>{" "}
            to see recommended opportunities
          </Typography>
        </Box>
      )}

      {/* Recommendations Grid */}
      {!loading && recommendedPosts.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
            pb: 2,
          }}
        >
          {recommendedPosts.map((item) => {
            const skills =
              item?.skillAnalysis?.requiredSkills?.map((skill) => skill.name) ||
              [];

            return (
              <Paper
                key={item?._id}
                elevation={2}
                sx={{
                  p: 2,
                  minHeight: 150,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": { boxShadow: "0 3px 10px rgba(0,0,0,0.12)" },
                }}
                onClick={() => router.push("/posts/" + item?._id)}
              >
                {/* Title */}
                {item?.jobDetails?.title && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "22px",
                      mb: 0.5,
                    }}
                  >
                    {item?.jobDetails?.title}
                  </Typography>
                )}

                {/* Created At */}
                {item?.createdAt && (
                  <Typography sx={{ fontSize: "11px", color: "#999", mb: 1 }}>
                    Posted:{" "}
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                )}

                {/* Employment Type & Salary */}
                {(item?.jobDetails?.employmentType ||
                  item?.jobDetails?.salary) && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    {item?.jobDetails?.employmentType && (
                      <Chip
                        label={item?.jobDetails?.employmentType.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(231, 246, 234, 1)",
                          color: "rgba(11, 160, 44, 1)",
                          fontSize: "10px",
                          height: "20px",
                          borderRadius: "20px",
                        }}
                      />
                    )}
                    {item?.jobDetails?.salary && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "12px",
                          color: "rgba(118, 127, 140, 1)",
                        }}
                      >
                        Salary: {formatSalary(item?.jobDetails?.salary)}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mb: 1.5,
                    }}
                  >
                    {skills.slice(0, 3).map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(131, 16, 255, 0.1)",
                          color: "#8310FF",
                          fontSize: "0.65rem",
                          height: 20,
                          borderRadius: 1,
                        }}
                      />
                    ))}
                    {skills.length > 3 && (
                      <Chip
                        label={`+${skills.length - 3}`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(131, 16, 255, 0.1)",
                          color: "#8310FF",
                          fontSize: "0.65rem",
                          height: 20,
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Box>
                )}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Location */}
                  {item?.jobDetails?.location && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocationOnIcon
                        sx={{ color: "#666666", fontSize: "0.9rem" }}
                      />
                      <Typography sx={{ fontSize: "12px", color: "#666666" }}>
                        {item?.jobDetails?.location}
                      </Typography>
                    </Box>
                  )}
                  <Image
                    src="/icons/arrow-up.svg"
                    alt="arrowup"
                    width={16}
                    height={16}
                  />
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
