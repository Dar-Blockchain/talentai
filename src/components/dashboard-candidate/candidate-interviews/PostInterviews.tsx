import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
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
import AssessmentCard, { PostAssessment } from "./AssessmentCard";
import StepInfoModal from "./StepInfoModal";
import ChecklistIcon from "@/components/icons/CheckListIcon";
import { ArrowForward, ArrowBack } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  fetchCandidateAssessments,
  selectCandidateAssessments,
  selectCandidateAssessmentsLoading,
  selectCandidateAssessmentsPagination,
} from "@/store/slices/postSlice";

// Grouped assessment structure from API
interface GroupedAssessment {
  post: any;
  assessments: any[];
  candidatePostStepProgress: any;
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

  // Redux selectors - data is now grouped by post: { post, assessments: [...], candidatePostStepProgress }
  const groupedData = useSelector(selectCandidateAssessments) as GroupedAssessment[];
  const loading = useSelector(selectCandidateAssessmentsLoading);
  const pagination = useSelector(selectCandidateAssessmentsPagination);

  // Local state for search, sort, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Step info modal state
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<PostAssessment | null>(null);

  // Early return if hidden
  if (hidden) {
    return null;
  }

  // Fetch assessments on mount
  useEffect(() => {
    dispatch(fetchCandidateAssessments({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Convert grouped data to PostAssessment format (one per post, using latest assessment)
  const assessments = useMemo(() => {
    return groupedData.map((group) => {
      // Get the latest assessment from the group
      const sortedAssessments = [...(group.assessments || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestAssessment = sortedAssessments[0] || {};

      return {
        ...latestAssessment,
        _id: latestAssessment._id || group.post?._id,
        post: latestAssessment.post || group.post,
        company: latestAssessment.company,
        candidatePostStepProgress: group.candidatePostStepProgress,
        // Store all assessments count for display if needed
        assessmentsCount: group.assessments?.length || 0,
      } as PostAssessment;
    });
  }, [groupedData]);

  // Calculate stats from grouped data (per post/application)
  const stats = useMemo(() => {
    let completed = 0;
    let ongoing = 0;

    groupedData.forEach((group) => {
      const stepProgress = group.candidatePostStepProgress;

      // Check if all steps are completed
      if (stepProgress?.steps && stepProgress.steps.length > 0) {
        const allStepsDone = stepProgress.steps.every(
          (step: any) => step.status === 'done' || step.status === 'passed'
        );
        if (allStepsDone) {
          completed++;
        } else {
          ongoing++;
        }
      } else {
        // No step progress - check if any assessment has good score
        const hasCompletedAssessment = (group.assessments || []).some((a: any) => {
          const score = a.interviewData?.finalReport?.coverage?.overall || 0;
          return score >= 50;
        });
        if (hasCompletedAssessment) {
          completed++;
        } else {
          ongoing++;
        }
      }
    });

    return {
      total: pagination.total || groupedData.length,
      completed,
      ongoing,
    };
  }, [groupedData, pagination.total]);

  const handleViewDetails = (assessmentId: string) => {
    router.push(`/assessment/${assessmentId}`);
  };

  const handleContinueTest = (assessment: PostAssessment) => {
    setSelectedAssessment(assessment);
    setStepModalOpen(true);
  };

  const handleStartStep = () => {
    if (!selectedAssessment) return;
    const postId = selectedAssessment.post?._id;
    const currentStep = selectedAssessment.candidatePostStepProgress?.currentStep;

    if (postId && currentStep) {
      setStepModalOpen(false);
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
            {displayAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment._id}
                assessment={assessment}
                onViewDetails={handleViewDetails}
                onContinueTest={handleContinueTest}
              />
            ))}
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

      {/* Step Info Modal */}
      <StepInfoModal
        open={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        onStart={handleStartStep}
        assessment={selectedAssessment}
      />
    </Box>
  );
};

export default dynamic(() => Promise.resolve(PostInterviews), {
  ssr: false,
});
