import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  Pagination,
  Card,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import { GradientCircle } from "../ui/GradientCircle";

const noCopyStyle = {
  userSelect: "none" as const,
  WebkitUserSelect: "none" as const,
  MozUserSelect: "none" as const,
  msUserSelect: "none" as const,
};
// Styled Components
const StyledCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: "white",
  borderRadius: "12px",
  border: "1px solid rgba(84,98,116,0.1)",
}));
// Update the MatchingCandidate interface
interface MatchingCandidate {
  candidateId: string;
  lastName: string;
  firstName: string;
  name: string;
  email: string;
  score: number;
  targetRole: string;
  finalBid: number;
  unlockPrice: number;
  unlocked: boolean;
  matchedSkills: Array<{
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
    _id: string;
    ScoreTest?: number;
  }>;
  requiredSkills: Array<{
    name: string;
    level: string;
    importance: string;
    category: string;
    _id: string;
  }>;
}

interface MatchingProfilesProps {
  matchingProfiles: MatchingCandidate[];
  isLoadingMatches: boolean;
  matchError: string | null;
  displayCount: number;
  selectedJob: string;
  onBackToJobs: () => void;
  onLoadMore: () => void;
  onBidDialogOpen: (candidate: MatchingCandidate) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const MatchingProfiles: React.FC<MatchingProfilesProps> = ({
  matchingProfiles,
  isLoadingMatches,
  matchError,
  displayCount,
  selectedJob,
  onBackToJobs,
  onLoadMore,
  onBidDialogOpen,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const router = useRouter();

  // Items per page selector - user can choose 5, 10, or 20
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);
  const calculatedTotalPages = Math.ceil(
    matchingProfiles.length / itemsPerPage
  );
  const [localPage, setLocalPage] = React.useState(1);

  // Reset to page 1 when items per page changes
  React.useEffect(() => {
    setLocalPage(1);
    if (onPageChange) {
      onPageChange(1);
    }
  }, [itemsPerPage, onPageChange]);

  // Use provided pagination or fallback to local
  const page = onPageChange ? currentPage : localPage;
  const handlePageChange =
    onPageChange || ((newPage: number) => setLocalPage(newPage));

  // Get items for current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = matchingProfiles.slice(startIndex, endIndex);
  const effectiveTotalPages =
    totalPages > 1 ? totalPages : calculatedTotalPages;

  return (
    <StyledCard>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
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
            Matching Candidates
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={onBackToJobs}
            sx={{
              border: "1px solid rgba(77, 217, 163, 1)",
              backgroundColor: "rgba(77, 217, 163, 0.08)",
              color: "rgba(41, 210, 145, 0.83)",
              fontWeight: 500,
              borderRadius: "38px",
              px: 3,
              py: 1,
              fontSize: "0.875rem",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                color: "rgba(41, 210, 145, 0.83)",
                boxShadow: "none",
                backgroundColor: "rgba(77, 217, 163, 0.04)",
              },
            }}
          >
            Return to Jobs
          </Button>
        </Box>
      </Box>

      {/* Content Section */}
      {isLoadingMatches ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            backgroundColor: "rgba(62, 233, 167, 0.03)",
            borderRadius: "8px",
            border: '1px solid rgba(98, 111, 134, 0.18)',
          }}
        >
          <CircularProgress sx={{ color: "rgba(41, 210, 145, 1)", mb: 3 }} />
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
            Finding Perfect Matches
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
            Analyzing candidate profiles and skills...
          </Typography>
        </Box>
      ) : matchError ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 4,
            backgroundColor: "#fef2f2",
            borderRadius: "12px",
            border: "1px solid #fecaca",
            textAlign: "center",
          }}
        >
          <ErrorIcon sx={{ fontSize: 48, color: "#dc2626", mb: 3 }} />
          <Typography
            variant="h6"
            sx={{ color: "#111827", fontWeight: 600, mb: 2 }}
          >
            Error Loading Matches
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", maxWidth: "400px", mb: 3 }}
          >
            {matchError}
          </Typography>
        </Box>
      ) : !matchingProfiles || matchingProfiles.length === 0 ? (
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
            <Image
              src="/icons/user-search.svg"
              alt="user-search"
              width={43}
              height={43}
            />{" "}
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
            No Matching Candidates Found
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
            We couldn't find any candidates that match your job requirements.
            Try adjusting your filters or requirements to find more matches.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Stats Summary */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1,
              px: 1.5,
              backgroundColor: "rgba(62, 233, 167, 0.13)",
              borderRadius: "8px",
              border: "1px solid rgba(41, 210, 145, 0.83)",
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "rgba(19, 163, 108, 0.83)",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Found {matchingProfiles.length} matching candidates
            </Typography>
          </Box>

          {/* Candidate Cards */}
          {paginatedCandidates.map((candidate, index) => (
            <Box
              key={candidate.candidateId}
              sx={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                p: 3,
                transition: "border-color 0.2s",
                "&:hover": {
                  borderColor: "#d1d5db",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: "#f3f4f6",
                        border: "2px solid #e5e7eb",
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        color: "#6b7280",
                      }}
                    >
                      {candidate.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            color: "rgba(24, 25, 28, 1)",
                            fontWeight: 500,
                            fontSize: "18px",
                            lineHeight: "28px",
                            filter: candidate?.unlocked ? "none" :"blur(6px)" ,
                            ...noCopyStyle
                          }}
                        >
                          {candidate?.firstName + " " + candidate?.lastName ||
                            candidate?.name}
                        </Typography>
                        {candidate?.targetRole && (
                          <Typography
                            variant="h6"
                            sx={{
                              color: "rgba(24, 25, 28, 1)",
                              fontWeight: 500,
                              fontSize: "18px",
                              lineHeight: "28px",
                            }}
                          >
                            |
                          </Typography>
                        )}
                        {candidate?.targetRole && (
                          <Typography
                            variant="h6"
                            sx={{
                              color: "rgba(84, 98, 116, 0.53)",
                              fontWeight: 400,
                              fontSize: "18px",
                              lineHeight: "28px",
                            }}
                          >
                            {candidate?.targetRole}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(84, 98, 116, 0.53)",
                          filter: candidate?.unlocked ? 'none': "blur(4px)",
                          userSelect: "none",
                          fontFamily: "Poppins",
                          fontWeight: 400,
                          fontStyle: "normal",
                          fontSize: "12px",
                          lineHeight: "23px",
                          letterSpacing: "0px",
                          ...noCopyStyle
                        }}
                      >
                        {candidate?.email}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Skills Section */}
                  <Box sx={{ my: 0.5 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "rgba(98, 111, 134, 1)",
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontStyle: "normal",
                        fontSize: "15px",
                        lineHeight: "40px",
                        letterSpacing: "0px",
                        verticalAlign: "middle",
                      }}
                    >
                      Matched Skills
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {candidate.matchedSkills.slice(0, 6).map((skill, idx) => (
                        <Chip
                          key={skill._id || idx}
                          label={`${skill.name} (${
                            skill.experienceLevel ||
                            skill.proficiencyLevel ||
                            "N/A"
                          })`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(84, 98, 116, 0.05)",
                            color: "rgba(84, 98, 116, 1)",
                            height: 28,
                            border: "0.25px solid rgba(84, 98, 116, 1)",
                            borderRadius: "38px",
                            fontFamily: "Poppins",
                            fontWeight: 400,
                            fontStyle: "normal",
                            fontSize: "12px",
                            lineHeight: "42.99px",
                            letterSpacing: "0px",
                            verticalAlign: "middle",
                            "&:hover": {
                              backgroundColor: "#e5e7eb",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={
                        <Image
                          src="/icons/message.svg"
                          alt="message"
                          width={19.25}
                          height={13.75}
                        />
                      }
                      sx={{
                        height: "42px",
                        maxWidth: "300px",
                        backgroundColor: "rgba(41, 210, 145, 0.83)",
                        borderColor: "rgba(0, 135, 83, 1)",
                        color: "white",
                        fontWeight: 500,
                        borderRadius: "38px",
                        py: 1.5,
                        textTransform: "none",
                        fontSize: "0.875rem",
                        borderWidth: "1px",
                        "&:hover": {
                          backgroundColor: "rgba(41, 210, 145, 0.6)",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: "rgba(41, 210, 145, 0.6)",
                          color: "white",
                        },
                      }}
                      disabled={!candidate?.unlocked}
                    >
                      Contact Candidate
                    </Button>
                    {!candidate?.unlocked && <Button
                      variant="outlined"
                      fullWidth
                      startIcon={
                        <Image
                          src="/icons/solardollar.svg"
                          alt="message"
                          width={22}
                          height={22}
                        />
                      }
                      onClick={() => onBidDialogOpen(candidate)}
                      sx={{
                        borderColor: "rgba(222, 147, 0, 1)",
                        color: "rgba(222, 147, 0, 1)",
                        fontWeight: 600,
                        borderRadius: "38px",
                        py: 1.5,
                        maxWidth: "300px",
                        height: "42px",
                        textTransform: "none",
                        fontSize: "0.875rem",
                        borderWidth: "1px",
                        "&:hover": {
                          backgroundColor: "rgba(222, 147, 0, 0.08)",
                        },
                        "&.Mui-disabled": {
                          borderColor: "#e5e7eb",
                          color: "#9ca3af",
                        },
                      }}
                      disabled={!candidate?.candidateId || !selectedJob}
                    >
                      Unlock Full Profile ({candidate?.unlockPrice} Tokens)
                    </Button>}
                    {candidate?.unlocked && <Button
            variant="outlined"
            onClick={() => router.push(`/profile/${candidate.candidateId}`)}
            sx={{
              borderColor: "rgba(11, 82, 198, 1)",
              color: "rgba(11, 82, 198, 1)",
              fontWeight: 600,
              borderRadius: "38px",
              py: 1.5,
              maxWidth: "300px",
              height: "42px",
              textTransform: "none",
              fontSize: "0.875rem",
              borderWidth: "1px",
              "&:hover": {
                backgroundColor: "rgba(11, 82, 198, 0.08)",
              },
              "&.Mui-disabled": {
                borderColor: "#e5e7eb",
                color: "#9ca3af",
              },
            }}
          >
            View Full Profile
          </Button>}
                  </Box>
                </Box>
                <GradientCircle
                  variant={
                    candidate.score >= 70
                      ? "success"
                      : candidate.score >= 50
                      ? "warning"
                      : "danger"
                  }
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "rgba(32, 32, 32, 1)",
                        fontWeight: 600,
                        fontSize: "1.5rem",
                        lineHeight: 1,
                      }}
                    >
                      {candidate.score.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          candidate.score >= 70
                            ? "rgba(62, 180, 137, 0.42)"
                            : candidate.score >= 50
                            ? "rgba(255, 193, 7, 0.42)"
                            : "rgba(246, 128, 128, 0.42)",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        mt: 0.5,
                      }}
                    >
                      Matching Score
                    </Typography>
                  </Box>
                </GradientCircle>
              </Box>
            </Box>
          ))}

          {/* Pagination */}
          {effectiveTotalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={effectiveTotalPages}
                page={page}
                onChange={(event, newPage) => handlePageChange(newPage)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#6b7280",
                    "&.Mui-selected": {
                      backgroundColor: "#10b981",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#059669",
                      },
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
      )}
    </StyledCard>
  );
};

export default MatchingProfiles;
