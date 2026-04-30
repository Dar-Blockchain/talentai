import React from "react";
import { Box, Button, Typography, LinearProgress, Tooltip, Avatar } from "@mui/material";
import { formatDistanceToNowStrict } from "date-fns";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNew";

export interface PostAssessment {
  _id: string;
  candidate?: string | { _id: string; username?: string; email?: string };
  company?: { _id: string; username?: string; email?: string; role?: string; companyName?: string; logo?: string };
  post?: {
    _id: string;
    jobDetails?: { title?: string; description?: string };
    skillAnalysis?: {
      requiredSkills?: { name: string; category?: string; level?: string; importance?: string }[];
      softSkills?: { name: string; level?: string }[];
      suggestedSkills?: { technical?: { name: string }[]; frameworks?: { name: string }[]; tools?: { name: string }[] };
    };
    user?: { companyName?: string };
    status?: string;
  };
  skillType?: string;
  interviewData?: {
    interviewType?: string;
    finalReport?: {
      coverage?: { overall?: number; areas?: Record<string, any> };
      summary?: string;
      recommendations?: string[];
      aiAnalysis?: { strongestAreas?: string[]; weakestAreas?: string[]; recommendedFocus?: string[] };
    };
    analytics?: { duration?: number; messageCount?: number; completedAreas?: number; totalAreas?: number; coveragePercentage?: number };
  };
  candidatePostStepProgress?: any;
  createdAt: string;
  updatedAt?: string;
  assessmentsCount?: number;
}

interface AssessmentCardProps {
  assessment: PostAssessment;
  onViewDetails: (assessmentId: string) => void;
  onContinueTest: (assessment: PostAssessment) => void;
  quota?: number;
}

export const getScore = (a: PostAssessment): number =>
  a.interviewData?.finalReport?.coverage?.overall ?? a.interviewData?.analytics?.coveragePercentage ?? 0;

export const hasPendingSteps = (a: PostAssessment): boolean =>
  a.candidatePostStepProgress?.steps?.some((s: any) => s.status === "pending" || s.status === "inProgress") ?? false;

export const allStepsCompleted = (a: PostAssessment): boolean => {
  const steps = a.candidatePostStepProgress?.steps;
  if (!steps?.length) return getScore(a) >= 50;
  return steps.every((s: any) => s.status === "done" || s.status === "passed");
};

export const isCompleted = (a: PostAssessment): boolean =>
  a.candidatePostStepProgress?.steps?.length > 0 ? allStepsCompleted(a) : getScore(a) >= 50;

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment, onViewDetails, onContinueTest, quota = 0 }) => {
  const score      = getScore(assessment);
  const completed  = isCompleted(assessment);
  const pending    = hasPendingSteps(assessment);
  const quotaFull  = quota >= 5;

  const jobTitle    = assessment.post?.jobDetails?.title || "Job Application";
  const company     = assessment.company as any;
  const companyName = company?.companyName || company?.username || assessment.post?.user?.companyName || "";
  const logoUrl     = company?.logo ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Companies/${company.logo}` : undefined;

  const timeAgo = (assessment.updatedAt || assessment.createdAt)
    ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true })
    : "";

  const scoreColor  = score > 0 ? getScoreColor(score) : "#E5E7EB";
  const statusColor = completed ? "#059669" : "#D97706";

  return (
    <Box sx={{
      borderRadius: "16px",
      border: `1px solid ${completed ? "#A7F3D0" : "#FDE68A"}`,
      bgcolor: "#fff",
      overflow: "hidden",
      transition: "all 0.2s ease",
      "&:hover": {
        boxShadow: `0 8px 24px ${completed ? "#05966918" : "#D9770618"}`,
        transform: "translateY(-1px)",
      },
    }}>
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${statusColor}, ${statusColor}70)` }} />

      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          src={logoUrl}
          variant="rounded"
          sx={{ width: 48, height: 48, borderRadius: "12px", flexShrink: 0, bgcolor: completed ? "#ECFDF5" : "#FFFBEB", border: `1px solid ${completed ? "#A7F3D0" : "#FDE68A"}`, "& img": { objectFit: "contain", p: "4px" } }}
        >
          <BusinessOutlined sx={{ fontSize: 22, color: statusColor }} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4, flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
              {jobTitle}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, px: 1, py: 0.25, borderRadius: "20px", bgcolor: completed ? "#ECFDF5" : "#FFFBEB", border: `1px solid ${completed ? "#A7F3D0" : "#FDE68A"}`, flexShrink: 0 }}>
              {completed
                ? <CheckCircleOutlined sx={{ fontSize: 11, color: "#059669" }} />
                : <HourglassEmptyOutlined sx={{ fontSize: 11, color: "#D97706" }} />}
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: statusColor }}>{completed ? "Completed" : "Ongoing"}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            {companyName && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <BusinessOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 500 }}>{companyName}</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
              <AccessTimeOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{timeAgo}</Typography>
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
              <Typography sx={{ fontSize: "0.62rem", color: "#9CA3AF" }}>Progress</Typography>
              {score > 0 && <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: scoreColor }}>{score}%</Typography>}
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(Math.max(score, 0), 100)}
              sx={{
                height: 5, borderRadius: "99px", bgcolor: "#F3F4F6",
                "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: score > 0 ? scoreColor : "#E5E7EB" },
              }}
            />
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          {pending ? (
            <Tooltip title={quotaFull ? "Monthly test limit reached (5/5)." : ""} arrow>
              <span>
                <Button
                  onClick={() => onContinueTest(assessment)}
                  disabled={quotaFull}
                  startIcon={<PlayArrowOutlined sx={{ fontSize: "15px !important" }} />}
                  sx={{
                    textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
                    color: "#fff", bgcolor: "#7C3AED",
                    borderRadius: "10px", px: 2, py: 0.8, boxShadow: "none", whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#6D28D9", boxShadow: "0 4px 12px #7C3AED30" },
                    "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                  }}
                >
                  Continue
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              onClick={() => onViewDetails(assessment._id)}
              endIcon={<OpenInNewOutlined sx={{ fontSize: "13px !important" }} />}
              sx={{
                textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
                color: completed ? "#059669" : "#6B7280",
                bgcolor: completed ? "#ECFDF5" : "#F9FAFB",
                border: `1px solid ${completed ? "#A7F3D0" : "#E5E7EB"}`,
                borderRadius: "10px", px: 2, py: 0.8, boxShadow: "none", whiteSpace: "nowrap",
                "&:hover": { bgcolor: completed ? "#D1FAE5" : "#F3F4F6" },
              }}
            >
              View Report
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AssessmentCard;
