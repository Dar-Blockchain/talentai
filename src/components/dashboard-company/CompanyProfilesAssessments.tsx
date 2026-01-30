import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { SearchOff } from "@mui/icons-material";
import { AppDispatch } from "@/store/store";
import {
  fetchCompanyAssessments,
  selectCompanyAssessments,
  selectCompanyAssessmentsLoading,
  selectCompanyAssessmentsError,
} from "@/store/slices/postSlice";

// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: "white",
  borderRadius: "12px",
  border: "1px solid rgba(84,98,116,0.1)",
}));

const CompanyProfilesAssessments: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const companyProfiles = useSelector(selectCompanyAssessments);
  const isLoadingProfiles = useSelector(selectCompanyAssessmentsLoading);
  const profilesError = useSelector(selectCompanyAssessmentsError);

  // Local state for UI controls
  const [displayedAssessments, setDisplayedAssessments] = useState(10);
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState("all");
  const [assessmentSort, setAssessmentSort] = useState("date_desc");

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchCompanyAssessments({}));
  }, [dispatch]);

  const handleViewAssessmentDetails = (assessmentId: string) => {
    router.push(`/assessment/${assessmentId}`);
  };

  // Helpers
  const getCandidateName = (a: any) =>
    (a?.candidateName || a?.candidate?.username || "").toLowerCase();
  const getCandidateEmail = (a: any) =>
    a?.candidateEmail || a?.candidate?.email || "";
  const getJobTitle = (a: any) =>
    (a?.jobTitle || a?.post?.jobDetails?.title || "").toLowerCase();
  const getScore = (a: any) => {
    const coverage = Number(a?.coverageScore);
    if (!Number.isNaN(coverage) && coverage > 0) return coverage;
    const analyticsCoverage = Number(a?.analytics?.coveragePercentage);
    if (!Number.isNaN(analyticsCoverage)) return analyticsCoverage;
    return 0;
  };
  const getDate = (a: any) =>
    new Date(a?.createdAt || a?.timestamp || 0).getTime();
  const getStatus = (a: any) => {
    const stepProgress = a?.candidatePostStepProgress;
    if (stepProgress?.steps && stepProgress.steps.length > 0) {
      const allDone = stepProgress.steps.every(
        (step: any) => step.status === "done" || step.status === "passed"
      );
      return allDone ? "good" : "poor";
    }
    const score = getScore(a);
    const completedAreas = a?.analytics?.completedAreas || 0;
    const totalAreas = a?.analytics?.totalAreas || 4;
    const completionRate =
      totalAreas > 0 ? (completedAreas / totalAreas) * 100 : 0;
    const effectiveScore = score > 0 ? score : completionRate;
    return effectiveScore >= 50 ? "good" : "poor";
  };
  const getStepProgress = (a: any) => {
    const stepProgress = a?.candidatePostStepProgress;
    if (!stepProgress?.steps || stepProgress.steps.length === 0) return null;
    const total = stepProgress.steps.length;
    const completed = stepProgress.steps.filter(
      (s: any) => s.status === "done" || s.status === "passed"
    ).length;
    const currentStep = stepProgress.currentStep;
    return { total, completed, currentStep };
  };
  // Filter, sort, paginate
  const { visibleAssessments, sortedCount, hasMore } = useMemo(() => {
    const normalizedSearch = assessmentSearch.toLowerCase().trim();
    const filtered = companyProfiles.filter((assessment: any) => {
      const candidateName = getCandidateName(assessment);
      const jobTitle = getJobTitle(assessment);
      const matchesSearch =
        !normalizedSearch ||
        candidateName.includes(normalizedSearch) ||
        jobTitle.includes(normalizedSearch);
      const status = getStatus(assessment);
      const matchesStatus =
        assessmentStatusFilter === "all" || assessmentStatusFilter === status;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered].sort((a: any, b: any) => {
      const scoreA = getScore(a);
      const scoreB = getScore(b);
      const nameA = getCandidateName(a);
      const nameB = getCandidateName(b);
      const jobA = getJobTitle(a);
      const jobB = getJobTitle(b);
      const dateA = getDate(a);
      const dateB = getDate(b);
      switch (assessmentSort) {
        case "date_asc":
          return dateA - dateB;
        case "score_desc":
          return scoreB - scoreA;
        case "score_asc":
          return scoreA - scoreB;
        case "candidate_asc":
          return nameA.localeCompare(nameB);
        case "candidate_desc":
          return nameB.localeCompare(nameA);
        case "job_asc":
          return jobA.localeCompare(jobB);
        case "job_desc":
          return jobB.localeCompare(jobA);
        case "date_desc":
        default:
          return dateB - dateA;
      }
    });

    return {
      visibleAssessments: sorted.slice(0, displayedAssessments),
      sortedCount: sorted.length,
      hasMore: sorted.length > displayedAssessments,
    };
  }, [
    companyProfiles,
    assessmentSearch,
    assessmentStatusFilter,
    assessmentSort,
    displayedAssessments,
  ]);

  const renderCompanyProfilesTable = () => {
    if (isLoadingProfiles) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "rgba(19, 163, 108, 0.83)" }} />
        </Box>
      );
    }

    if (profilesError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {profilesError}
        </Alert>
      );
    }

    if (!companyProfiles || companyProfiles.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
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
            variant="h6"
            sx={{
              color: "rgba(19, 163, 108, 0.83)",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "28px",
              mb: 1,
            }}
          >
            No Assessments Found
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(147, 147, 147, 1)",
              maxWidth: "500px",
              mb: 4,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "25px",
              textAlign: "center",
            }}
          >
            There are no assessments available at the moment.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "none",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Candidate
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Job Title
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Progress
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleAssessments.map((assessment: any) => {
                const isGoodMatch = getStatus(assessment) === "good";

                return (
                  <TableRow
                    key={assessment._id}
                    sx={{
                      "&:hover": { backgroundColor: "#f9fafb" },
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#111827",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "#f3f4f6",
                            color: "#111827",
                            width: 40,
                            height: 40,
                            fontSize: 16,
                            fontWeight: 600,
                            border: "2px solid #e5e7eb",
                          }}
                        >
                          {(
                            assessment?.candidateName ||
                            assessment?.candidate?.username ||
                            "U"
                          )?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: "#111827",
                            }}
                          >
                            {assessment?.candidateName ||
                              assessment?.candidate?.username ||
                              "Unknown User"}
                          </Typography>
                          {getCandidateEmail(assessment) && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                fontSize: "0.75rem",
                                filter: "blur(4px)",
                                userSelect: "none",
                              }}
                            >
                              {getCandidateEmail(assessment)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Typography
                        onClick={() => {
                          const postId = assessment?.post?._id;
                          if (postId) router.push(`/posts/${postId}`);
                        }}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#111827",
                          cursor: "pointer",
                          "&:hover": {
                            color: "#10b981",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {assessment?.jobTitle ||
                          assessment?.post?.jobDetails?.title ||
                          "Unknown Job"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {new Date(getDate(assessment)).toLocaleDateString(
                        "en-US",
                        { month: "2-digit", day: "2-digit", year: "numeric" }
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e5e7eb" }}>
                      {(() => {
                        const progress = getStepProgress(assessment);
                        if (!progress) {
                          return (
                            <Typography
                              sx={{
                                color: "#9ca3af",
                                fontSize: "0.75rem",
                              }}
                            >
                              —
                            </Typography>
                          );
                        }
                        const pct =
                          progress.total > 0
                            ? Math.round(
                                (progress.completed / progress.total) * 100
                              )
                            : 0;
                        return (
                          <Box sx={{ minWidth: 100 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.7rem",
                                  color: "#6b7280",
                                  fontWeight: 500,
                                }}
                              >
                                {progress.completed}/{progress.total} steps
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.7rem",
                                  color: "#6b7280",
                                  fontWeight: 500,
                                }}
                              >
                                {pct}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: "#f3f4f6",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 3,
                                  backgroundColor:
                                    pct === 100 ? "#10b981" : "#f59e0b",
                                },
                              }}
                            />
                          </Box>
                        );
                      })()}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e5e7eb" }}>
                      <Chip
                        label={isGoodMatch ? "Completed" : "In Progress"}
                        size="small"
                        sx={{
                          backgroundColor: isGoodMatch ? "#d1fae5" : "#fef3c7",
                          color: isGoodMatch ? "#065f46" : "#92400e",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          border: "none",
                          borderRadius: "6px",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e5e7eb" }}>
                      <IconButton
                        onClick={() =>
                          handleViewAssessmentDetails(assessment._id)
                        }
                        sx={{
                          color: "#10b981",
                          "&:hover": {
                            backgroundColor: "#d1fae5",
                          },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {visibleAssessments.length === 0 && !isLoadingProfiles && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              No assessments found
            </Typography>
          </Box>
        )}
        {hasMore && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              onClick={() => setDisplayedAssessments((prev) => prev + 10)}
              sx={{
                textTransform: "none",
                color: "#10b981",
                fontWeight: 500,
                "&:hover": { backgroundColor: "rgba(16, 185, 129, 0.08)" },
              }}
            >
              Load More ({sortedCount - displayedAssessments} remaining)
            </Button>
          </Box>
        )}
      </>
    );
  };

  return (
    <StyledCard sx={{ mb: 3 }}>
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
            color: "rgba(0, 0, 0, 1)",
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "100%",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: 0,
              width: "40px",
              height: "5px",
              backgroundColor: "#10b981",
              borderRadius: "2px",
            },
          }}
        >
          Company Profiles & Assessments
        </Typography>
      </Box>

      {renderCompanyProfilesTable()}
    </StyledCard>
  );
};

export default CompanyProfilesAssessments;
