import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Typography,
} from "@mui/material";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/store/store";
import { fetchJobMatches } from "@/store/slices/postSlice";
import { createOrFindConversation } from "@/store/slices/chatSlice";
import { broadcastSystemNotification } from "@/store/slices/notificationSlice";
import SectionCard from "@/components/ui/ui/SectionCard";
import EmptyState from "@/components/ui/ui/EmptyState";
import LoadingOverlay from "@/components/ui/ui/LoadingOverlay";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  jobId: string;
  jobTitle?: string;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 10;

const PassedInterviewView: React.FC<Props> = ({ jobId, jobTitle }) => {
  const dispatch    = useDispatch<AppDispatch>();
  const router      = useRouter();
  const { user }    = useSelector((state: RootState) => state.user.connectedUser);

  const matches        = useSelector((state: any) => state.post.jobMatches ?? []);
  const isLoadingMatches = useSelector((state: any) => state.post.jobMatchesLoading);
  const matchError     = useSelector((state: any) => state.post.jobMatchesError);
  const totalPages     = useSelector((state: any) => state.post.jobMatchesPagination?.totalPages ?? 1);

  const [page, setPage] = useState(1);
  const [contactingId, setContactingId] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobMatches({ selectedJobId: jobId, page, limit: ITEMS_PER_PAGE, passedInterview: true }));
    }
  }, [jobId, page]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleViewProfile = async (candidate: any) => {
    try {
      await dispatch(broadcastSystemNotification({
        content: "👀 A company has viewed your profile! They're interested in your qualifications.",
        recipientIds: [candidate.candidateId],
      })).unwrap();
    } catch { /* silent */ }
    router.push(`/profile/candidate/${candidate.candidateId}`);
  };

  const handleContact = async (candidateId: string) => {
    if (!user?._id) return;
    setContactingId(candidateId);
    try {
      const result = await dispatch(createOrFindConversation({ candidateId, companyId: user._id }));
      if (createOrFindConversation.fulfilled.match(result)) {
        const query: Record<string, string> = {};
        if (jobId)    query.postId    = jobId;
        if (jobTitle) query.jobTitle  = jobTitle;
        router.push({ pathname: `/company/messages/${result.payload._id}`, query });
      }
    } catch { /* silent */ }
    finally { setContactingId(null); }
  };

  const scoreColor = (score: number) =>
    score >= 70 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <Box>

      {/* ── Loading ── */}
      {isLoadingMatches && <LoadingOverlay height={300} message="Finding passed interview candidates…" color={TEAL} />}

      {/* ── Error ── */}
      {!isLoadingMatches && matchError && (
        <SectionCard>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 1 }}>
            <ErrorOutlineOutlined sx={{ fontSize: 40, color: "#EF4444" }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>Error loading candidates</Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>{matchError}</Typography>
          </Box>
        </SectionCard>
      )}

      {/* ── Empty ── */}
      {!isLoadingMatches && !matchError && (!matches || matches.length === 0) && (
        <EmptyState
          title="No candidates yet"
          description="No candidates have passed the interview for this job post yet."
          icon={<EmojiEventsOutlined sx={{ fontSize: 40 }} />}
        />
      )}

      {/* ── Candidates list ── */}
      {!isLoadingMatches && !matchError && matches && matches.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Stats bar */}
          <SectionCard sx={{ bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}` }}>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: TEAL }}>
              {matches.length} candidate{matches.length !== 1 ? "s" : ""} passed the interview
            </Typography>
          </SectionCard>

          {/* Cards */}
          {matches.map((candidate: any) => (
            <SectionCard key={candidate.candidateId}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", justifyContent: "space-between" }}>
                {/* Left: info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Candidate header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{ width: 44, height: 44, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, color: TEAL, fontWeight: 700, fontSize: "16px" }}
                    >
                      {(candidate.firstName || candidate.name || "?").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                          {candidate.firstName && candidate.lastName
                            ? `${candidate.firstName} ${candidate.lastName}`
                            : candidate.name}
                        </Typography>
                        {candidate.targetRole && (
                          <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>· {candidate.targetRole}</Typography>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{candidate.email}</Typography>
                    </Box>
                  </Box>

                  {/* Matched skills */}
                  {candidate.matchedSkills?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Matched Skills
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {candidate.matchedSkills.slice(0, 6).map((skill: any, idx: number) => (
                          <Chip
                            key={skill._id || idx}
                            label={`${skill.name} · ${skill.experienceLevel || skill.proficiencyLevel || "N/A"}`}
                            size="small"
                            sx={{
                              height: 24, fontSize: "11px", fontWeight: 500,
                              bgcolor: "#F3F4F6", color: "#374151",
                              border: "1px solid #E5E7EB", borderRadius: "12px",
                            }}
                          />
                        ))}
                        {candidate.matchedSkills.length > 6 && (
                          <Chip
                            label={`+${candidate.matchedSkills.length - 6} more`}
                            size="small"
                            sx={{ height: 24, fontSize: "11px", bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: "12px" }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      startIcon={
                        contactingId === candidate.candidateId
                          ? <CircularProgress size={12} sx={{ color: "#fff" }} />
                          : <ChatOutlined sx={{ fontSize: 15 }} />
                      }
                      onClick={() => handleContact(candidate.candidateId)}
                      disabled={contactingId === candidate.candidateId}
                      sx={{
                        textTransform: "none", fontWeight: 600, fontSize: "12px",
                        borderRadius: 2, height: 34, px: 2,
                        bgcolor: TEAL, color: "#fff", border: `1px solid ${TEAL}`,
                        "&:hover": { bgcolor: "#0F766E" },
                        "&:disabled": { bgcolor: "#99F6E4", color: "#fff" },
                      }}
                    >
                      Contact
                    </Button>

                    <Button
                      size="small"
                      startIcon={<PersonOutlined sx={{ fontSize: 15 }} />}
                      onClick={() => handleViewProfile(candidate)}
                      sx={{
                        textTransform: "none", fontWeight: 600, fontSize: "12px",
                        borderRadius: 2, height: 34, px: 2,
                        color: "#1D4ED8", border: "1px solid #BFDBFE", bgcolor: "#EFF6FF",
                        "&:hover": { bgcolor: "#DBEAFE" },
                      }}
                    >
                      View Profile
                    </Button>

                    {candidate.passedInterview && candidate.assessmentId && (
                      <Button
                        size="small"
                        startIcon={<AssessmentOutlined sx={{ fontSize: 15 }} />}
                        onClick={() => router.push(`/company/assessment/${candidate.assessmentId}`)}
                        sx={{
                          textTransform: "none", fontWeight: 600, fontSize: "12px",
                          borderRadius: 2, height: 34, px: 2,
                          color: "#7C3AED", border: "1px solid #DDD6FE", bgcolor: "#F5F3FF",
                          "&:hover": { bgcolor: "#EDE9FE" },
                        }}
                      >
                        Interview Details
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Right: score circle */}
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 76, height: 76, borderRadius: "50%",
                    border: `3px solid ${scoreColor(candidate.interviewScore ?? candidate.score ?? 0)}`,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    bgcolor: `${scoreColor(candidate.interviewScore ?? candidate.score ?? 0)}10`,
                  }}
                >
                  <Typography sx={{ fontSize: "18px", fontWeight: 800, color: scoreColor(candidate.interviewScore ?? candidate.score ?? 0), lineHeight: 1 }}>
                    {(candidate.interviewScore ?? candidate.score ?? 0).toFixed(0)}
                  </Typography>
                  <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", mt: 0.25 }}>
                    Score
                  </Typography>
                </Box>
              </Box>
            </SectionCard>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                sx={{
                  "& .MuiPaginationItem-root.Mui-selected": { bgcolor: TEAL, color: "#fff" },
                  "& .MuiPaginationItem-root:hover": { bgcolor: TEAL_BG },
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PassedInterviewView;
