import React, { useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress, LinearProgress, Button } from "@mui/material";
import dynamic from "next/dynamic";
import { formatDistanceToNowStrict } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNew";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import { useRouter } from "next/router";
import StatsSummaryCard from "./StatsSummaryCard";
import {
  fetchSkillAssessmentsByType,
  selectTechnicalAssessments,
  selectSoftAssessments,
  SkillInterviewAssessment,
} from "@/store/slices/interviewSlice";

interface SkillInterviewsProps {
  skillType: "technical" | "soft";
  hideStats?: boolean;
}

const LEVEL = (s: number) =>
  s >= 80 ? { label: "Expert",     color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" } :
  s >= 60 ? { label: "Senior",     color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" } :
  s >= 40 ? { label: "Mid Level",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" } :
  s >= 20 ? { label: "Junior",     color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" } :
            { label: "Entry",      color: "#64748B", bg: "#F8FAFC", border: "#CBD5E1" };

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const getScore = (a: SkillInterviewAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ?? a.interviewData?.finalReport?.coverage?.overall ?? 0;

const SkillInterviews: React.FC<SkillInterviewsProps> = ({ skillType, hideStats = false }) => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: assessments, loading, total } = useSelector(
    skillType === "technical" ? selectTechnicalAssessments : selectSoftAssessments
  );

  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType })); }, [dispatch, skillType]);

  const stats = useMemo(() => {
    const completed = assessments.filter(a => getScore(a) > 0).length;
    return { total: total || assessments.length, completed, ongoing: assessments.length - completed };
  }, [assessments, total]);

  const color  = skillType === "technical" ? "#2563EB" : "#D97706";
  const Icon   = skillType === "technical" ? CodeOutlined : PeopleOutlined;
  const label  = skillType === "technical" ? "Technical Skill" : "Soft Skill";

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress sx={{ color }} />
    </Box>
  );

  return (
    <Box>
      {/* Stats */}
      {!hideStats && (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <StatsSummaryCard label="Total" value={stats.total} subtitle={`${label}s`}
            icon={<AssignmentOutlined sx={{ fontSize: 22, color }} />}
            valueColor={color} borderColor={`${color}30`} iconBgColor={`${color}10`} />
          <StatsSummaryCard label="Completed" value={stats.completed} subtitle="Assessments"
            icon={<CheckCircleOutlined sx={{ fontSize: 22, color: "#059669" }} />}
            valueColor="#059669" borderColor="#A7F3D0" iconBgColor="#ECFDF5" />
          <StatsSummaryCard label="In Progress" value={stats.ongoing} subtitle="Assessments"
            icon={<HourglassEmptyOutlined sx={{ fontSize: 22, color: "#D97706" }} />}
            valueColor="#D97706" borderColor="#FDE68A" iconBgColor="#FFFBEB" />
        </Box>
      )}

      {assessments.length === 0 ? (
        <Box sx={{ py: 10, textAlign: "center", borderRadius: "14px", border: "1.5px dashed #E5E7EB", bgcolor: "#FAFAFA" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: `${color}10`, border: `1.5px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <Icon sx={{ fontSize: 26, color }} />
          </Box>
          <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: "0.9rem", mb: 0.5 }}>No {label} assessments yet</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem" }}>Complete skill assessments to see your history here</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
          {assessments.map(assessment => {
            const score   = getScore(assessment);
            const lvl     = LEVEL(score);
            const timeAgo = (assessment.updatedAt || assessment.createdAt)
              ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true })
              : "";

            return (
              <Box
                key={assessment._id}
                sx={{
                  borderRadius: "14px",
                  border: `1.5px solid ${lvl.border}`,
                  bgcolor: lvl.bg,
                  p: "12px 14px",
                  display: "flex", flexDirection: "column", gap: "8px",
                  transition: "all 0.18s ease",
                  position: "relative", overflow: "hidden",
                  "&:hover": { borderColor: lvl.color, boxShadow: `0 4px 16px ${lvl.color}20`, transform: "translateY(-1px)", bgcolor: "#fff" },
                }}
              >
                <Box sx={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, background: `radial-gradient(circle at top right, ${lvl.color}15, transparent 70%)`, pointerEvents: "none" }} />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#111827", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {assessment.skill || "Skill Assessment"}
                  </Typography>
                  <Box sx={{ px: "7px", py: "2px", borderRadius: "20px", bgcolor: "#fff", border: `1px solid ${lvl.border}`, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, color: lvl.color }}>{lvl.label}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: "4px" }}>
                    <Typography sx={{ fontSize: "0.6rem", color: "#9CA3AF" }}>{score > 0 ? "Score" : "Not tested"}</Typography>
                    {score > 0 && <Typography sx={{ fontSize: "0.7rem", fontWeight: 900, color: getScoreColor(score) }}>{score}%</Typography>}
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.max(score, 0), 100)}
                    sx={{
                      height: 4, borderRadius: "99px", bgcolor: `${lvl.color}18`,
                      "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: score > 0 ? getScoreColor(score) : "transparent" },
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                    <AccessTimeOutlined sx={{ fontSize: 10, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.58rem", color: "#9CA3AF" }}>{timeAgo || "—"}</Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => router.push(`/interview/report/${assessment._id}`)}
                    endIcon={<OpenInNewOutlined sx={{ fontSize: "10px !important" }} />}
                    sx={{
                      textTransform: "none", fontWeight: 700, fontSize: "0.6rem",
                      color: lvl.color, bgcolor: "#fff", border: `1px solid ${lvl.border}`,
                      borderRadius: "6px", px: 1, py: 0.2, minWidth: 0, boxShadow: "none",
                      "&:hover": { bgcolor: lvl.color, color: "#fff" },
                    }}
                  >
                    Report
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default dynamic(() => Promise.resolve(SkillInterviews), { ssr: false });
