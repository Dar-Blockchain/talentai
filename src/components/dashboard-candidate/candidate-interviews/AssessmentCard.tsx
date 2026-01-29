import React from "react";
import { Box, Button, Typography, Chip, LinearProgress } from "@mui/material";
import HourglassIcon from "@/components/icons/HourglassIcon";
import TimeOutlineIcon from "@/components/icons/TimeOutlineIcon";
import CaseOutlineIcon from "@/components/icons/CaseOutlineIcon";
import CheckTestIcon from "@/components/icons/checkTestIcon";
import { formatDistanceToNowStrict } from "date-fns";

export interface PostAssessment {
  _id: string;
  candidate?: string | {
    _id: string;
    username?: string;
    email?: string;
  };
  company?: {
    _id: string;
    username?: string;
    email?: string;
    role?: string;
  };
  post?: {
    _id: string;
    jobDetails?: {
      title?: string;
      description?: string;
    };
    user?: {
      companyName?: string;
    };
    status?: string;
  };
  skillType?: string;
  interviewData?: {
    interviewType?: string;
    finalReport?: {
      coverage?: {
        overall?: number;
        areas?: Record<string, any>;
      };
      summary?: string;
      recommendations?: string[];
      aiAnalysis?: {
        strongestAreas?: string[];
        weakestAreas?: string[];
        recommendedFocus?: string[];
      };
    };
    analytics?: {
      duration?: number;
      messageCount?: number;
      completedAreas?: number;
      totalAreas?: number;
      coveragePercentage?: number;
    };
  };
  candidatePostStepProgress?: any;
  createdAt: string;
  updatedAt?: string;
}

interface AssessmentCardProps {
  assessment: PostAssessment;
  onViewDetails: (assessmentId: string) => void;
  onContinueTest: (assessment: PostAssessment) => void;
}

export const getScore = (assessment: PostAssessment): number => {
  return assessment.interviewData?.finalReport?.coverage?.overall ||
    assessment.interviewData?.analytics?.coveragePercentage ||
    0;
};

export const hasPendingSteps = (assessment: PostAssessment): boolean => {
  const stepProgress = assessment.candidatePostStepProgress;
  if (!stepProgress?.steps) return false;

  return stepProgress.steps.some(
    (step: any) => step.status === 'pending' || step.status === 'inProgress'
  );
};

export const allStepsCompleted = (assessment: PostAssessment): boolean => {
  const stepProgress = assessment.candidatePostStepProgress;
  if (!stepProgress?.steps || stepProgress.steps.length === 0) {
    const score = getScore(assessment);
    return score >= 50;
  }

  return stepProgress.steps.every(
    (step: any) => step.status === 'done' || step.status === 'passed'
  );
};

export const isCompleted = (assessment: PostAssessment): boolean => {
  if (assessment.candidatePostStepProgress?.steps?.length > 0) {
    return allStepsCompleted(assessment);
  }
  const score = getScore(assessment);
  return score >= 50;
};

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  onViewDetails,
  onContinueTest,
}) => {
  const score = getScore(assessment);
  const completed = isCompleted(assessment);
  const timeAgo = assessment.updatedAt || assessment.createdAt
    ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true })
    : "";
  const jobTitle = assessment.post?.jobDetails?.title || "Job Application";
  const companyName = assessment.company?.username || assessment.post?.user?.companyName || "Company";
  const interviewType = assessment.interviewData?.interviewType?.replace(/_/g, " ") || "HR Interview";
  console.log("assessment.skillType", assessment);
  const skillType = assessment.skillType || "general";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        border: "1px solid rgba(211, 224, 245, 1)",
        boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
        borderRadius: "8px",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "17px",
              lineHeight: "28px",
              color: "rgba(62, 70, 82, 1)",
            }}
          >
            {jobTitle}
          </Typography>
          {completed ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckTestIcon sx={{ color: "#3EB489", fontSize: "13.5px" }} />
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "18px",
                  color: "rgba(62, 180, 137, 1)",
                }}
              >
                Completed
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <HourglassIcon
                sx={{ color: "rgba(250, 180, 70, 1)", fontSize: "12px" }}
              />
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "18px",
                  color: "rgba(250, 180, 70, 1)",
                }}
              >
                Ongoing
              </Typography>
            </Box>
          )}
          <Chip
            label={skillType.charAt(0).toUpperCase() + skillType.slice(1) + " Test"}
            size="small"
            sx={{
              backgroundColor: "rgba(131, 16, 255, 0.1)",
              color: "#8310FF",
              fontWeight: 500,
              fontSize: "0.65rem",
              height: 20,
              textTransform: "capitalize",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CaseOutlineIcon
              sx={{ fontSize: "12px", color: "rgba(84, 98, 116, 1)" }}
            />
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: "11px",
                lineHeight: "28px",
                color: "rgba(84, 98, 116, 1)",
              }}
            >
              {companyName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <TimeOutlineIcon />
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: "11px",
                lineHeight: "28px",
                color: "rgba(84, 98, 116, 1)",
              }}
            >
              {timeAgo}
            </Typography>
          </Box>
        </Box>
        {/* Progress Bar */}
        <Box sx={{ mt: 1, maxWidth: "300px" }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(Math.max(score, 0), 100)}
            sx={{
              height: 5,
              borderRadius: 3,
              backgroundColor: "rgba(243, 245, 247, 1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                backgroundColor: completed ? "rgba(62, 180, 137, 1)" : "rgba(250, 180, 70, 1)",
              },
            }}
          />
        </Box>
      </Box>
      {hasPendingSteps(assessment) ? (
        <Button
          onClick={() => onContinueTest(assessment)}
          variant="outlined"
          sx={{
            width: "170px",
            borderColor: "rgba(189, 133, 255, 1)",
            color: "white",
            background: "rgba(189, 133, 255, 1)",
            fontWeight: 600,
            borderRadius: "38px",
            px: 3,
            height: "42px",
            textTransform: "none",
            fontSize: "0.875rem",
            "&:hover": {
              backgroundColor: "rgba(160, 100, 230, 1)",
              borderColor: "rgba(160, 100, 230, 1)",
            },
          }}
        >
          Complete Test
        </Button>
      ) : (
        <Button
          onClick={() => onViewDetails(assessment._id)}
          variant="outlined"
          sx={{
            width: "170px",
            borderColor: completed ? "rgba(211, 224, 245, 1)" : "rgba(189, 133, 255, 1)",
            color: completed ? "rgba(62, 70, 82, 1)" : "rgba(189, 133, 255, 1)",
            background: completed ? "#54627414" : "rgba(189, 133, 255, 0.08)",
            fontWeight: completed ? 500 : 600,
            borderRadius: "38px",
            px: 3,
            height: "42px",
            textTransform: "none",
            fontSize: "0.875rem",
            "&:hover": {
              backgroundColor: completed ? "rgba(211, 224, 245, 0.3)" : "rgba(189, 133, 255, 0.04)",
              borderColor: completed ? "rgba(211, 224, 245, 1)" : "rgba(189, 133, 255, 1)",
            },
          }}
        >
          View Details
        </Button>
      )}
    </Box>
  );
};

export default AssessmentCard;
