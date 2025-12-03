import React, { useState, useEffect } from "react";
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
  Card,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import BusinessIcon from "@mui/icons-material/Business";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import AssessmentDetailsModal from "./AssessmentDetailsModal";
import { SearchOff } from "@mui/icons-material";

// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: "white",
  borderRadius: "12px",
  border: "1px solid rgba(84,98,116,0.1)",
}));

interface CompanyProfilesAssessmentsProps {
  profile: any;
}

const CompanyProfilesAssessments: React.FC<CompanyProfilesAssessmentsProps> = ({
  profile,
}) => {
  const [companyProfiles, setCompanyProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [displayedAssessments, setDisplayedAssessments] = useState(10);
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState("all");
  const [assessmentSort, setAssessmentSort] = useState("date_desc");
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  // Add function to fetch company profiles
  const fetchCompanyProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      setProfilesError(null);
      const token = localStorage.getItem("api_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getCompanyWithAssessments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch company profiles");
      }

      const data = await response.json();
      let normalized: any[] = [];
      if (Array.isArray(data)) {
        normalized = data;
      } else if (Array.isArray((data as any)?.results)) {
        normalized = (data as any).results;
      } else if (Array.isArray((data as any)?.data)) {
        normalized = (data as any).data;
      } else if (Array.isArray((data as any)?.assessments)) {
        // New API shape: { companyId, totalCandidates, assessments: [...] }
        normalized = (data as any).assessments.map((a: any) => ({
          _id: `${a.candidateId || "cand"}-${a.jobId || "job"}`,
          candidateName: a.candidateInfo?.name || "",
          candidateEmail: a.candidateInfo?.email || "",
          jobTitle: a.jobInfo?.title || "",
          timestamp: a.assessmentSummary?.latestAssessment || a.timestamp,
          overallScore:
            Number(
              a.assessmentSummary?.jobMatch?.percentage ??
                a.assessmentSummary?.averageOverallScore ??
                0
            ) || 0,
          jobMatchStatus: a.assessmentSummary?.jobMatch?.status || undefined,
          raw: a,
        }));
      } else {
        normalized = [];
      }
      setCompanyProfiles(normalized);
    } catch (error) {
      setProfilesError("Failed to fetch company profiles");
      console.error("Error fetching company profiles:", error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Add useEffect to fetch profiles when component mounts
  useEffect(() => {
    // Only fetch company profiles if user is a company
    if (
      profile &&
      (profile.userId.role === "Company" || profile.userId.role === "company")
    ) {
      fetchCompanyProfiles();
    }
  }, [profile]);

  const handleViewAssessmentDetails = (assessment: any) => {
    setSelectedAssessment(assessment);
    setAssessmentModalOpen(true);
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
              fontStyle: "medium",
              fontSize: "20px",
              lineHeight: "28px",
              letterSpacing: "0",
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
              fontStyle: "normal",
              fontSize: "14px",
              lineHeight: "25px",
              letterSpacing: "0px",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            There are no assessments available at the moment.
          </Typography>
        </Box>
      );
    }

    // Helpers to support multiple API shapes
    const getCandidateName = (a: any) =>
      (
        a?.condidateId?.userId?.username ||
        a?.candidateName ||
        a?.candidateInfo?.name ||
        ""
      ).toLowerCase();
    const getCandidateEmail = (a: any) =>
      a?.condidateId?.userId?.email ||
      a?.candidateEmail ||
      a?.candidateInfo?.email ||
      "";
    const getJobTitle = (a: any) =>
      (
        a?.jobId?.jobDetails?.title ||
        a?.jobTitle ||
        a?.jobInfo?.title ||
        ""
      ).toLowerCase();
    const getScore = (a: any) => {
      const s1 = Number(a?.analysis?.overallScore);
      if (!Number.isNaN(s1) && s1 > 0) return s1;
      const s2 = Number(a?.overallScore);
      if (!Number.isNaN(s2)) return s2;
      const s3 = Number(a?.assessmentSummary?.jobMatch?.percentage);
      if (!Number.isNaN(s3)) return s3;
      const s4 = Number(a?.assessmentSummary?.averageOverallScore);
      if (!Number.isNaN(s4)) return s4;
      return 0;
    };
    const getDate = (a: any) =>
      new Date(
        a?.timestamp || a?.assessmentSummary?.latestAssessment || 0
      ).getTime();
    const getStatus = (a: any) => {
      const explicit = (
        a?.jobMatchStatus ||
        a?.assessmentSummary?.jobMatch?.status ||
        ""
      )
        .toString()
        .toLowerCase();
      if (explicit.includes("good")) return "good";
      if (explicit.includes("poor")) return "poor";
      return getScore(a) >= 70 ? "good" : "poor";
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
    const hasMore = companyProfiles.length > displayedAssessments;

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
                  Assessment Date
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Overall Score
                </TableCell>
                <TableCell
                  sx={{
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  Job Match
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
              {visibleAssessments.map((assessment, index) => {
                const score = getScore(assessment);
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
                          {
                            (assessment?.condidateId?.userId?.username ||
                              "U")?.[0]
                          }
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: "#111827",
                            }}
                          >
                            {assessment?.condidateId?.userId?.username ||
                              assessment?.candidateName ||
                              assessment?.candidateInfo?.name ||
                              "Unknown User"}
                          </Typography>
                          {(assessment?.condidateId?.userId?.email ||
                            getCandidateEmail(assessment)) && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#6b7280",
                                fontSize: "0.75rem",
                                filter: "blur(4px)",
                                userSelect: "none",
                              }}
                            >
                              {assessment?.condidateId?.userId?.email ||
                                getCandidateEmail(assessment)}
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
                      {assessment?.jobId?.jobDetails?.title ||
                        assessment?.jobTitle ||
                        assessment?.jobInfo?.title ||
                        "Unknown Job"}
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
                        label={isGoodMatch ? "Good Match" : "Poor Match"}
                        size="small"
                        sx={{
                          backgroundColor: isGoodMatch ? "#d1fae5" : "#fee2e2",
                          color: isGoodMatch ? "#065f46" : "#991b1b",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          border: "none",
                          borderRadius: "6px",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e5e7eb" }}>
                      <IconButton
                        onClick={() => handleViewAssessmentDetails(assessment)}
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
            fontStyle: "normal",
            fontSize: "20px",
            lineHeight: "100%",
            letterSpacing: "0",
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
          {/* <Select
            size="small"
            value={assessmentStatusFilter}
            onChange={(e) =>
              setAssessmentStatusFilter(e.target.value as string)
            }
            displayEmpty
            sx={{
              minWidth: 160,
              backgroundColor: "white",
              borderRadius: "12px",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #e5e7eb",
              },
            }}
          >
            <MenuItem value="all">All matches</MenuItem>
            <MenuItem value="good">Good match (&gt;= 70)</MenuItem>
            <MenuItem value="poor">Poor match (&lt; 70)</MenuItem>
          </Select> */}
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

      {/* Assessment Details Modal */}
      <AssessmentDetailsModal
        open={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        assessment={selectedAssessment}
      />
    </StyledCard>
  );
};

export default CompanyProfilesAssessments;
