import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar, Box, Chip, CircularProgress, Dialog, DialogContent,
  IconButton, Tab, Tabs, Typography,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import axiosInstance from "@/utils/axiosInstance";
import { getScore, scoreStyle, fmtDate, fmtDuration } from "@/components/features/company/interviews/list/InterviewCard";
import ScoreRing from "./assessment/ScoreRing";
import AssessmentScoresTab from "./assessment/AssessmentScoresTab";
import AssessmentCoverageTab from "./assessment/AssessmentCoverageTab";
import AssessmentAiReportTab from "./assessment/AssessmentAiReportTab";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

function pickGradient(str: string): [string, string] {
  const GRADS: [string, string][] = [
    ["#8310FF", "#A855F7"],
    ["#0D9488", "#34D399"],
    ["#0891B2", "#38BDF8"],
    ["#D97706", "#FCD34D"],
    ["#DC2626", "#F87171"],
  ];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return GRADS[Math.abs(h) % GRADS.length];
}

export interface AssessmentTarget {
  applicationId: string;
  postId: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  avatarUrl?: string;
  bgColor: string;
}

interface Props {
  open: boolean;
  target: AssessmentTarget | null;
  onClose: () => void;
}

const AssessmentDetailsModal: React.FC<Props> = ({ open, target, onClose }) => {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading]       = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [error, setError]           = useState("");
  const [tab, setTab]               = useState(0);

  useEffect(() => {
    if (!open || !target) return;
    setAssessment(null);
    setError("");
    setTab(0);
    setLoading(true);
    axiosInstance
      .get(`post-interview-assessments/post/${target.postId}/candidate/${target.candidateUserId}`)
      .then(res => setAssessment(res.data?.data ?? null))
      .catch(e => setError(e.response?.data?.message || "Failed to load assessment."))
      .finally(() => setLoading(false));
  }, [open, target]);

  if (!target) return null;

  const score        = assessment ? getScore(assessment) : 0;
  const sc           = scoreStyle(score);
  const name         = target.candidateName;
  const email        = target.candidateEmail;
  const letter       = name[0]?.toUpperCase() || "?";
  const title        = assessment?.post?.jobDetails?.title || "Untitled Position";
  const analytics    = assessment?.interviewData?.analytics;
  const areas        = assessment?.interviewData?.finalReport?.coverage?.areas || {};
  const finalReport  = assessment?.interviewData?.finalReport;
  const overallScore = finalReport?.scores?.overall ?? score;
  const aiAnalysis   = finalReport?.aiAnalysis ?? {};
  const [g1, g2]     = pickGradient(email || name);

  const verdict      = overallScore >= 70 ? t("pages.applications.assessment_modal.verdict_passed") : overallScore >= 50 ? t("pages.applications.assessment_modal.verdict_review") : t("pages.applications.assessment_modal.verdict_needs_work");
  const verdictColor = overallScore >= 70 ? TEAL : overallScore >= 50 ? "#D97706" : "#DC2626";
  const verdictBg    = overallScore >= 70 ? TEAL_BG : overallScore >= 50 ? "#FFFBEB" : "#FEF2F2";

  const hasAreas   = Object.keys(areas).length > 0;
  const hasSummary = !!finalReport?.summary;
  const hasRecs    = (finalReport?.recommendations || []).length > 0;

  let tabIdx = 0;
  const TAB_SCORES   = tabIdx++;
  const TAB_COVERAGE = hasAreas ? tabIdx++ : -1;
  const TAB_REPORT   = (hasSummary || hasRecs) ? tabIdx++ : -1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: "18px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)", maxHeight: "90vh" } } }}
    >
      {/* Dialog header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Avatar src={target.avatarUrl} sx={{ width: 42, height: 42, bgcolor: target.bgColor, fontSize: 14, fontWeight: 700 }}>{letter}</Avatar>
          <Box sx={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", bgcolor: "#7C3AED", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AssessmentOutlined sx={{ fontSize: 7, color: "#fff" }} />
          </Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{name}</Typography>
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{t("pages.applications.assessment_modal.subtitle")}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#9CA3AF", borderRadius: "8px", "&:hover": { bgcolor: "#F3F4F6", color: "#374151" } }}>
          <CloseOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 0, py: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <CircularProgress size={32} sx={{ color: "#7C3AED" }} />
            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("pages.applications.assessment_modal.loading")}</Typography>
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AssessmentOutlined sx={{ fontSize: 40, color: "#E5E7EB", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{t("pages.applications.assessment_modal.not_found")}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>{error}</Typography>
          </Box>
        )}

        {!loading && assessment && (
          <Box sx={{ flex: 1 }}>
            {/* Candidate hero strip */}
            <Box sx={{ borderBottom: "1px solid #F3F4F6", overflow: "hidden" }}>
              <Box sx={{ height: 5, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />
              <Box sx={{ px: 3, pt: 2.5, pb: 2, display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
                <Avatar sx={{ width: 58, height: 58, fontWeight: 800, fontSize: "1.4rem", background: `linear-gradient(135deg, ${g1}, ${g2})`, color: "#fff", flexShrink: 0 }}>
                  {letter}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", lineHeight: 1.2 }}>{name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.4, mb: 1 }}>
                    <EmailOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{email || "—"}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    <Chip label={title} size="small" icon={<WorkOutlined style={{ fontSize: 11 }} />}
                      sx={{ bgcolor: TEAL_BG, color: TEAL, fontWeight: 600, fontSize: "0.68rem", height: 22, border: `1px solid ${TEAL_BORDER}`, "& .MuiChip-icon": { color: `${TEAL} !important` } }} />
                    {assessment.createdAt && (
                      <Chip label={fmtDate(assessment.createdAt)} size="small" icon={<CalendarTodayOutlined style={{ fontSize: 11 }} />}
                        sx={{ bgcolor: "#F3F4F6", color: "#374151", fontWeight: 600, fontSize: "0.68rem", height: 22 }} />
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                  <ScoreRing value={overallScore} color={sc.color} size={80} />
                  <Chip label={verdict} size="small"
                    sx={{ bgcolor: verdictBg, color: verdictColor, fontWeight: 700, fontSize: "0.68rem", height: 20, px: 0.5, border: `1px solid ${verdictColor}30` }} />
                </Box>
              </Box>
              <Box sx={{ px: 3, pb: 2, display: "flex", gap: 2.5, flexWrap: "wrap" }}>
                {analytics?.duration !== undefined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <AccessTimeOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.73rem", color: "#6B7280" }}>
                      {t("pages.applications.assessment_modal.duration")} <strong style={{ color: "#374151" }}>{fmtDuration(analytics.duration)}</strong>
                    </Typography>
                  </Box>
                )}
                {analytics?.messageCount !== undefined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <ChatBubbleOutlineOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.73rem", color: "#6B7280" }}>
                      {t("pages.applications.assessment_modal.responses")} <strong style={{ color: "#374151" }}>{analytics.messageCount}</strong>
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Tabs */}
            <Box>
              <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                  sx={{ minHeight: 42, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.78rem", minHeight: 42, color: "#9CA3AF", px: 0, mr: 2.5 }, "& .Mui-selected": { color: TEAL }, "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 } }}>
                  <Tab label={t("pages.applications.assessment_modal.tab_scores")} />
                  {hasAreas && <Tab label={t("pages.applications.assessment_modal.tab_coverage")} />}
                  {(hasSummary || hasRecs) && <Tab label={t("pages.applications.assessment_modal.tab_ai_report")} />}
                </Tabs>
              </Box>

              {tab === TAB_SCORES && (
                <AssessmentScoresTab
                  overallScore={overallScore}
                  analytics={analytics}
                  finalReport={finalReport}
                  aiAnalysis={aiAnalysis}
                />
              )}
              {tab === TAB_COVERAGE && hasAreas && (
                <AssessmentCoverageTab
                  areas={areas}
                  overallCoverage={finalReport?.coverage?.overall}
                />
              )}
              {tab === TAB_REPORT && (hasSummary || hasRecs) && (
                <AssessmentAiReportTab
                  summary={finalReport?.summary}
                  recommendations={finalReport?.recommendations}
                />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsModal;
