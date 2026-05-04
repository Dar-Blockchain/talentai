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
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import { useRouter } from "next/router";
import StepInfoModal from "./StepInfoModal";
import { PostAssessment, getScore as getPostScore, isCompleted, hasPendingSteps } from "./AssessmentCard";
import {
  fetchCandidateAssessments,
  selectCandidateAssessments,
  selectCandidateAssessmentsLoading,
} from "@/store/slices/postSlice";
import {
  fetchSkillAssessmentsByType,
  selectTechnicalAssessments,
  selectSoftAssessments,
  SkillInterviewAssessment,
} from "@/store/slices/interviewSlice";

const T   = "#0D9488";
const TBG = "#F0FDFA";
const TBD = "#99F6E4";

type Tab = "job" | "technical" | "soft";
interface GroupedAssessment { post: any; assessments: any[]; candidatePostStepProgress: any }

const getScoreColor = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#0D9488" : s >= 40 ? "#D97706" : "#DC2626";

const getSkillScore = (a: SkillInterviewAssessment): number =>
  a.interviewData?.finalReport?.scores?.overall ?? a.interviewData?.finalReport?.coverage?.overall ?? 0;

const getLevelLabel = (s: number) =>
  s >= 80 ? { label: "Expert", color: "#059669" } :
  s >= 60 ? { label: "Senior", color: "#2563EB" } :
  s >= 40 ? { label: "Mid",    color: "#D97706" } :
  s >= 20 ? { label: "Junior", color: "#EA580C" } :
             { label: "Entry",  color: "#64748B" };

