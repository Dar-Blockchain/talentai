import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography, CircularProgress, InputBase, MenuItem, Menu } from "@mui/material";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import StatsSummaryCard from "./StatsSummaryCard";
import AssessmentCard, { PostAssessment } from "./AssessmentCard";
import StepInfoModal from "./StepInfoModal";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { useRouter } from "next/router";
import {
  fetchCandidateAssessments,
  selectCandidateAssessments,
  selectCandidateAssessmentsLoading,
  selectCandidateAssessmentsPagination,
} from "@/store/slices/postSlice";

const T = "#0D9488";

interface GroupedAssessment { post: any; assessments: any[]; candidatePostStepProgress: any }

interface PostInterviewsProps {
  onViewAll?: () => void;
  onBackToAll?: () => void;
  hidden?: boolean;
  showViewAll?: boolean;
  initialDisplayCount?: number;
}

const PostInterviews: React.FC<PostInterviewsProps> = ({
  onViewAll, onBackToAll, hidden = false, showViewAll = false, initialDisplayCount = 5,
}) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const groupedData  = useSelector(selectCandidateAssessments) as GroupedAssessment[];
  const loading      = useSelector(selectCandidateAssessmentsLoading);
  const pagination   = useSelector(selectCandidateAssessmentsPagination);
  const quota        = useSelector((s: RootState) => s.user.connectedUser.profile?.quota || 0);

  const [search,          setSearch]          = useState("");
  const [sortBy,          setSortBy]          = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");
  const [sortAnchor,      setSortAnchor]      = useState<null | HTMLElement>(null);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [stepModalOpen,   setStepModalOpen]   = useState(false);
  const [selectedAssmt,   setSelectedAssmt]   = useState<PostAssessment | null>(null);

  if (hidden) return null;

  useEffect(() => { dispatch(fetchCandidateAssessments({ page: 1, limit: 10 })); }, [dispatch]);

  const assessments = useMemo(() =>
    groupedData.map(group => {
      const latest = [...(group.assessments || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || {};
      return { ...latest, _id: latest._id || group.post?._id, post: latest.post || group.post, company: latest.company, candidatePostStepProgress: group.candidatePostStepProgress, assessmentsCount: group.assessments?.length || 0 } as PostAssessment;
    }), [groupedData]);

  const stats = useMemo(() => {
    let completed = 0, ongoing = 0;
    groupedData.forEach(g => {
      const steps = g.candidatePostStepProgress?.steps;
      if (steps?.length) {
        steps.every((s: any) => s.status === "done" || s.status === "passed") ? completed++ : ongoing++;
      } else {
        (g.assessments || []).some((a: any) => (a.interviewData?.finalReport?.coverage?.overall || 0) >= 50) ? completed++ : ongoing++;
      }
    });
    return { total: pagination.total || groupedData.length, completed, ongoing };
  }, [groupedData, pagination.total]);

  const sorted = useMemo(() => {
    let list = [...assessments];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        (a.post?.jobDetails?.title || "").toLowerCase().includes(q) ||
        ((a.company as any)?.username || (a.post as any)?.user?.companyName || "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "title-asc") return (a.post?.jobDetails?.title || "").localeCompare(b.post?.jobDetails?.title || "");
      return (b.post?.jobDetails?.title || "").localeCompare(a.post?.jobDetails?.title || "");
    });
    return list;
  }, [assessments, search, sortBy]);

  const PER_PAGE = 10;
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const displayed  = showViewAll ? sorted.slice(0, initialDisplayCount) : sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleViewDetails  = (id: string) => router.push(`/assessment/${id}`);
  const handleContinueTest = (a: PostAssessment) => { setSelectedAssmt(a); setStepModalOpen(true); };
  const handleStartStep    = () => {
    if (!selectedAssmt) return;
    const postId = selectedAssmt.post?._id;
    const step   = selectedAssmt.candidatePostStepProgress?.currentStep;
    if (postId && step) { setStepModalOpen(false); router.push(`/interview/hr?jobId=${postId}&stepId=${step._id}&pipeline=true`); }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress sx={{ color: T }} />
    </Box>
  );

  return (
    <Box>
      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <StatsSummaryCard label="Total" value={stats.total} subtitle="Applications"
          icon={<AssignmentOutlined sx={{ fontSize: 22, color: T }} />}
          valueColor={T} borderColor={`${T}30`} iconBgColor={`${T}10`} />
        <StatsSummaryCard label="Completed" value={stats.completed} subtitle="Interviews"
          icon={<CheckCircleOutlined sx={{ fontSize: 22, color: "#059669" }} />}
          valueColor="#059669" borderColor="#A7F3D0" iconBgColor="#ECFDF5" />
        <StatsSummaryCard label="In Progress" value={stats.ongoing} subtitle="Interviews"
          icon={<HourglassEmptyOutlined sx={{ fontSize: 22, color: "#D97706" }} />}
          valueColor="#D97706" borderColor="#FDE68A" iconBgColor="#FFFBEB" />
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1,
          px: 1.5, py: 0.85, borderRadius: "10px",
          border: "1px solid #E5E7EB", bgcolor: "#FAFAFA", flex: "1 1 200px", maxWidth: 280,
          "&:focus-within": { borderColor: T, bgcolor: "#fff", boxShadow: `0 0 0 3px ${T}15` },
          transition: "all 0.2s",
        }}>
          <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
          <InputBase
            placeholder="Search by job or company…"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            sx={{ fontSize: "0.78rem", flex: 1, "& input::placeholder": { color: "#9CA3AF" } }}
          />
        </Box>

        <Button
          size="small"
          startIcon={<SortOutlined sx={{ fontSize: "15px !important" }} />}
          onClick={e => setSortAnchor(e.currentTarget)}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: "#374151", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 0.85, "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          Sort
        </Button>
        <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}
          PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", mt: 0.5 } }}>
          {(["newest", "oldest", "title-asc", "title-desc"] as const).map(opt => (
            <MenuItem key={opt} selected={sortBy === opt} onClick={() => { setSortBy(opt); setCurrentPage(1); setSortAnchor(null); }}
              sx={{ fontSize: "0.78rem", fontWeight: sortBy === opt ? 700 : 400, color: sortBy === opt ? T : "#374151", borderRadius: "8px", mx: 0.5 }}>
              {{ newest: "Newest first", oldest: "Oldest first", "title-asc": "Title A→Z", "title-desc": "Title Z→A" }[opt]}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* List */}
      {displayed.length === 0 ? (
        <Box sx={{ py: 10, textAlign: "center", borderRadius: "14px", border: "1.5px dashed #E5E7EB", bgcolor: "#FAFAFA" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: TBG, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}
            style={{ border: `1.5px solid ${TBD}` }}>
            <WorkOutlineOutlined sx={{ fontSize: 26, color: T }} />
          </Box>
          <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "0.9rem", mb: 0.5 }}>No interviews found</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem" }}>
            {search ? "Try a different search term" : "Apply for jobs to start your interview journey"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {displayed.map(a => (
            <AssessmentCard key={a._id} assessment={a} onViewDetails={handleViewDetails} onContinueTest={handleContinueTest} quota={quota} />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {!showViewAll && totalPages > 1 && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 3, flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
            Page <b>{currentPage}</b> of <b>{totalPages}</b>
          </Typography>
          <Box sx={{ display: "flex", gap: 0.75 }}>
            <Button size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              sx={{ minWidth: 34, height: 34, borderRadius: "8px", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 700, "&:disabled": { opacity: 0.3 } }}>‹</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} size="small" onClick={() => setCurrentPage(p)}
                sx={{ minWidth: 34, height: 34, borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", border: p === currentPage ? `1.5px solid ${T}` : "1px solid #E5E7EB", bgcolor: p === currentPage ? T : "transparent", color: p === currentPage ? "#fff" : "#374151" }}>
                {p}
              </Button>
            ))}
            <Button size="small" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
              sx={{ minWidth: 34, height: 34, borderRadius: "8px", border: "1px solid #E5E7EB", color: "#374151", fontWeight: 700, "&:disabled": { opacity: 0.3 } }}>›</Button>
          </Box>
        </Box>
      )}

      <StepInfoModal open={stepModalOpen} onClose={() => setStepModalOpen(false)} onStart={handleStartStep} assessment={selectedAssmt} quota={quota} />
    </Box>
  );
};

const TBG = "#F0FDFA";
const TBD = "#99F6E4";

export default dynamic(() => Promise.resolve(PostInterviews), { ssr: false });
