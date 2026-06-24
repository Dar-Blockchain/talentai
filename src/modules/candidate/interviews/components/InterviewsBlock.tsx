import React, { useEffect } from "react";
import { Box, Typography, CircularProgress, LinearProgress, Button } from "@mui/material";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch } from "@/store/store";
import dayjs from "@/lib/dayjs";
import OpenInNewOutlined from "@mui/icons-material/OpenInNew";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import { useRouter } from "next/router";
import {
  fetchSkillAssessmentsByType,
  selectTechnicalAssessments,
  selectSoftAssessments,
  SkillInterviewAssessment,
} from "@/store/slices/interviewSlice";

const NAVY = "#0D1B2A";

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const getSkillScore = (a: SkillInterviewAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ?? a.interviewData?.finalReport?.coverage?.overall ?? 0;

const getLevelKey = (s: number) =>
  s >= 80 ? "expert" : s >= 60 ? "senior" : s >= 40 ? "mid" : s >= 20 ? "junior" : "entry";

const LEVEL_COLORS: Record<string, string> = {
  expert: "#059669", senior: "#2563EB", mid: "#D97706", junior: "#EA580C", entry: "#64748B",
};

// ── Skill card ───────────────────────────────────────────────
const SkillRow: React.FC<{
  assessment: SkillInterviewAssessment; accentColor: string; Icon: React.ElementType;
  s: (k: string, opts?: any) => string;
}> = ({ assessment, accentColor, Icon, s }) => {
  const router   = useRouter();
  const score    = getSkillScore(assessment);
  const levelKey = getLevelKey(score);
  const lvlColor = LEVEL_COLORS[levelKey];
  const date     = assessment.updatedAt || assessment.createdAt;
  const timeAgo  = date ? dayjs(date).fromNow() : "";

  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px", p: 1.75, display: "flex", flexDirection: "column", gap: 1.25, transition: "all 0.18s", "&:hover": { borderColor: accentColor, boxShadow: `0 4px 16px ${accentColor}18`, transform: "translateY(-1px)" } }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${accentColor}0F`, border: `1px solid ${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 17, color: accentColor }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
            {assessment.skill || s("skill_assessment")}
          </Typography>
        </Box>
        <Box sx={{ px: 0.85, py: 0.25, borderRadius: "20px", bgcolor: `${lvlColor}12`, border: `1px solid ${lvlColor}25`, flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: lvlColor }}>{s(`levels.${levelKey}`)}</Typography>
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8", fontWeight: 500 }}>{score > 0 ? s("score") : s("not_tested")}</Typography>
          {score > 0 && <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: getScoreColor(score) }}>{score}%</Typography>}
        </Box>
        <LinearProgress variant="determinate" value={Math.min(score, 100)}
          sx={{ height: 5, borderRadius: "99px", bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: score > 0 ? getScoreColor(score) : "#E2E8F0" } }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "0.6rem", color: "#CBD5E1" }}>{timeAgo || s("just_added")}</Typography>
        {score > 0 && (
          <Button onClick={() => router.push(`/candidate/interview/report/${assessment._id}`)} endIcon={<OpenInNewOutlined sx={{ fontSize: "11px !important" }} />}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.68rem", color: "#059669", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", px: 1.25, py: 0.35, minWidth: 0, boxShadow: "none", "&:hover": { bgcolor: "#DCFCE7" } }}>
            {s("report")}
          </Button>
        )}
      </Box>
    </Box>
  );
};

// ── Section block ────────────────────────────────────────────
const SectionBlock: React.FC<{
  icon: React.ElementType; label: string; count: number;
  color: string; bg: string; border: string;
  loading: boolean; children: React.ReactNode; emptyText: string; emptyIcon: React.ElementType;
}> = ({ icon: Icon, label, count, color, bg, border, loading, children, emptyText, emptyIcon: EmptyIcon }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
    <Box sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon sx={{ fontSize: 15, color }} />
      </Box>
      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: NAVY, flex: 1 }}>{label}</Typography>
      {count > 0 && (
        <Box sx={{ px: 0.9, py: 0.2, borderRadius: "99px", bgcolor: bg, border: `1px solid ${border}` }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color }}>{count}</Typography>
        </Box>
      )}
    </Box>

    {loading ? (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress size={22} sx={{ color }} />
      </Box>
    ) : count === 0 ? (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.25 }}>
          <EmptyIcon sx={{ fontSize: 22, color: "#CBD5E1" }} />
        </Box>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#94A3B8" }}>{emptyText}</Typography>
      </Box>
    ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, p: 2 }}>
        {children}
      </Box>
    )}
  </Box>
);

// ── Main ─────────────────────────────────────────────────────
const InterviewsBlock: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.interviews.${k}`, opts) as string;

  const dispatch = useDispatch<AppDispatch>();

  const { data: techAssessments, loading: techLoading } = useSelector(selectTechnicalAssessments);
  const { data: softAssessments, loading: softLoading } = useSelector(selectSoftAssessments);

  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType: "technical" })); }, [dispatch]);
  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType: "soft" })); }, [dispatch]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      <SectionBlock
        icon={CodeOutlined} label={s("technical")} count={techAssessments.length}
        color="#2563EB" bg="#EFF6FF" border="#BFDBFE"
        loading={techLoading} emptyText={s("empty_technical")} emptyIcon={CodeOutlined}
      >
        {techAssessments.map(a => (
          <SkillRow key={a._id} assessment={a} accentColor="#2563EB" Icon={CodeOutlined} s={s} />
        ))}
      </SectionBlock>

      <SectionBlock
        icon={PeopleOutlined} label={s("soft_skills")} count={softAssessments.length}
        color="#D97706" bg="#FFFBEB" border="#FDE68A"
        loading={softLoading} emptyText={s("empty_soft")} emptyIcon={PeopleOutlined}
      >
        {softAssessments.map(a => (
          <SkillRow key={a._id} assessment={a} accentColor="#D97706" Icon={PeopleOutlined} s={s} />
        ))}
      </SectionBlock>

    </Box>
  );
};

export default dynamic(() => Promise.resolve(InterviewsBlock), { ssr: false });
