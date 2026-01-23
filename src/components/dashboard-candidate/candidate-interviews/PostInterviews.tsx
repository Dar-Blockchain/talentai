import React, { useEffect, useMemo } from "react";
import { Box, Button, Typography, CircularProgress, Chip, LinearProgress } from "@mui/material";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import StatsSummaryCard from "./StatsSummaryCard";
import ChecklistIcon from "@/components/icons/CheckListIcon";
import HourglassIcon from "@/components/icons/HourglassIcon";
import { ArrowForward } from "@mui/icons-material";
import TimeOutlineIcon from "@/components/icons/TimeOutlineIcon";
import CaseOutlineIcon from "@/components/icons/CaseOutlineIcon";
import CheckTestIcon from "@/components/icons/checkTestIcon";
import { useRouter } from "next/router";
import { formatDistanceToNowStrict } from "date-fns";
import {
  fetchCandidateAssessments,
  selectCandidateAssessments,
  selectCandidateAssessmentsLoading,
  selectCandidateAssessmentsPagination,
} from "@/store/slices/postSlice";

interface PostAssessment {
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

const PostInterviews = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const assessments = useSelector(selectCandidateAssessments) as PostAssessment[];
  const loading = useSelector(selectCandidateAssessmentsLoading);
  const pagination = useSelector(selectCandidateAssessmentsPagination);

  // Fetch assessments on mount
  useEffect(() => {
    dispatch(fetchCandidateAssessments({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Calculate stats from assessments
  const stats = useMemo(() => {
    const completed = assessments.filter((a: PostAssessment) => {
      const score = a.interviewData?.finalReport?.coverage?.overall || 0;
      return score >= 50;
    }).length;

    return {
      total: pagination.total || assessments.length,
      completed,
      ongoing: assessments.length - completed,
    };
  }, [assessments, pagination.total]);

  const getScore = (assessment: PostAssessment): number => {
    return assessment.interviewData?.finalReport?.coverage?.overall ||
      assessment.interviewData?.analytics?.coveragePercentage ||
      0;
  };

  // Check if assessment has pending/inProgress steps in pipeline
  const hasPendingSteps = (assessment: PostAssessment): boolean => {
    const stepProgress = assessment.candidatePostStepProgress;
    if (!stepProgress?.steps) return false;

    // Check if any step is pending or inProgress
    return stepProgress.steps.some(
      (step: any) => step.status === 'pending' || step.status === 'inProgress'
    );
  };

  // Check if all steps are completed (done status)
  const allStepsCompleted = (assessment: PostAssessment): boolean => {
    const stepProgress = assessment.candidatePostStepProgress;
    if (!stepProgress?.steps || stepProgress.steps.length === 0) {
      // No pipeline steps - use score-based completion
      const score = getScore(assessment);
      return score >= 50;
    }

    // All steps must be 'done' or 'passed'
    return stepProgress.steps.every(
      (step: any) => step.status === 'done' || step.status === 'passed'
    );
  };

  const isCompleted = (assessment: PostAssessment): boolean => {
    // First check pipeline steps if available
    if (assessment.candidatePostStepProgress?.steps?.length > 0) {
      return allStepsCompleted(assessment);
    }
    // Fallback to score-based completion
    const score = getScore(assessment);
    return score >= 50;
  };

  const handleViewDetails = (assessmentId: string) => {
    router.push(`/assessment/${assessmentId}`);
  };

  const handleContinueTest = (assessment: PostAssessment) => {
    const postId = assessment.post?._id;
    const currentStep = assessment.candidatePostStepProgress?.currentStep;

    if (postId && currentStep) {
      // Navigate to the interview page with the current step
      router.push(`/interview/hr?jobId=${postId}&stepId=${currentStep._id}&pipeline=true`);
    }
  };

  // Theme color for applications
  const themeColor = "rgba(189, 133, 255, 1)";

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: themeColor }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <StatsSummaryCard
          label="Total"
          value={stats.total}
          subtitle="Applications"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(11, 82, 198, 1)" }}
            />
          }
          valueColor="rgba(11, 82, 198, 1)"
          borderColor="rgba(11, 82, 198, 0.18)"
          iconBgColor="rgba(11, 82, 198, 0.06)"
        />
        <StatsSummaryCard
          label="Completed"
          value={stats.completed}
          subtitle="Interviews"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(62, 180, 137, 1)" }}
            />
          }
          valueColor="rgba(62, 180, 137, 1)"
          borderColor="rgba(62, 180, 137, 0.18)"
          iconBgColor="rgba(62, 180, 137, 0.09)"
        />
        <StatsSummaryCard
          label="Ongoing"
          value={stats.ongoing}
          subtitle="Interviews"
          icon={
            <ChecklistIcon
              sx={{ fontSize: 28, color: "rgba(250, 180, 70, 1)" }}
            />
          }
          valueColor="rgba(250, 180, 70, 1)"
          borderColor="rgba(250, 180, 70, 0.18)"
          iconBgColor="rgba(255, 249, 241, 0.79)"
        />
      </Box>

      {/* History Section */}
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: "rgba(100, 113, 131, 1)",
              fontWeight: 500,
              fontSize: "15px",
              lineHeight: "18.78px",
            }}
          >
            History
          </Typography>
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(189, 133, 255, 1)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "15px",
              px: 2,
              "&:hover": {
                background: "rgba(189, 133, 255, 0.04)",
                border: "none",
              },
            }}
          >
            View All
          </Button>
        </Box>

        {/* Assessment Cards */}
        {assessments.length === 0 ? (
          <Box
            sx={{
              p: 4,
              border: "1px solid rgba(211, 224, 245, 1)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "rgba(100, 113, 131, 1)" }}>
              No interview assessments found. Apply for jobs to start your interviews!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {assessments.slice(0, 5).map((assessment) => {
              const score = getScore(assessment);
              const completed = isCompleted(assessment);
              const timeAgo = assessment.updatedAt || assessment.createdAt
                ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true })
                : "";
              const jobTitle = assessment.post?.jobDetails?.title || "Job Application";
              const companyName = assessment.company?.username || assessment.post?.user?.companyName || "Company";
              const interviewType = assessment.interviewData?.interviewType?.replace(/_/g, " ") || "HR Interview";

              return (
                <Box
                  key={assessment._id}
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
                        label={interviewType}
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
                      onClick={() => handleContinueTest(assessment)}
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
                      onClick={() => handleViewDetails(assessment._id)}
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
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(PostInterviews), {
  ssr: false,
});
