import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Pagination,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Image from "next/image";
import { useRouter } from "next/router";
import { SearchOff, ArrowForward, ArrowBack } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useToast } from "@/hooks/useToast";
import DeletePostModal from "../posts/delete/DeletePostModal";
import { useDeletePost } from "../posts/delete/useDeletePost";

// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: "white",
  borderRadius: "12px",
  border: "1px solid rgba(84,98,116,0.1)",
}));

const JobCard = styled(Box)(({ theme }) => ({
  background: "white",
  borderRadius: "8px",
  padding: theme.spacing(3),
  border: "1px solid rgba(228, 229, 232, 1)",
  marginBottom: theme.spacing(2),
  boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
  transition: "border-color 0.2s",
  "&:hover": {
    borderColor: "#d1d5db",
  },
}));

interface MyJobPostsProps {
  myJobs: any[];
  isLoadingJobs: boolean;
  jobsError: string | null;
  onViewMatches: (jobId: string) => void;
  onRefresh?: () => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  onSortChange?: (sort: "newest" | "oldest" | "title-asc" | "title-desc") => void;
  searchQuery?: string;
  sortBy?: "newest" | "oldest" | "title-asc" | "title-desc";
  onViewAll?: () => void;
  onBackToAll?: () => void;
  hidden?: boolean;
  showViewAll?: boolean;
  initialDisplayCount?: number;
}