// ── Job Interview card (skill-card style) ────────────────────
const JobRow: React.FC<{
  assessment: PostAssessment; quota: number;
  onViewDetails: (id: string) => void; onContinueTest: (a: PostAssessment) => void;
}> = ({ assessment, quota, onViewDetails, onContinueTest }) => {
  const score       = getPostScore(assessment);
  const completed   = isCompleted(assessment);
  const pending     = hasPendingSteps(assessment);
  const quotaFull   = quota >= 5;
  const jobTitle    = assessment.post?.jobDetails?.title || "Job Application";
  const company     = assessment.company as any;
  const companyName = company?.companyName || company?.username || assessment.post?.user?.companyName || "";
  const logoUrl     = company?.logo ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Companies/${company.logo}` : undefined;
  const timeAgo     = (assessment.updatedAt || assessment.createdAt)
    ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true }) : "";
  const statusColor = completed ? "#059669" : "#D97706";
  const accentBg    = completed ? "#ECFDF5" : "#FFFBEB";
  const accentBd    = completed ? "#A7F3D0" : "#FDE68A";

  return (
    <Box sx={{
      bgcolor: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px",
      p: 1.75, display: "flex", flexDirection: "column", gap: 1.25,
      transition: "all 0.18s",
      "&:hover": { borderColor: statusColor, boxShadow: `0 4px 16px ${statusColor}18`, transform: "translateY(-1px)" },
    }}>

      {/* Top: avatar + title + status badge */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <Avatar src={logoUrl} variant="rounded" sx={{
          width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
          bgcolor: accentBg, border: `1px solid ${accentBd}`,
          "& img": { objectFit: "contain", p: "3px" },
        }}>
          <BusinessOutlined sx={{ fontSize: 17, color: statusColor }} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
            {jobTitle}
          </Typography>
          {companyName && (
            <Typography sx={{ fontSize: "0.63rem", color: "#94A3B8", mt: 0.15 }}>{companyName}</Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, px: 0.8, py: 0.25, borderRadius: "20px", bgcolor: accentBg, border: `1px solid ${accentBd}`, flexShrink: 0 }}>
          {completed
            ? <CheckCircleOutlined sx={{ fontSize: 9, color: statusColor }} />
            : <HourglassEmptyOutlined sx={{ fontSize: 9, color: statusColor }} />}
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: statusColor }}>{completed ? "Done" : "Ongoing"}</Typography>
        </Box>
      </Box>

      {/* Score bar */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8", fontWeight: 500 }}>
            {score > 0 ? "Score" : "Not started yet"}
          </Typography>
          {score > 0 && <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: getScoreColor(score) }}>{score}%</Typography>}
        </Box>
        <LinearProgress variant="determinate" value={Math.min(score, 100)}
          sx={{ height: 5, borderRadius: "99px", bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: score > 0 ? getScoreColor(score) : "#E2E8F0" } }} />
      </Box>

      {/* Bottom: time + action */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "0.6rem", color: "#CBD5E1" }}>{timeAgo || "Just added"}</Typography>

        {pending ? (
          <Tooltip title={quotaFull ? "Monthly limit reached (5/5)" : ""} arrow>
            <span>
              <Button onClick={() => onContinueTest(assessment)} disabled={quotaFull}
                startIcon={<PlayArrowOutlined sx={{ fontSize: "12px !important" }} />}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.68rem", color: "#fff", bgcolor: "#7C3AED", borderRadius: "8px", px: 1.25, py: 0.35, minWidth: 0, boxShadow: "none", "&:hover": { bgcolor: "#6D28D9" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" } }}>
                Continue
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={() => onViewDetails(assessment._id)} endIcon={<OpenInNewOutlined sx={{ fontSize: "11px !important" }} />}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.68rem", color: statusColor, bgcolor: accentBg, border: `1px solid ${accentBd}`, borderRadius: "8px", px: 1.25, py: 0.35, minWidth: 0, boxShadow: "none", "&:hover": { filter: "brightness(0.95)" } }}>
            Report
          </Button>
        )}
      </Box>
    </Box>
  );
};

// ── Skill row ────────────────────────────────────────────────
const SkillRow: React.FC<{ assessment: SkillInterviewAssessment; last: boolean; accentColor: string; Icon: React.ElementType }> =
  ({ assessment, last, accentColor, Icon }) => {
    const router  = useRouter();
    const score   = getSkillScore(assessment);
    const lvl     = getLevelLabel(score);
    const timeAgo = (assessment.updatedAt || assessment.createdAt)
      ? formatDistanceToNowStrict(new Date(assessment.updatedAt || assessment.createdAt), { addSuffix: true }) : "";

    return (
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px", p: 1.75, display: "flex", flexDirection: "column", gap: 1.25, transition: "all 0.18s", "&:hover": { borderColor: accentColor, boxShadow: `0 4px 16px ${accentColor}18`, transform: "translateY(-1px)" } }}>
        {/* Top: icon + name + level badge */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${accentColor}0F`, border: `1px solid ${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 17, color: accentColor }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
            {assessment.skill || "Skill Assessment"}
          </Typography>
        </Box>
        <Box sx={{ px: 0.85, py: 0.25, borderRadius: "20px", bgcolor: `${lvl.color}12`, border: `1px solid ${lvl.color}25`, flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: lvl.color }}>{lvl.label}</Typography>
        </Box>
      </Box>

      {/* Score bar */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8", fontWeight: 500 }}>{score > 0 ? "Score" : "Not tested yet"}</Typography>
          {score > 0 && <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: getScoreColor(score) }}>{score}%</Typography>}
        </Box>
        <LinearProgress variant="determinate" value={Math.min(score, 100)}
          sx={{ height: 5, borderRadius: "99px", bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: score > 0 ? getScoreColor(score) : "#E2E8F0" } }} />
      </Box>

      {/* Bottom: time + report */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "0.6rem", color: "#CBD5E1" }}>{timeAgo || "Just added"}</Typography>
        {score > 0 && (
          <Button onClick={() => router.push(`/interview/report/${assessment._id}`)} endIcon={<OpenInNewOutlined sx={{ fontSize: "11px !important" }} />}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.68rem", color: "#059669", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", px: 1.25, py: 0.35, minWidth: 0, boxShadow: "none", "&:hover": { bgcolor: "#DCFCE7" } }}>
            Report
          </Button>
        )}
      </Box>
      </Box>
    );
  };

// ── Empty state ──────────────────────────────────────────────
const Empty: React.FC<{ icon: React.ElementType; text: string }> = ({ icon: Icon, text }) => (
  <Box sx={{ py: 7, textAlign: "center" }}>
    <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
      <Icon sx={{ fontSize: 24, color: "#CBD5E1" }} />
    </Box>
    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#94A3B8" }}>{text}</Typography>
  </Box>
);

// ── Main ─────────────────────────────────────────────────────
const InterviewsBlock: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const quota    = useSelector((s: RootState) => s.user.connectedUser.profile?.quota || 0);

  const [tab, setTab]                = useState<Tab>("job");
  const [stepModalOpen, setStep]     = useState(false);
  const [selectedAssmt, setSelected] = useState<PostAssessment | null>(null);

  const groupedData  = useSelector(selectCandidateAssessments) as GroupedAssessment[];
  const jobLoading   = useSelector(selectCandidateAssessmentsLoading);
  const { data: techAssessments, loading: techLoading } = useSelector(selectTechnicalAssessments);
  const { data: softAssessments, loading: softLoading } = useSelector(selectSoftAssessments);

  useEffect(() => { dispatch(fetchCandidateAssessments({ page: 1, limit: 20 })); }, [dispatch]);
  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType: "technical" })); }, [dispatch]);
  useEffect(() => { dispatch(fetchSkillAssessmentsByType({ skillType: "soft" })); }, [dispatch]);

  const jobAssessments = useMemo(() =>
    groupedData.map(group => {
      const latest = [...(group.assessments || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || {};
      return { ...latest, _id: latest._id || group.post?._id, post: latest.post || group.post, company: latest.company, candidatePostStepProgress: group.candidatePostStepProgress } as PostAssessment;
    }), [groupedData]);

  const handleViewDetails  = (id: string) => router.push(`/assessment/${id}`);
  const handleContinueTest = (a: PostAssessment) => { setSelected(a); setStep(true); };
  const handleStartStep    = () => {
    if (!selectedAssmt) return;
    const postId = selectedAssmt.post?._id;
    const step   = selectedAssmt.candidatePostStepProgress?.currentStep;
    if (postId && step) { setStep(false); router.push(`/interview/hr?jobId=${postId}&stepId=${step._id}&pipeline=true`); }
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType; count: number; color: string; bg: string; border: string }[] = [
    { id: "job",       label: "Job Interviews", icon: AssignmentOutlined, count: jobAssessments.length,  color: T,         bg: TBG,       border: TBD       },
    { id: "technical", label: "Technical",      icon: CodeOutlined,       count: techAssessments.length, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    { id: "soft",      label: "Soft Skills",    icon: PeopleOutlined,     count: softAssessments.length, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  ];

  const activeTab = TABS.find(t => t.id === tab)!;
  const loading   = tab === "job" ? jobLoading : tab === "technical" ? techLoading : softLoading;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

      {/* ── Header ── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 0, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: `${activeTab.color}12`, border: `1px solid ${activeTab.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <activeTab.icon sx={{ fontSize: 15, color: activeTab.color }} />
            </Box>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A" }}>Interviews & Assessments</Typography>
          </Box>
        </Box>

        {/* Tabs row */}
        <Box sx={{ display: "flex", gap: 0 }}>
          {TABS.map((t, idx) => {
            const active  = tab === t.id;
            const TabIcon = t.icon;
            return (
              <Box
                key={t.id}
                onClick={() => setTab(t.id)}
                sx={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.6,
                  py: 1.1, px: 1,
                  cursor: "pointer",
                  borderBottom: active ? `2.5px solid ${t.color}` : "2.5px solid transparent",
                  borderRight: idx < TABS.length - 1 ? "1px solid #F1F5F9" : "none",
                  transition: "all 0.15s",
                  "&:hover": { bgcolor: `${t.color}06` },
                }}
              >
                <TabIcon sx={{ fontSize: 14, color: active ? t.color : "#94A3B8" }} />
                <Typography sx={{ fontSize: "0.78rem", fontWeight: active ? 700 : 500, color: active ? t.color : "#94A3B8", whiteSpace: "nowrap" }}>
                  {t.label}
                </Typography>
                {t.count > 0 && (
                  <Box sx={{ px: 0.7, py: 0.1, borderRadius: "99px", bgcolor: active ? `${t.color}15` : "#F1F5F9" }}>
                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: active ? t.color : "#94A3B8" }}>{t.count}</Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Body ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={22} sx={{ color: activeTab.color }} />
        </Box>
      ) : tab === "job" ? (
        jobAssessments.length === 0
          ? <Empty icon={WorkOutlineOutlined} text="No job interviews yet" />
          : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, p: 2 }}>
              {jobAssessments.map(a => <JobRow key={a._id} assessment={a} quota={quota} onViewDetails={handleViewDetails} onContinueTest={handleContinueTest} />)}
            </Box>
          )
      ) : tab === "technical" ? (
        techAssessments.length === 0
          ? <Empty icon={CodeOutlined} text="No technical assessments yet" />
          : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, p: 2 }}>
              {techAssessments.map(a => <SkillRow key={a._id} assessment={a} last={false} accentColor="#2563EB" Icon={CodeOutlined} />)}
            </Box>
          )
      ) : (
        softAssessments.length === 0
          ? <Empty icon={PeopleOutlined} text="No soft assessments yet" />
          : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, p: 2 }}>
              {softAssessments.map(a => <SkillRow key={a._id} assessment={a} last={false} accentColor="#D97706" Icon={PeopleOutlined} />)}
            </Box>
          )
      )}

      <StepInfoModal open={stepModalOpen} onClose={() => setStep(false)} onStart={handleStartStep} assessment={selectedAssmt} quota={quota} />
    </Box>
  );
};

export default dynamic(() => Promise.resolve(InterviewsBlock), { ssr: false });
