import React, { useEffect, useMemo } from "react";
import { Box, Button, Typography, CircularProgress, LinearProgress } from "@mui/material";
import dynamic from "next/dynamic";
import StatsSummaryCard from "./StatsSummaryCard";
import ChecklistIcon from "@/components/icons/CheckListIcon";
import { ArrowForward } from "@mui/icons-material";
import TimeOutlineIcon from "@/components/icons/TimeOutlineIcon";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/router";
import dayjs from "@/lib/dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchSkillAssessmentsByType,
  selectTechnicalAssessments,
  selectSoftAssessments,
  SkillInterviewAssessment,
} from "@/store/slices/interviewSlice";

interface SkillInterviewsProps {
  skillType: 'technical' | 'soft';
}

const SkillInterviews: React.FC<SkillInterviewsProps> = ({ skillType }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: assessments, loading, total } = useSelector(
    skillType === 'technical' ? selectTechnicalAssessments : selectSoftAssessments
  );

  useEffect(() => {
    dispatch(fetchSkillAssessmentsByType({ skillType }));
  }, [dispatch, skillType]);

  const stats = useMemo(() => {
    const completed = assessments.filter((a) =>
      a.interviewData?.finalReport?.scores?.overall !== undefined ||
      a.interviewData?.finalReport?.coverage?.overall !== undefined
    ).length;

    return {
      total: total || assessments.length,
      completed,
      ongoing: assessments.length - completed,
    };
  }, [assessments, total]);

  const getScore = (assessment: SkillInterviewAssessment): number => {
    return assessment.interviewData?.finalReport?.scores?.overall ??
           assessment.interviewData?.finalReport?.coverage?.overall ??
           0;
  };

  const handleViewDetails = (assessmentId: string) => {
    router.push(`/interview/report/${assessmentId}`);
  };

  // Color based on score level (matching SkillCard design)
  const getLevelColor = (score: number): string => {
    if (score >= 80) return "rgba(62, 180, 137, 1)";  // Expert - Green
    if (score >= 60) return "rgba(11, 82, 198, 1)";   // Senior - Blue
    if (score >= 40) return "rgba(255, 180, 65, 1)";  // Mid Level - Gold
    if (score >= 20) return "rgba(251, 146, 60, 1)";  // Junior - Orange
    return "rgba(186, 200, 222, 1)";                   // Entry Level - Gray
  };

  const getLevelFromScore = (score: number): string => {
    if (score >= 80) return "Expert";
    if (score >= 60) return "Senior";
    if (score >= 40) return "Mid Level";
    if (score >= 20) return "Junior";
    return "Entry Level";
  };

  // Theme colors based on skill type
  const themeColor = skillType === 'technical'
    ? "rgba(11, 82, 198, 1)"
    : "rgba(250, 180, 70, 1)";

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: themeColor }} />
      </Box>
    );
  }

  const skillLabel = skillType === 'technical' ? 'Technical Skills' : 'Soft Skills';

  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <StatsSummaryCard
          label="Total"
          value={stats.total}
          subtitle={skillLabel}
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
          subtitle="Assessments"
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
          subtitle="Assessments"
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

      {/* History Header */}
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
            color: themeColor,
            textTransform: "none",
            fontWeight: 500,
            fontSize: "15px",
            px: 2,
            "&:hover": {
              background: `${themeColor}10`,
              border: "none",
            },
          }}
        >
          View All
        </Button>
      </Box>

      {/* Skill Cards Grid - Matching Skills & Expertise design */}
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
            No {skillType} skill assessments found. Start your first assessment!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {assessments.map((assessment) => {
            const score = getScore(assessment);
            const levelColor = getLevelColor(score);
            const updatedAt = assessment.updatedAt || assessment.createdAt;
            const timeAgo = updatedAt
              ? dayjs(updatedAt).fromNow()
              : "";

            return (
              <Box
                key={assessment._id}
                sx={{
                  p: 1.5,
                  border: "1px solid rgba(19, 151, 107, 0.22)",
                  borderRadius: "8px",
                  width: "23%",
                  minWidth: "200px",
                  height: "120px",
                  boxShadow: "0px 2px 18px 0px rgba(24, 25, 28, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* Skill Name and Score */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(62, 70, 82, 1)",
                      fontSize: "17px",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "70%",
                    }}
                  >
                    {assessment.skill || 'Skill Assessment'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: levelColor,
                      fontSize: "16px",
                      fontWeight: 400,
                    }}
                  >
                    {score}%
                  </Typography>
                </Box>

                {/* Time */}
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <TimeOutlineIcon />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(84, 98, 116, 1)",
                      fontWeight: 400,
                      fontSize: "11px",
                    }}
                  >
                    {timeAgo}
                  </Typography>
                </Box>

                {/* Level and Action */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(84, 98, 116, 1)",
                        fontWeight: 400,
                        fontSize: "11px",
                      }}
                    >
                      {getLevelFromScore(score)}
                    </Typography>
                    <Button
                      onClick={() => handleViewDetails(assessment._id)}
                      variant="outlined"
                      endIcon={<ChevronRightIcon />}
                      sx={{
                        border: "none",
                        background: "none",
                        color: levelColor,
                        textDecoration: "unset",
                        fontSize: "11px",
                        fontWeight: 500,
                        padding: 0,
                        minWidth: "auto",
                        "& .MuiButton-endIcon": {
                          marginLeft: 0,
                          color: levelColor,
                        },
                        "&:hover": {
                          background: "none",
                          textDecoration: "unset",
                          fontWeight: 600,
                          "& .MuiButton-endIcon": {
                            transform: "scale(1.15)",
                          },
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>

                  {/* Progress Bar */}
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.max(score, 0), 100)}
                    sx={{
                      height: 7,
                      borderRadius: 3,
                      backgroundColor: "rgba(243, 245, 247, 1)",
                      overflow: "hidden",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 3,
                        backgroundColor: levelColor,
                      },
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default dynamic(() => Promise.resolve(SkillInterviews), {
  ssr: false,
});