const MyJobPosts: React.FC<MyJobPostsProps> = ({
  myJobs,
  isLoadingJobs,
  jobsError,
  onViewMatches,
  onRefresh,
  pagination,
  onPageChange,
  onSearchChange,
  onSortChange,
  searchQuery: externalSearchQuery,
  sortBy: externalSortBy,
  onViewAll,
  onBackToAll,
  hidden = false,
  showViewAll = false,
  initialDisplayCount = 3,
}) => {
  const router = useRouter();
    const { showToast } = useToast();
  

  // Early return if hidden
  if (hidden) {
    return null;
  }
  // State for job details modal
  const [jobDetailsModalOpen, setJobDetailsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobToDeleteId, setJobToDeleteId] = useState<string | null>(null);

  // Get the latest job data from myJobs array based on selectedJobId
  const selectedJobForDetails = selectedJobId
    ? myJobs.find((job: any) => job._id === selectedJobId)
    : null;

  // Use external search and sort if provided, otherwise use local state
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localSortBy, setLocalSortBy] = useState<
    "newest" | "oldest" | "title-asc" | "title-desc"
  >("newest");
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const sortBy = externalSortBy !== undefined ? externalSortBy : localSortBy;

  // When using server-side pagination, backend handles filtering and sorting
  // When in overview mode (showViewAll && !pagination), limit displayed jobs
  const displayJobs = showViewAll && !pagination
    ? myJobs.slice(0, initialDisplayCount)
    : myJobs;

  const currentJobs = displayJobs;
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

    const deletePost = useDeletePost({
      postId: jobToDeleteId!,
      refetchAfterDelete: true,
      onSuccess: () =>
        showToast({
          message: "Post deleted successfully",
          severity: "success",
        }),
      onError: () => () =>
        showToast({
          message: "Failed to delete post",
          severity: "success",
        }),
    });

  const handleCloseJobDetailsModal = () => {
    setJobDetailsModalOpen(false);
    setSelectedJobId(null);
  };

  // Handler for pagination
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (onPageChange) {
      // Use server-side pagination
      onPageChange(value);
    }
  };

  // Handlers for sort menu
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortChange = (
    sortOption: "newest" | "oldest" | "title-asc" | "title-desc"
  ) => {
    if (onSortChange) {
      // Use parent callback for server-side sorting
      onSortChange(sortOption);
    } else {
      // Fall back to local state
      setLocalSortBy(sortOption);
    }
    // Reset to first page when sorting
    if (onPageChange) {
      onPageChange(1);
    }
    handleSortMenuClose();
  };

  // Reset to first page when search changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (onSearchChange) {
      // Use parent callback for server-side search
      onSearchChange(value);
    } else {
      // Fall back to local state
      setLocalSearchQuery(value);
    }
    // Reset to first page when searching
    if (onPageChange) {
      onPageChange(1);
    }
  };

  // Handler for copying interview link
  const handleCopyInterviewLink = (jobId: string) => {
    const interviewLink = `${window.location.origin}/interview/hr?jobId=${jobId}`;

    navigator.clipboard.writeText(interviewLink)
      .then(() => {
        toast.success('Interview link copied to clipboard!', {
          position: 'bottom-right',
          autoClose: 2000
        });
      })
      .catch((error) => {
        console.error('Error copying link:', error);
        toast.error('Failed to copy link');
      });
  };

  const handleCloseDeleteModal = () => {
  deletePost.handleClose();
  setJobToDeleteId(null);
};

  return (
    <StyledCard>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "100%",
            color: "#111827",
          }}
        >
          <span
            style={{
              borderBottom: "5px solid rgba(41, 210, 145, 0.83)",
              paddingBottom: "2px",
            }}
          >
            Our
          </span>{" "}
          Job Posts
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Search and Sort Controls - Only show in full view */}
          {!showViewAll && (
            <>
              <TextField
                size="small"
                placeholder="Search Jobs"
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
                  width: 280,
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
                    alt="search"
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
            </>
          )}

          {/* View All Button */}
          {showViewAll && onViewAll && (
            <Button
              variant="outlined"
              onClick={onViewAll}
              endIcon={<ArrowForward />}
              sx={{
                border: "none",
                background: "none",
                color: "rgba(41, 210, 145, 1)",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                px: 2,
                "&:hover": {
                  background: "rgba(41, 210, 145, 0.04)",
                  border: "none",
                },
              }}
            >
              View All
            </Button>
          )}

          {/* Back Button - After Sort */}
          {!showViewAll && onBackToAll && (
            <Button
              variant="outlined"
              onClick={onBackToAll}
              startIcon={<ArrowBack />}
              sx={{
                border: "none",
                background: "none",
                color: "rgba(41, 210, 145, 1)",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                px: 2,
                "&:hover": {
                  background: "rgba(41, 210, 145, 0.04)",
                  border: "none",
                },
              }}
            >
              Back
            </Button>
          )}
        </Box>
      </Box>

      {/* Job Cards */}
      {isLoadingJobs ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "rgba(19, 163, 108, 0.83)" }} />
        </Box>
      ) : jobsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {jobsError}
        </Alert>
      ) : myJobs.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 4,
            backgroundColor: "rgba(62, 233, 167, 0.03)",
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
              backgroundColor: "rgba(76, 217, 163, 0.2)",
              width: 100,
              height: 100,
              borderRadius: "50%",
            }}
          >
            <SearchOff
              sx={{ fontSize: 48, color: "rgba(19, 163, 108, 0.83)" }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(19, 163, 108, 0.83)",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontStyle: "medium",
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "0",
              mb: 2,
            }}
          >
            You Haven’t Created Any Job Posts Yet
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(147, 147, 147, 1)",
              maxWidth: "500px",
              mb: 4,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontStyle: "normal", // "Regular" is not valid CSS → use "normal"
              fontSize: "14px",
              lineHeight: "25px",
              letterSpacing: "0px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            Start by creating your first job post to begin attracting qualified
            candidates. Your posted jobs will appear here.
          </Typography>
        </Box>
      ) : currentJobs.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 4,
            backgroundColor: "rgba(62, 233, 167, 0.03)",
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
              backgroundColor: "rgba(76, 217, 163, 0.2)",
              width: 100,
              height: 100,
              borderRadius: "50%",
            }}
          >
            <SearchOff
              sx={{ fontSize: 48, color: "rgba(19, 163, 108, 0.83)" }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(19, 163, 108, 0.83)",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontStyle: "medium",
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "0",
              mb: 2,
            }}
          >
            No Jobs Match Your Search Criteria
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(147, 147, 147, 1)",
              maxWidth: "500px",
              mb: 4,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontStyle: "normal", // "Regular" is not valid CSS → use "normal"
              fontSize: "14px",
              lineHeight: "25px",
              letterSpacing: "0px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            Try adjusting your search terms or filters to find the job post
            you're looking for.{" "}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {currentJobs.map((job: any) => (
              <JobCard key={job._id}>
                {/* Header with Title and Date */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "rgba(24, 25, 28, 1)",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontStyle: "medium",
                        fontSize: {
                          xs: "14px", // mobile
                          sm: "16px", // small tablet
                          md: "18px", // tablet/desktop
                          lg: "18px", // large desktop
                        },
                        lineHeight: {
                          xs: "20px",
                          sm: "24px",
                          md: "28px",
                          lg: "28px",
                        },
                        letterSpacing: "0%",
                      }}
                    >
                      {job.jobDetails.title}
                    </Typography>
                    {/* Draft Status Badge */}
                    {job.status === 'draft' && (
                      <Chip
                        label="📝 Draft"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(156, 163, 175, 0.1)',
                          color: '#6B7280',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                          border: '1px solid #9CA3AF',
                        }}
                      />
                    )}
                    {/* Creation Type Badge */}
                    {job.creationType && (
                      <Chip
                        label={
                          job.creationType === 'ai'
                            ? '🤖 AI Generated'
                            : job.creationType === 'pipeline'
                              ? '⚙️ Pipeline'
                              : '✍️ Manual'
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            job.creationType === 'ai'
                              ? 'rgba(131, 16, 255, 0.1)'
                              : job.creationType === 'pipeline'
                                ? 'rgba(2, 226, 255, 0.1)'
                                : 'rgba(255, 152, 0, 0.1)',
                          color:
                            job.creationType === 'ai'
                              ? '#8310FF'
                              : job.creationType === 'pipeline'
                                ? '#02E2FF'
                                : '#FF9800',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22,
                          border: `1px solid ${job.creationType === 'ai'
                              ? '#8310FF'
                              : job.creationType === 'pipeline'
                                ? '#02E2FF'
                                : '#FF9800'
                            }`,
                        }}
                      />
                    )}
                  </Box>
                  {job.createdAt && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(84, 98, 116, 0.53)",
                        fontFamily: "Poppins",
                        fontWeight: 400,
                        fontSize: {
                          xs: "10px", // mobile
                          sm: "11px", // tablet
                          md: "12px", // desktop
                        },
                        lineHeight: {
                          xs: "19px",
                          sm: "21px",
                          md: "23px",
                        },
                        letterSpacing: "0px",
                        ml: 2,
                      }}
                    >
                      Date Posted :{" "}
                      {new Date(job.createdAt).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </Typography>
                  )}
                </Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ flexWrap: "wrap", gap: 0.5 }}
                >
                  {job?.jobDetails?.workMode && <Chip
                    label={job.jobDetails.workMode}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(95, 168, 211, 0.1)",
                      color: "rgba(84, 98, 116, 1)",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      height: 24,
                      border: "0.25px solid rgba(95, 168, 211, 1)",
                    }}
                    icon={
                      <Image
                        src="/icons/location2.svg"
                        alt="search"
                        width={13}
                        height={13}
                      />
                    }
                  />}
                  <Chip
                    label={job.jobDetails.employmentType}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(95, 168, 211, 0.1)",
                      color: "rgba(84, 98, 116, 1)",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      height: 24,
                      border: "0.25px solid rgba(95, 168, 211, 1)",
                    }}
                    icon={
                      <Image
                        src="/icons/suitcase.svg"
                        alt="search"
                        width={13}
                        height={13}
                      />
                    }
                  />
                  <Chip
                    label={`${job.jobDetails.salary.currency} ${job.jobDetails.salary.min} - ${job.jobDetails.salary.currency} ${job.jobDetails.salary.max}`}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(95, 168, 211, 0.1)",
                      color: "rgba(84, 98, 116, 1)",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      height: 24,
                      border: "0.25px solid rgba(95, 168, 211, 1)",
                    }}
                    icon={
                      <Image
                        src="/icons/dollar.svg"
                        alt="search"
                        width={13}
                        height={13}
                      />
                    }
                  />
                </Stack>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(0, 0, 0, 1)",
                    mt: 1.3,
                    mb: 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    fontFamily: "Poppins",
                    fontWeight: 400,
                    fontStyle: "normal",
                    fontSize: "12px",
                    lineHeight: "23px",
                    letterSpacing: "0px",
                    maxWidth: "700px",
                  }}
                >
                  {job.jobDetails.description}
                </Typography>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                  }}
                >
                  {job.status === 'draft' ? (
                    // Draft status - only show View Details button
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => router.push('/posts/'+job._id)}
                        //onClick={() => handleViewJobDetails(job)}
                        sx={{
                          borderColor: "rgba(11, 82, 198, 1)",
                          color: "rgba(11, 82, 198, 1)",
                          textTransform: "uppercase",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          py: 1.25,
                          borderRadius: "38px",
                          maxWidth: "250px",
                          width: '250px',
                          height: "42px",
                          backgroundColor: "rgba(11, 82, 198, 0.08)",
                          "&:hover": {
                            borderColor: "#2563eb",
                            backgroundColor: "rgba(11, 82, 198, 0.04)",
                          },
                        }}
                      >
                        VIEW DETAILS
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={
                          <Image
                            src="/icons/delete.svg"
                            alt="search"
                            width={20}
                            height={20}
                          />
                        }
                        onClick={() => {
                          setJobToDeleteId(job._id);
                          deletePost.handleOpen();
                        }}
                        sx={{
                          borderColor: "rgba(224, 62, 92, 1)",
                          color: "rgba(224, 62, 92, 1)",
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          py: 1.25,
                          borderRadius: "38px",
                          maxWidth: "200px",
                          height: "42px",
                          backgroundColor: "rgba(224, 62, 92, 0.08)",
                          "&:hover": {
                            borderColor: "rgba(224, 62, 92, 1)",
                            backgroundColor: "rgba(224, 62, 92, 0.04)",
                          },
                        }}
                      >
                        Delete Job
                      </Button>
                    </>
                  ) : (
                    // Active status - show all buttons
                    <>
                      <Box sx={{ display: "flex", gap: 1, flex: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="outlined"
                          fullWidth
                          // onClick={() => handleViewJobDetails(job)}
                          onClick={() => router.push('/posts/'+job._id)}
                          sx={{
                            borderColor: "rgba(11, 82, 198, 1)",
                            color: "rgba(11, 82, 198, 1)",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            py: 1.25,
                            borderRadius: "38px",
                            maxWidth: "250px",
                            height: "42px",
                            backgroundColor: "rgba(11, 82, 198, 0.08)",
                            "&:hover": {
                              borderColor: "#2563eb",
                              backgroundColor: "rgba(11, 82, 198, 0.04)",
                            },
                          }}
                        >
                          VIEW DETAILS
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => onViewMatches(job._id)}
                          sx={{
                            borderColor: "rgba(84, 98, 116, 0.53)",
                            color: "rgba(84, 98, 116, 1)",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            borderRadius: "38px",
                            maxWidth: "250px",
                            height: "42px",
                            py: 1.25,
                            backgroundColor: "rgba(84, 98, 116, 0.08)",
                            "&:hover": {
                              borderColor: "rgba(84, 98, 116, 0.53)",
                              backgroundColor: "rgba(84, 98, 116, 0.04)",
                            },
                          }}
                        >
                          VIEW MATCHES
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<ContentCopyIcon />}
                          onClick={() => handleCopyInterviewLink(job._id)}
                          sx={{
                            borderColor: "rgba(16, 185, 129, 1)",
                            color: "rgba(16, 185, 129, 1)",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            borderRadius: "38px",
                            maxWidth: "250px",
                            height: "42px",
                            py: 1.25,
                            backgroundColor: "rgba(16, 185, 129, 0.08)",
                            "&:hover": {
                              borderColor: "rgba(5, 150, 105, 1)",
                              backgroundColor: "rgba(16, 185, 129, 0.12)",
                            },
                          }}
                        >
                          COPY LINK
                        </Button>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={
                          <Image
                            src="/icons/delete.svg"
                            alt="search"
                            width={20}
                            height={20}
                          />
                        }
                                                onClick={() => {
                          setJobToDeleteId(job._id);
                          deletePost.handleOpen();
                        }}
                        sx={{
                          borderColor: "rgba(224, 62, 92, 1)",
                          color: "rgba(224, 62, 92, 1)",
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          py: 1.25,
                          borderRadius: "38px",
                          maxWidth: "200px",
                          height: "42px",
                          backgroundColor: "rgba(224, 62, 92, 0.08)",
                          "&:hover": {
                            borderColor: "rgba(224, 62, 92, 1)",
                            backgroundColor: "rgba(224, 62, 92, 0.04)",
                          },
                        }}
                      >
                        Delete Job
                      </Button>
                    </>
                  )}
                </Box>
              </JobCard>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
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
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
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
        </>
      )}

      <DeletePostModal
        open={deletePost.open}
        onClose={handleCloseDeleteModal}
        onDelete={deletePost.handleDelete}
        isDeleting={deletePost.isDeleting}
      />
    </StyledCard>
  );
};

export default MyJobPosts;
