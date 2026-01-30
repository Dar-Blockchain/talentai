import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { SearchOff } from "@mui/icons-material";

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
  const [companyProfiles, setCompanyProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [displayedAssessments, setDisplayedAssessments] = useState(10);
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState("all");
  const [assessmentSort, setAssessmentSort] = useState("date_desc");

  const fetchCompanyProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      setProfilesError(null);
      const token = localStorage.getItem("api_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}post-interview-assessments/company/mine`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch company assessments");
      }

      const data = await response.json();
      let normalized: any[] = [];

      // Handle the new grouped-by-post API response:
      // { success, message, count, data: [{ post, assessments: [{ assessment, candidatePostStepProgress }] }] }
      const rawData = data?.data || data;

      if (Array.isArray(rawData)) {
        // Check if it's the new grouped format (array of { post, assessments })
        if (rawData.length > 0 && rawData[0]?.assessments && rawData[0]?.post) {
          // New grouped format: flatten assessments from all posts
          rawData.forEach((group: any) => {
            const post = group.post;
            if (Array.isArray(group.assessments)) {
              group.assessments.forEach((item: any) => {
                const a = item.assessment || item;
                normalized.push({
                  ...a,
                  // Ensure post is available at top level
                  post: a.post || post,
                  // Attach step progress if available
                  candidatePostStepProgress: item.candidatePostStepProgress || null,
                });
              });
            }
          });
        } else {
          // Legacy flat array format
          normalized = rawData;
        }
      } else if (Array.isArray(rawData?.results)) {
        normalized = rawData.results;
      } else if (Array.isArray(rawData?.assessments)) {
        normalized = rawData.assessments;
      }

      // Map the response to a consistent format
      const mappedAssessments = normalized.map((a: any) => ({
        _id: a._id,
        candidate: a.candidate,
        candidateName: a.candidate?.username || "",
        candidateEmail: a.candidate?.email || "",
        post: a.post,
        jobTitle: a.post?.jobDetails?.title || "",
        jobStatus: a.post?.status || "",
        interviewData: a.interviewData,
        interviewType: a.interviewData?.interviewType || "HR_INTERVIEW",
        coverageScore: a.interviewData?.finalReport?.coverage?.overall || 0,
        analytics: a.interviewData?.analytics,
        duration: a.interviewData?.analytics?.duration || 0,
        messageCount: a.interviewData?.analytics?.messageCount || 0,
        timestamp: a.createdAt || a.timestamp,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        summary: a.interviewData?.finalReport?.summary || "",
        recommendations: a.interviewData?.finalReport?.recommendations || [],
        coverageAreas: a.interviewData?.finalReport?.coverage?.areas || {},
        aiAnalysis: a.interviewData?.finalReport?.aiAnalysis || {},
        completed: a.completed,
        candidatePostStepProgress: a.candidatePostStepProgress,
        raw: a,
      }));

      setCompanyProfiles(mappedAssessments);
    } catch (error) {
      setProfilesError("Failed to fetch company assessments");
      console.error("Error fetching company assessments:", error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfiles();
  }, []);

  const handleViewAssessmentDetails = (assessmentId: string) => {
    router.push(`/assessment/${assessmentId}`);
  };

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
    const getInterviewType = (a: any) =>
      a?.interviewType || a?.interviewData?.interviewType || "HR_INTERVIEW";
    const getStatus = (a: any) => {
      const score = getScore(a);
      const completedAreas = a?.analytics?.completedAreas || 0;
      const totalAreas = a?.analytics?.totalAreas || 4;
      const completionRate = totalAreas > 0 ? (completedAreas / totalAreas) * 100 : 0;
      const effectiveScore = score > 0 ? score : completionRate;
      return effectiveScore >= 50 ? "good" : "poor";
    };
    const formatDuration = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${remainingSeconds}s`;
    };

    // Apply search, filter, and sort
    const normalizedSearch = assessmentSearch.toLowerCase().trim();
    const filteredAssessments = companyProfiles.filter((assessment: any) => {
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

    const sortedAssessments = [...filteredAssessments].sort(
      (a: any, b: any) => {
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
      }
    );

    const visibleAssessments = sortedAssessments.slice(0, displayedAssessments);
    const hasMore = sortedAssessments.length > displayedAssessments;

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
                  Interview Type
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Duration
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
                  Coverage
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
              {visibleAssessments.map((assessment) => {
                const score = getScore(assessment);
                const isGoodMatch = getStatus(assessment) === "good";
                const interviewType = getInterviewType(assessment);
                const duration = formatDuration(assessment.duration || 0);

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
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
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
                          {(assessment?.candidateName || assessment?.candidate?.username || "U")?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: "#111827",
                            }}
                          >
                            {assessment?.candidateName || assessment?.candidate?.username || "Unknown User"}
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
                        color: "#111827",
                        fontSize: "0.875rem",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {assessment?.jobTitle || assessment?.post?.jobDetails?.title || "Unknown Job"}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <Chip
                        label={interviewType.replace(/_/g, " ")}
                        size="small"
                        sx={{
                          backgroundColor: "#ede9fe",
                          color: "#7c3aed",
                          fontWeight: 500,
                          fontSize: "0.7rem",
                          border: "none",
                          borderRadius: "6px",
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.875rem",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {duration}
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
                    <TableCell
                      sx={{
                        color: "#111827",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {Math.round(score)}%
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
                        onClick={() => handleViewAssessmentDetails(assessment._id)}
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
              Load More ({sortedAssessments.length - displayedAssessments} remaining)
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

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search Candidates"
            value={assessmentSearch}
            onChange={(e) => setAssessmentSearch(e.target.value)}
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
          <Select
            size="small"
            value={assessmentSort}
            onChange={(e) => setAssessmentSort(e.target.value as string)}
            displayEmpty
            sx={{
              height: "40px",
              minWidth: 200,
              borderRadius: "42px",
              px: 2.5,
              textTransform: "uppercase",
              fontWeight: 400,
              fontSize: "0.875rem",
              backgroundColor: "white",
              color: "rgba(84, 98, 116, 1)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(165, 172, 181, 1)",
                borderWidth: "1px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(165, 172, 181, 0.8)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(165, 172, 181, 1)",
              },
            }}
          >
            <MenuItem value="date_desc">Newest first</MenuItem>
            <MenuItem value="date_asc">Oldest first</MenuItem>
            <MenuItem value="score_desc">Highest score</MenuItem>
            <MenuItem value="score_asc">Lowest score</MenuItem>
            <MenuItem value="candidate_asc">Candidate A→Z</MenuItem>
            <MenuItem value="candidate_desc">Candidate Z→A</MenuItem>
            <MenuItem value="job_asc">Job A→Z</MenuItem>
            <MenuItem value="job_desc">Job Z→A</MenuItem>
          </Select>
        </Box>
      </Box>

      {renderCompanyProfilesTable()}
    </StyledCard>
  );
};

export default CompanyProfilesAssessments;
