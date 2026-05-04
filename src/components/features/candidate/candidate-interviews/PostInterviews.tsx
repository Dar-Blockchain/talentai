import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress, LinearProgress, Avatar, Button, Tooltip } from "@mui/material";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { formatDistanceToNowStrict } from "date-fns";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNew";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { useRouter } from "next/router";
import StepInfoModal from "./StepInfoModal";
import AssessmentCard, { PostAssessment, getScore, isCompleted, hasPendingSteps } from "./AssessmentCard";
import {
  fetchCandidateAssessments,
  selectCandidateAssessments,
  selectCandidateAssessmentsLoading,
  selectCandidateAssessmentsPagination,
} from "@/store/slices/postSlice";

const T   = "#0D9488";
const TBG = "#F0FDFA";
const TBD = "#99F6E4";

interface GroupedAssessment { post: any; assessments: any[]; candidatePostStepProgress: any }

interface PostInterviewsProps {
  onViewAll?: () => void;
  showViewAll?: boolean;
  initialDisplayCount?: number;
  previewCount?: number;
}

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const InterviewRow: React.FC<{
  assessment: PostAssessment;
  last: boolean;
  quota: number;
  onViewDetails: (id: string) => void;
  onContinueTest: (a: PostAssessment) => void;
}> = ({ assessment, last, quota, onViewDetails, onContinueTest }) => {
  const score      = getScore(assessment);
  const completed  = isCompleted(assessment);
  const pending    = hasPendingSteps(assessment);
  const quotaFull  = quota >= 5;

  const jobTitle    = assessment.post?.jobDetails?.title || "Job Application";
  const company     = assessment.company as any;
  const companyName = company?.companyName || company?.username || assessment.post?.user?.companyName || "";
  const logoUrl     = company?.logo ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Companies/${company.logo}` : undefined;
  const timeAgo     = (assessment.updatedAt || assessment.createdAt)
    ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true })
    : "";
  const statusColor = completed ? "#059669" : "#D97706";

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      px: 2.5, py: 1.75,
      borderBottom: last ? "none" : "1px solid #F1F5F9",
      transition: "background 0.12s",
      "&:hover": { bgcolor: "#F8FAFC" },
    }}>
      {/* Avatar */}
      <Avatar
        src={logoUrl}
        variant="rounded"
        sx={{ width: 38, height: 38, borderRadius: "10px", flexShrink: 0, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", "& img": { objectFit: "contain", p: "3px" } }}
      >
        <BusinessOutlined sx={{ fontSize: 18, color: "#94A3B8" }} />
      </Avatar>

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {jobTitle}
          </Typography>
          {companyName && (
            <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", flexShrink: 0 }}>· {companyName}</Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {score > 0 ? (
            <>
              <LinearProgress variant="determinate" value={Math.min(score, 100)}
                sx={{ flex: 1, height: 3, borderRadius: "99px", bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: getScoreColor(score) } }} />
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: getScoreColor(score), flexShrink: 0 }}>{score}%</Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>Not started yet</Typography>
          )}
        </Box>
      </Box>

      {/* Right: status badge + time + action */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.3, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, px: 0.9, py: 0.2, borderRadius: "20px", bgcolor: completed ? "#ECFDF5" : "#FFFBEB", border: `1px solid ${completed ? "#A7F3D0" : "#FDE68A"}` }}>
          {completed
            ? <CheckCircleOutlined sx={{ fontSize: 9, color: "#059669" }} />
            : <HourglassEmptyOutlined sx={{ fontSize: 9, color: "#D97706" }} />}
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: statusColor }}>{completed ? "Done" : "Ongoing"}</Typography>
        </Box>
        {timeAgo && <Typography sx={{ fontSize: "0.6rem", color: "#CBD5E1" }}>{timeAgo}</Typography>}
      </Box>

      {/* Action button */}
      <Box sx={{ flexShrink: 0, ml: 0.5 }}>
        {pending ? (
          <Tooltip title={quotaFull ? "Monthly limit reached (5/5)" : ""} arrow>
            <span>
              <Button
                onClick={() => onContinueTest(assessment)}
                disabled={quotaFull}
                startIcon={<PlayArrowOutlined sx={{ fontSize: "13px !important" }} />}
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: "0.7rem",
                  color: "#fff", bgcolor: "#7C3AED", borderRadius: "8px", px: 1.25, py: 0.4,
                  minWidth: 0, boxShadow: "none",
                  "&:hover": { bgcolor: "#6D28D9" },
                  "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                }}
              >
                Continue
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Button
            onClick={() => onViewDetails(assessment._id)}
            endIcon={<OpenInNewOutlined sx={{ fontSize: "11px !important" }} />}
            sx={{
              textTransform: "none", fontWeight: 700, fontSize: "0.7rem",
              color: completed ? "#059669" : "#64748B",
              bgcolor: completed ? "#F0FDF4" : "#F8FAFC",
              border: `1px solid ${completed ? "#BBF7D0" : "#E2E8F0"}`,
              borderRadius: "8px", px: 1.25, py: 0.4, minWidth: 0, boxShadow: "none",
              "&:hover": { bgcolor: completed ? "#DCFCE7" : "#F1F5F9" },
            }}
          >
            Report
          </Button>
        )}
      </Box>
    </Box>
  );
};

const PostInterviews: React.FC<PostInterviewsProps> = ({
  onViewAll, showViewAll = false, initialDisplayCount = 5, previewCount,
}) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const groupedData = useSelector(selectCandidateAssessments) as GroupedAssessment[];
  const loading     = useSelector(selectCandidateAssessmentsLoading);
  const pagination  = useSelector(selectCandidateAssessmentsPagination);
  const quota       = useSelector((s: RootState) => s.user.connectedUser.profile?.quota || 0);

  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [selectedAssmt, setSelectedAssmt] = useState<PostAssessment | null>(null);

  useEffect(() => { dispatch(fetchCandidateAssessments({ page: 1, limit: previewCount ?? 10 })); }, [dispatch, previewCount]);

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

  const displayLimit = previewCount ?? (showViewAll ? initialDisplayCount : undefined);
  const displayed    = displayLimit != null ? assessments.slice(0, displayLimit) : assessments;

  const handleViewDetails  = (id: string) => router.push(`/assessment/${id}`);
  const handleContinueTest = (a: PostAssessment) => { setSelectedAssmt(a); setStepModalOpen(true); };
  const handleStartStep    = () => {
    if (!selectedAssmt) return;
    const postId = selectedAssmt.post?._id;
    const step   = selectedAssmt.candidatePostStepProgress?.currentStep;
    if (postId && step) { setStepModalOpen(false); router.push(`/interview/hr?jobId=${postId}&stepId=${step._id}&pipeline=true`); }
  };

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.75, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentOutlined sx={{ fontSize: 18, color: T }} />
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>Job Interviews</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ px: 1, py: 0.25, borderRadius: "20px", bgcolor: "#ECFDF5", border: "1px solid #A7F3D0" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#059669" }}>{stats.completed} done</Typography>
            </Box>
            <Box sx={{ px: 1, py: 0.25, borderRadius: "20px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#D97706" }}>{stats.ongoing} ongoing</Typography>
            </Box>
            {onViewAll && (
              <Typography
                onClick={onViewAll}
                sx={{ fontSize: "0.72rem", fontWeight: 700, color: T, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                View all →
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Body */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={24} sx={{ color: T }} />
        </Box>
      ) : displayed.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <WorkOutlineOutlined sx={{ fontSize: 32, color: "#CBD5E1", mb: 1 }} />
          <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8" }}>No interviews yet</Typography>
        </Box>
      ) : (
        <Box>
          {displayed.map((a, i) => (
            <InterviewRow
              key={a._id}
              assessment={a}
              last={i === displayed.length - 1}
              quota={quota}
              onViewDetails={handleViewDetails}
              onContinueTest={handleContinueTest}
            />
          ))}
        </Box>
      )}

      <StepInfoModal open={stepModalOpen} onClose={() => setStepModalOpen(false)} onStart={handleStartStep} assessment={selectedAssmt} quota={quota} />
    </Box>
  );
};

export default dynamic(() => Promise.resolve(PostInterviews), { ssr: false });
