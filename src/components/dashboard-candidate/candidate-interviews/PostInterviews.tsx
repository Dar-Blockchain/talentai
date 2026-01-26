import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import StatsSummaryCard from "./StatsSummaryCard";
import ChecklistIcon from "@/components/icons/CheckListIcon";
import HourglassIcon from "@/components/icons/HourglassIcon";
import { ArrowForward, ArrowBack } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import TimeOutlineIcon from "@/components/icons/TimeOutlineIcon";
import CaseOutlineIcon from "@/components/icons/CaseOutlineIcon";
import CheckTestIcon from "@/components/icons/checkTestIcon";
import { useRouter } from "next/router";
import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import {
  fetchCandidateAssessments,
  selectCandidateAssessments,
  selectCandidateAssessmentsLoading,
  selectCandidateAssessmentsPagination,
} from "@/store/slices/postSlice";

interface PostAssessment {
  _id: string;
  candidate?: string | {
    _id: string;
    username?: string;
    email?: string;
  };
  company?: {
    _id: string;
    username?: string;
    email?: string;
    role?: string;
  };
  post?: {
    _id: string;
    jobDetails?: {
      title?: string;
      description?: string;
    };
    user?: {
      companyName?: string;
    };
    status?: string;
  };
  interviewData?: {
    interviewType?: string;
    finalReport?: {
      coverage?: {
        overall?: number;
        areas?: Record<string, any>;
      };
      summary?: string;
      recommendations?: string[];
      aiAnalysis?: {
        strongestAreas?: string[];
        weakestAreas?: string[];
        recommendedFocus?: string[];
      };
    };
    analytics?: {
      duration?: number;
      messageCount?: number;
      completedAreas?: number;
      totalAreas?: number;
      coveragePercentage?: number;
    };
  };
  candidatePostStepProgress?: any;
  createdAt: string;
  updatedAt?: string;
}

interface PostInterviewsProps {
  onViewAll?: () => void;
  onBackToAll?: () => void;
  hidden?: boolean;
  showViewAll?: boolean;
  initialDisplayCount?: number;
}

