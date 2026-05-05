import React, { useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress, LinearProgress, Button } from "@mui/material";
import dynamic from "next/dynamic";
import dayjs from "@/lib/dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNew";
import { useRouter } from "next/router";
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

const getScore = (a: SkillInterviewAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ?? a.interviewData?.finalReport?.coverage?.overall ?? 0;

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const getLevelLabel = (s: number) =>
  s >= 80 ? { label: "Expert", color: "#059669" } :
  s >= 60 ? { label: "Senior", color: "#2563EB" } :
  s >= 40 ? { label: "Mid",    color: "#D97706" } :
  s >= 20 ? { label: "Junior", color: "#EA580C" } :
             { label: "Entry",  color: "#64748B" };

const SkillRow: React.FC<{
  assessment: SkillInterviewAssessment;
  last: boolean;
  accentColor: string;
  Icon: React.ElementType;
}> = ({ assessment, last, accentColor, Icon }) => {
  const router  = useRouter();
  const score   = getScore(assessment);
  const lvl     = getLevelLabel(score);
  const timeAgo = (assessment.updatedAt || assessment.createdAt)
    ? dayjs(assessment.updatedAt || assessment.createdAt).fromNow()
    : "";

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      px: 2.5, py: 1.5,
      borderBottom: last ? "none" : "1px solid #F1F5F9",
      transition: "background 0.12s",
      "&:hover": { bgcolor: "#F8FAFC" },
    }}>
      {/* Icon */}
      <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: `${accentColor}0F`, border: `1px solid ${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon sx={{ fontSize: 16, color: accentColor }} />
      </Box>

      {/* Name + progress */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A", mb: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {assessment.skill || "Skill Assessment"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {score > 0 ? (
            <>
              <LinearProgress variant="determinate" value={Math.min(score, 100)}
                sx={{ flex: 1, height: 3, borderRadius: "99px", bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: getScoreColor(score) } }} />
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: getScoreColor(score), flexShrink: 0 }}>{score}%</Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8" }}>Not tested yet</Typography>
          )}
        </Box>
      </Box>

      {/* Right: level + time */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.3, flexShrink: 0 }}>
        <Box sx={{ px: 0.9, py: 0.2, borderRadius: "20px", bgcolor: `${lvl.color}12`, border: `1px solid ${lvl.color}25` }}>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: lvl.color }}>{lvl.label}</Typography>
        </Box>
        {timeAgo && <Typography sx={{ fontSize: "0.6rem", color: "#CBD5E1" }}>{timeAgo}</Typography>}
      </Box>

      {/* Report button */}
      {score > 0 && (
        <Button
          onClick={() => router.push(`/interview/report/${assessment._id}`)}
          endIcon={<OpenInNewOutlined sx={{ fontSize: "11px !important" }} />}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "0.7rem",
            color: "#059669", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: "8px", px: 1.25, py: 0.4, minWidth: 0, boxShadow: "none", flexShrink: 0,
            "&:hover": { bgcolor: "#DCFCE7" },
          }}
        >
          Report
        </Button>
      )}
    </Box>
  );
};

const SkillInterviews: React.FC<SkillInterviewsProps> = ({ skillType, hideStats = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: assessments, loading, total } = useSelector(
    skillType === "technical" ? selectTechnicalAssessments : selectSoftAssessments
  );

  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType })); }, [dispatch, skillType]);

  const stats = useMemo(() => {
    const completed = assessments.filter(a => getScore(a) > 0).length;
    return { total: total || assessments.length, completed, ongoing: assessments.length - completed };
  }, [assessments, total]);

  const isTech      = skillType === "technical";
  const accentColor = isTech ? "#2563EB" : "#D97706";
  const Icon        = isTech ? CodeOutlined : PeopleOutlined;
  const title       = isTech ? "Technical Assessments" : "Soft Assessments";
  const doneColor   = "#059669";
  const ongoingColor = "#D97706";

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.75, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Icon sx={{ fontSize: 18, color: accentColor }} />
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>{title}</Typography>
          </Box>
          {!hideStats && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ px: 1, py: 0.25, borderRadius: "20px", bgcolor: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: doneColor }}>{stats.completed} done</Typography>
              </Box>
              <Box sx={{ px: 1, py: 0.25, borderRadius: "20px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: ongoingColor }}>{stats.ongoing} pending</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Body */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={24} sx={{ color: accentColor }} />
        </Box>
      ) : assessments.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Icon sx={{ fontSize: 32, color: "#CBD5E1", mb: 1 }} />
          <Typography sx={{ fontSize: "0.82rem", color: "#94A3B8" }}>No {isTech ? "technical" : "soft"} assessments yet</Typography>
        </Box>
      ) : (
        <Box>
          {assessments.map((a, i) => (
            <SkillRow
              key={a._id}
              assessment={a}
              last={i === assessments.length - 1}
              accentColor={accentColor}
              Icon={Icon}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default dynamic(() => Promise.resolve(SkillInterviews), { ssr: false });
