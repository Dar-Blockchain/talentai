import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar, Box, Chip, CircularProgress, Dialog, DialogContent,
  Divider, IconButton, LinearProgress, Tab, Tabs, Typography,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import axiosInstance from "@/utils/axiosInstance";
import { getScore, scoreStyle, fmtDate, fmtDuration } from "@/components/features/company/interviews/list/InterviewCard";

// ── Design tokens ──────────────────────────────────────────────────────────────
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

// ── Sub-components ─────────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ value: number; color: string; size?: number; label?: string }> = ({
  value, color, size = 88, label,
}) => {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(value, 100) / 100) * circ;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={9} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={9}
            strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: size > 80 ? "1.1rem" : "0.95rem", fontWeight: 800, color, lineHeight: 1 }}>
            {value.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

const Bar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <LinearProgress variant="determinate" value={Math.min(value, 100)}
    sx={{ height: 6, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
);

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AssessmentTarget {
  applicationId: string;
  postId: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  avatarUrl?: string;
  bgColor: string;
}

interface AssessmentDetailsModalProps {
  open: boolean;
  target: AssessmentTarget | null;
  onClose: () => void;
}

// ── Main component ─────────────────────────────────────────────────────────────

const AssessmentDetailsModal: React.FC<AssessmentDetailsModalProps> = ({ open, target, onClose }) => {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);

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

  // ── Derived values ─────────────────────────────────────────────────────────
  const score        = assessment ? getScore(assessment) : 0;
  const sc           = scoreStyle(score);
  const name         = target.candidateName;
  const email        = target.candidateEmail;
  const letter       = name[0]?.toUpperCase() || "?";
  const title        = assessment?.post?.jobDetails?.title || "Untitled Position";
  const analytics    = assessment?.interviewData?.analytics;
  const areas        = assessment?.interviewData?.finalReport?.coverage?.areas || {};
  const jd           = assessment?.post?.jobDetails;
  const finalReport  = assessment?.interviewData?.finalReport;
  const summary      = finalReport?.summary;
  const recommendations = finalReport?.recommendations || [];
  const overallScore = finalReport?.scores?.overall ?? score;
  const aiAnalysis   = finalReport?.aiAnalysis ?? {};
  const [g1, g2]     = pickGradient(email || name);

  const verdict      = overallScore >= 70 ? t("pages.applications.assessment_modal.verdict_passed") : overallScore >= 50 ? t("pages.applications.assessment_modal.verdict_review") : t("pages.applications.assessment_modal.verdict_needs_work");
  const verdictColor = overallScore >= 70 ? TEAL : overallScore >= 50 ? "#D97706" : "#DC2626";
  const verdictBg    = overallScore >= 70 ? TEAL_BG : overallScore >= 50 ? "#FFFBEB" : "#FEF2F2";

  const hasAreas   = Object.keys(areas).length > 0;
  const hasSummary = !!summary;
  const hasRecs    = recommendations.length > 0;
  // Dynamic tab indices
  let tabIdx = 0;
  const TAB_SCORES   = tabIdx++;
  const TAB_COVERAGE = hasAreas ? tabIdx++ : -1;
  const TAB_REPORT   = (hasSummary || hasRecs) ? tabIdx++ : -1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "18px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.14)", maxHeight: "90vh" } } }}
    >
      {/* ── Header ── */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Avatar
            src={target.avatarUrl}
            sx={{ width: 42, height: 42, bgcolor: target.bgColor, fontSize: 14, fontWeight: 700 }}
          >
            {letter}
          </Avatar>
          <Box sx={{
            position: "absolute", bottom: -2, right: -2,
            width: 14, height: 14, borderRadius: "50%",
            bgcolor: "#7C3AED", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
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

        {/* ── Loading ── */}
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <CircularProgress size={32} sx={{ color: "#7C3AED" }} />
            <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{t("pages.applications.assessment_modal.loading")}</Typography>
          </Box>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <AssessmentOutlined sx={{ fontSize: 40, color: "#E5E7EB", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{t("pages.applications.assessment_modal.not_found")}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>{error}</Typography>
          </Box>
        )}

        {/* ── Content ── */}
        {!loading && assessment && (
          <Box sx={{ flex: 1 }}>

            {/* ══ HERO ══════════════════════════════════════════════════════ */}
            <Box sx={{ borderBottom: "1px solid #F3F4F6", overflow: "hidden" }}>
              {/* Gradient stripe */}
              <Box sx={{ height: 5, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

              <Box sx={{ px: 3, pt: 2.5, pb: 2, display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
                {/* Large avatar */}
                <Avatar sx={{ width: 58, height: 58, fontWeight: 800, fontSize: "1.4rem", background: `linear-gradient(135deg, ${g1}, ${g2})`, color: "#fff", flexShrink: 0 }}>
                  {letter}
                </Avatar>

                {/* Info */}
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

                {/* Score ring + verdict */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                  <ScoreRing value={overallScore} color={sc.color} size={80} />
                  <Chip label={verdict} size="small"
                    sx={{ bgcolor: verdictBg, color: verdictColor, fontWeight: 700, fontSize: "0.68rem", height: 20, px: 0.5, border: `1px solid ${verdictColor}30` }} />
                </Box>
              </Box>

              {/* Quick stat strip */}
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

            {/* ══ TABS ══════════════════════════════════════════════════════ */}
            <Box>
              {/* Tab bar */}
              <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3 }}>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  sx={{
                    minHeight: 42,
                    "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.78rem", minHeight: 42, color: "#9CA3AF", px: 0, mr: 2.5 },
                    "& .Mui-selected": { color: TEAL },
                    "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
                  }}
                >
                  <Tab label={t("pages.applications.assessment_modal.tab_scores")} />
                  {hasAreas && <Tab label={t("pages.applications.assessment_modal.tab_coverage")} />}
                  {(hasSummary || hasRecs) && <Tab label={t("pages.applications.assessment_modal.tab_ai_report")} />}
                </Tabs>
              </Box>

              {/* ── Tab: Scores ── */}
              {tab === TAB_SCORES && (
                <Box sx={{ p: 3 }}>
                  {/* Score rings */}
                  <Box sx={{ display: "flex", gap: 4, mb: 3, justifyContent: "center", flexWrap: "wrap" }}>
                    <ScoreRing value={overallScore} color={sc.color} size={90} label={t("pages.applications.assessment_modal.score_overall")} />
                    {analytics?.coveragePercentage !== undefined && (
                      <ScoreRing value={analytics.coveragePercentage} color="#0891B2" size={90} label={t("pages.applications.assessment_modal.score_coverage")} />
                    )}
                  </Box>

                  {/* Score breakdown bars */}
                  {finalReport?.scores && Object.keys(finalReport.scores).length > 1 && (
                    <>
                      <Divider sx={{ mb: 2.5, borderColor: "#F3F4F6" }} />
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5 }}>
                        {t("pages.applications.assessment_modal.score_breakdown")}
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {[
                          { key: "communication",    labelKey: "pages.applications.assessment_modal.score_communication",    color: "#3B82F6" },
                          { key: "technical_depth",  labelKey: "pages.applications.assessment_modal.score_technical_depth",  color: "#8B5CF6" },
                          { key: "problem_approach", labelKey: "pages.applications.assessment_modal.score_problem_approach", color: "#F59E0B" },
                          { key: "learning_ability", labelKey: "pages.applications.assessment_modal.score_learning_ability", color: "#10B981" },
                        ].map(({ key, labelKey, color }) => {
                          const val = finalReport.scores?.[key];
                          if (val === undefined) return null;
                          const pct = Math.min(Math.round(val), 100);
                          const tColor = pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626";
                          return (
                            <Box key={key}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                <Typography sx={{ fontSize: "0.78rem", fontWeight: 500, color: "#374151" }}>{t(labelKey)}</Typography>
                                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: tColor }}>{pct}%</Typography>
                              </Box>
                              <Bar value={pct} color={color} />
                            </Box>
                          );
                        })}
                      </Box>
                    </>
                  )}

                  {/* Strengths & Weaknesses */}
                  {(aiAnalysis.strongestAreas?.length > 0 || aiAnalysis.weakestAreas?.length > 0) && (
                    <>
                      <Divider sx={{ my: 2.5, borderColor: "#F3F4F6" }} />
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        {aiAnalysis.strongestAreas?.length > 0 && (
                          <Box sx={{ flex: 1, bgcolor: "#F0FDF4", borderRadius: "12px", border: "1px solid #BBF7D0", p: 1.75 }}>
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.75 }}>
                              {t("pages.applications.assessment_modal.strengths")}
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                              {aiAnalysis.strongestAreas.map((a: string, i: number) => (
                                <Typography key={i} sx={{ fontSize: "0.75rem", color: "#065F46" }}>· {a}</Typography>
                              ))}
                            </Box>
                          </Box>
                        )}
                        {aiAnalysis.weakestAreas?.length > 0 && (
                          <Box sx={{ flex: 1, bgcolor: "#FFF7ED", borderRadius: "12px", border: "1px solid #FED7AA", p: 1.75 }}>
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.75 }}>
                              {t("pages.applications.assessment_modal.weak_areas")}
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                              {aiAnalysis.weakestAreas.map((a: string, i: number) => (
                                <Typography key={i} sx={{ fontSize: "0.75rem", color: "#92400E" }}>· {a}</Typography>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </>
                  )}

                </Box>
              )}

              {/* ── Tab: Coverage ── */}
              {tab === TAB_COVERAGE && hasAreas && (
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {/* Overall coverage chip */}
                  {finalReport?.coverage?.overall !== undefined && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {t("pages.applications.assessment_modal.overall_coverage")}
                      </Typography>
                      <Chip label={`${Math.round(finalReport.coverage.overall)}%`} size="small"
                        sx={{ bgcolor: `${TEAL}12`, color: TEAL, fontWeight: 700, fontSize: "0.72rem", height: 20 }} />
                    </Box>
                  )}
                  {Object.entries(areas).map(([area, data]: [string, any]) => {
                    const pct = data.percentage ?? 0;
                    const ac  = scoreStyle(pct);
                    return (
                      <Box key={area}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                            {area.replace(/_/g, " ")}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: ac.color }}>{pct}%</Typography>
                            <Chip label={ac.label} size="small"
                              sx={{ height: 18, bgcolor: ac.bg, color: ac.color, fontWeight: 700, fontSize: "0.62rem", "& .MuiChip-label": { px: 1 } }} />
                          </Box>
                        </Box>
                        <Bar value={pct} color={ac.color} />
                        {data.indicators?.length > 0 && (
                          <Box sx={{ mt: 1.25, display: "flex", flexDirection: "column", gap: 0.5 }}>
                            {data.indicators.slice(0, 4).map((ind: any, i: number) => (
                              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, bgcolor: ind.covered ? "#10B981" : "#EF4444" }} />
                                <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>
                                  {ind.evidence?.[0] || ind.name}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* ── Tab: AI Report ── */}
              {tab === TAB_REPORT && (hasSummary || hasRecs) && (
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Summary */}
                  {hasSummary && (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <PersonOutlined sx={{ fontSize: 14, color: "#10B981" }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{t("pages.applications.assessment_modal.ai_summary_title")}</Typography>
                      </Box>
                      <Box sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #D1FAE5" }}>
                        <Typography sx={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.8 }}>{summary}</Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Recommendations */}
                  {hasRecs && (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <Box sx={{ width: 26, height: 26, borderRadius: "8px", bgcolor: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <LightbulbOutlined sx={{ fontSize: 14, color: "#F59E0B" }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{t("pages.applications.assessment_modal.recommendations_title")}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {recommendations.map((rec: string, i: number) => (
                          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.5, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                            <CheckCircleOutlined sx={{ color: "#F59E0B", fontSize: 15, mt: 0.15, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "0.78rem", color: "#92400E", lineHeight: 1.65, textTransform: "capitalize" }}>{rec}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}


            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentDetailsModal;