const PostInterviews: React.FC<PostInterviewsProps> = ({
  onViewAll,
  onBackToAll,
  hidden = false,
  showViewAll = false,
  initialDisplayCount = 5,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const assessments = useSelector(selectCandidateAssessments) as PostAssessment[];
  const loading = useSelector(selectCandidateAssessmentsLoading);
  const pagination = useSelector(selectCandidateAssessmentsPagination);

  // Local state for search, sort, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Early return if hidden
  if (hidden) {
    return null;
  }

  // Fetch assessments on mount
  useEffect(() => {
    dispatch(fetchCandidateAssessments({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Calculate stats from assessments
  const stats = useMemo(() => {
    const completed = assessments.filter((a: PostAssessment) => {
      const score = a.interviewData?.finalReport?.coverage?.overall || 0;
      return score >= 50;
    }).length;

    return {
      total: pagination.total || assessments.length,
      completed,
      ongoing: assessments.length - completed,
    };
  }, [assessments, pagination.total]);

  const getScore = (assessment: PostAssessment): number => {
    return assessment.interviewData?.finalReport?.coverage?.overall ||
      assessment.interviewData?.analytics?.coveragePercentage ||
      0;
  };

  // Check if assessment has pending/inProgress steps in pipeline
  const hasPendingSteps = (assessment: PostAssessment): boolean => {
    const stepProgress = assessment.candidatePostStepProgress;
    if (!stepProgress?.steps) return false;

    // Check if any step is pending or inProgress
    return stepProgress.steps.some(
      (step: any) => step.status === 'pending' || step.status === 'inProgress'
    );
  };

  // Check if all steps are completed (done status)
  const allStepsCompleted = (assessment: PostAssessment): boolean => {
    const stepProgress = assessment.candidatePostStepProgress;
    if (!stepProgress?.steps || stepProgress.steps.length === 0) {
      // No pipeline steps - use score-based completion
      const score = getScore(assessment);
      return score >= 50;
    }

    // All steps must be 'done' or 'passed'
    return stepProgress.steps.every(
      (step: any) => step.status === 'done' || step.status === 'passed'
    );
  };

  const isCompleted = (assessment: PostAssessment): boolean => {
    // First check pipeline steps if available
    if (assessment.candidatePostStepProgress?.steps?.length > 0) {
      return allStepsCompleted(assessment);
    }
    // Fallback to score-based completion
    const score = getScore(assessment);
    return score >= 50;
  };

  const handleViewDetails = (assessmentId: string) => {
    router.push(`/assessment/${assessmentId}`);
  };

  const handleContinueTest = (assessment: PostAssessment) => {
    const postId = assessment.post?._id;
    const currentStep = assessment.candidatePostStepProgress?.currentStep;

    if (postId && currentStep) {
      // Navigate to the interview page with the current step
      router.push(`/interview/hr?jobId=${postId}&stepId=${currentStep._id}&pipeline=true`);
    }
  };

  // Theme color for applications
  const themeColor = "rgba(189, 133, 255, 1)";

  // Sort menu handlers
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortChange = (sortOption: "newest" | "oldest" | "title-asc" | "title-desc") => {
    setSortBy(sortOption);
    setCurrentPage(1);
    handleSortMenuClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Filter and sort assessments locally
  const filteredAndSortedAssessments = useMemo(() => {
    let filtered = [...assessments];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const jobTitle = a.post?.jobDetails?.title?.toLowerCase() || "";
        const companyName = a.company?.username?.toLowerCase() || a.post?.user?.companyName?.toLowerCase() || "";
        return jobTitle.includes(query) || companyName.includes(query);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title-asc":
          return (a.post?.jobDetails?.title || "").localeCompare(b.post?.jobDetails?.title || "");
        case "title-desc":
          return (b.post?.jobDetails?.title || "").localeCompare(a.post?.jobDetails?.title || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [assessments, searchQuery, sortBy]);

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAndSortedAssessments.length / itemsPerPage);
  const displayAssessments = showViewAll
    ? filteredAndSortedAssessments.slice(0, initialDisplayCount)
    : filteredAndSortedAssessments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: themeColor }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <StatsSummaryCard
          label="Total"
          value={stats.total}
          subtitle="Applications"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(11, 82, 198, 1)" }}
            />
          }
          valueColor="rgba(11, 82, 198, 1)"
          borderColor="rgba(11, 82, 198, 0.18)"
          iconBgColor="rgba(11, 82, 198, 0.06)"
        />
        <StatsSummaryCard
          label="Completed"
          value={stats.completed}
          subtitle="Interviews"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(62, 180, 137, 1)" }}
            />
          }
          valueColor="rgba(62, 180, 137, 1)"
          borderColor="rgba(62, 180, 137, 0.18)"
          iconBgColor="rgba(62, 180, 137, 0.09)"
        />
        <StatsSummaryCard
          label="Ongoing"
          value={stats.ongoing}
          subtitle="Interviews"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(250, 180, 70, 1)" }}
            />
          }
          valueColor="rgba(250, 180, 70, 1)"
          borderColor="rgba(250, 180, 70, 0.18)"
          iconBgColor="rgba(255, 249, 241, 0.79)"
        />
      </Box>

      {/* History Section */}
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: "rgba(100, 113, 131, 1)",
              fontWeight: 500,
              fontSize: "15px",
              lineHeight: "18.78px",
            }}
          >
            History
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* Search and Sort Controls - Only show in full view */}
            {!showViewAll && (
              <>
                <TextField
                  size="small"
                  placeholder="Search assessments"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ color: "rgba(84, 98, 116, 1)", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: 250,
                    height: "40px",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "42px",
                      border: "1px solid rgba(165, 172, 181, 1)",
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover": {
                        borderColor: "rgba(165, 172, 181, 0.8)",
                      },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={
                    <Image
                      src="/icons/sort.svg"
                      alt="sort"
                      width={24}
                      height={24}
                    />
                  }
                  onClick={handleSortMenuOpen}
                  sx={{
                    height: "40px",
                    borderColor: "rgba(165, 172, 181, 1)",
                    color: "rgba(84, 98, 116, 1)",
                    textTransform: "uppercase",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    borderRadius: "42px",
                    px: 2.5,
                    "&:hover": {
                      borderColor: "rgba(165, 172, 181, 0.8)",
                      backgroundColor: "#f9fafb",
                    },
                  }}
                >
                  SORT
                </Button>
                <Menu
                  anchorEl={sortMenuAnchor}
                  open={Boolean(sortMenuAnchor)}
                  onClose={handleSortMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    onClick={() => handleSortChange("newest")}
                    selected={sortBy === "newest"}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Newest First
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSortChange("oldest")}
                    selected={sortBy === "oldest"}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Oldest First
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSortChange("title-asc")}
                    selected={sortBy === "title-asc"}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Title (A-Z)
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSortChange("title-desc")}
                    selected={sortBy === "title-desc"}
                    sx={{ fontSize: "0.875rem" }}
                  >
                    Title (Z-A)
                  </MenuItem>
                </Menu>
                {/* Back Button */}
                {onBackToAll && (
                  <Button
                    variant="outlined"
                    onClick={onBackToAll}
                    startIcon={<ArrowBack />}
                    sx={{
                      border: "none",
                      background: "none",
                      color: "rgba(189, 133, 255, 1)",
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      px: 2,
                      "&:hover": {
                        background: "rgba(189, 133, 255, 0.04)",
                        border: "none",
                      },
                    }}
                  >
                    Back
                  </Button>
                )}
              </>
            )}

            {/* View All Button - Only show in overview mode */}
            {showViewAll && onViewAll && (
              <Button
                variant="outlined"
                onClick={onViewAll}
                endIcon={<ArrowForward />}
                sx={{
                  border: "none",
                  background: "none",
                  color: "rgba(189, 133, 255, 1)",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "15px",
                  px: 2,
                  "&:hover": {
                    background: "rgba(189, 133, 255, 0.04)",
                    border: "none",
                  },
                }}
              >
                View All
              </Button>
            )}
          </Box>
        </Box>

        {/* Assessment Cards */}
        {displayAssessments.length === 0 ? (
          <Box
            sx={{
              p: 4,
              border: "1px solid rgba(211, 224, 245, 1)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "rgba(100, 113, 131, 1)" }}>
              {searchQuery.trim()
                ? "No assessments match your search criteria."
                : "No interview assessments found. Apply for jobs to start your interviews!"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {displayAssessments.map((assessment) => {
              const score = getScore(assessment);
              const completed = isCompleted(assessment);
              const timeAgo = assessment.updatedAt || assessment.createdAt
                ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true })
                : "";
              const jobTitle = assessment.post?.jobDetails?.title || "Job Application";
              const companyName = assessment.company?.username || assessment.post?.user?.companyName || "Company";
              const interviewType = assessment.interviewData?.interviewType?.replace(/_/g, " ") || "HR Interview";

              return (
                <Box
                  key={assessment._id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    border: "1px solid rgba(211, 224, 245, 1)",
                    boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
                    borderRadius: "8px",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "17px",
                          lineHeight: "28px",
                          color: "rgba(62, 70, 82, 1)",
                        }}
                      >
                        {jobTitle}
                      </Typography>
                      {completed ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CheckTestIcon sx={{ color: "#3EB489", fontSize: "13.5px" }} />
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: "14px",
                              lineHeight: "18px",
                              color: "rgba(62, 180, 137, 1)",
                            }}
                          >
                            Completed
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <HourglassIcon
                            sx={{ color: "rgba(250, 180, 70, 1)", fontSize: "12px" }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: "14px",
                              lineHeight: "18px",
                              color: "rgba(250, 180, 70, 1)",
                            }}
                          >
                            Ongoing
                          </Typography>
                        </Box>
                      )}
                      <Chip
                        label={interviewType}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(131, 16, 255, 0.1)",
                          color: "#8310FF",
                          fontWeight: 500,
                          fontSize: "0.65rem",
                          height: 20,
                          textTransform: "capitalize",
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CaseOutlineIcon
                          sx={{ fontSize: "12px", color: "rgba(84, 98, 116, 1)" }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 400,
                            fontSize: "11px",
                            lineHeight: "28px",
                            color: "rgba(84, 98, 116, 1)",
                          }}
                        >
                          {companyName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <TimeOutlineIcon />
                        <Typography
                          sx={{
                            fontWeight: 400,
                            fontSize: "11px",
                            lineHeight: "28px",
                            color: "rgba(84, 98, 116, 1)",
                          }}
                        >
                          {timeAgo}
                        </Typography>
                      </Box>

                    </Box>
                    {/* Progress Bar */}
                    <Box sx={{ mt: 1, maxWidth: "300px" }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Math.max(score, 0), 100)}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: "rgba(243, 245, 247, 1)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            backgroundColor: completed ? "rgba(62, 180, 137, 1)" : "rgba(250, 180, 70, 1)",
                          },
                        }}
                      />
                    </Box>
                  </Box>
                  {hasPendingSteps(assessment) ? (
                    <Button
                      onClick={() => handleContinueTest(assessment)}
                      variant="outlined"
                      sx={{
                        width: "170px",
                        borderColor: "rgba(189, 133, 255, 1)",
                        color: "white",
                        background: "rgba(189, 133, 255, 1)",
                        fontWeight: 600,
                        borderRadius: "38px",
                        px: 3,
                        height: "42px",
                        textTransform: "none",
                        fontSize: "0.875rem",
                        "&:hover": {
                          backgroundColor: "rgba(160, 100, 230, 1)",
                          borderColor: "rgba(160, 100, 230, 1)",
                        },
                      }}
                    >
                      Complete Test
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleViewDetails(assessment._id)}
                      variant="outlined"
                      sx={{
                        width: "170px",
                        borderColor: completed ? "rgba(211, 224, 245, 1)" : "rgba(189, 133, 255, 1)",
                        color: completed ? "rgba(62, 70, 82, 1)" : "rgba(189, 133, 255, 1)",
                        background: completed ? "#54627414" : "rgba(189, 133, 255, 0.08)",
                        fontWeight: completed ? 500 : 600,
                        borderRadius: "38px",
                        px: 3,
                        height: "42px",
                        textTransform: "none",
                        fontSize: "0.875rem",
                        "&:hover": {
                          backgroundColor: completed ? "rgba(211, 224, 245, 0.3)" : "rgba(189, 133, 255, 0.04)",
                          borderColor: completed ? "rgba(211, 224, 245, 1)" : "rgba(189, 133, 255, 1)",
                        },
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Pagination - Only show in full view when there are multiple pages */}
        {!showViewAll && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#6b7280",
                  fontWeight: 500,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(189, 133, 255, 0.2)",
                    color: "rgba(189, 133, 255, 1)",
                    fontWeight: 600,
                  },
                  "&:hover": {
                    backgroundColor: "#f3f4f6",
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(PostInterviews), {
  ssr: false,
});
