import React, { useState } from "react";
import {
  Box, Typography, Avatar, Chip, Button, LinearProgress, Divider, Tab, Tabs,
} from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import CallSplitOutlined from "@mui/icons-material/CallSplitOutlined";
import MailOutlineOutlined from "@mui/icons-material/MailOutline";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import RadioButtonCheckedOutlined from "@mui/icons-material/RadioButtonChecked";
import { InterviewAssessment, getScore, scoreStyle, fmtDate, fmtDuration } from "../list/InterviewCard";

// ─── Design tokens ────────────────────────────────────────────────────────────
const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

function pickGradient(str: string) {
  const GRADS = [
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

// ─── Score ring ───────────────────────────────────────────────────────────────
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
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: size > 80 ? "1.35rem" : "1rem", fontWeight: 800, color, lineHeight: 1 }}>
            {value.toFixed(0)}%
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

// ─── Thin progress bar ────────────────────────────────────────────────────────
const Bar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <LinearProgress variant="determinate" value={Math.min(value, 100)}
    sx={{ height: 6, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
);

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.25, borderBottom: "1px solid #F3F4F6", "&:last-child": { borderBottom: "none" } }}>
    <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#6B7280" }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#111827", mt: 0.1 }}>{value}</Typography>
    </Box>
  </Box>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", ...sx }}>
    {children}
  </Box>
);

const CardHeader: React.FC<{ icon: React.ReactNode; title: string; color?: string }> = ({ icon, title, color = TEAL }) => (
  <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 1.25 }}>
    <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", color, "& svg": { fontSize: 16 } }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>{title}</Typography>
  </Box>
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface InterviewDetailProps {
  assessment: InterviewAssessment;
  stepsData?: any | null;
  hasSteps?: boolean;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const InterviewDetail: React.FC<InterviewDetailProps> = ({ assessment, stepsData, hasSteps, onBack }) => {
  const [tab, setTab] = useState(0);

  const score        = getScore(assessment);
  const sc           = scoreStyle(score);
  const name         = assessment.candidate?.username || assessment.candidate?.email || "Unknown";
  const email        = assessment.candidate?.email || "";
  const letter       = name[0]?.toUpperCase() || "?";
  const title        = assessment.post?.jobDetails?.title || "Untitled Position";
  const analytics    = assessment.interviewData?.analytics;
  const areas        = assessment.interviewData?.finalReport?.coverage?.areas || {};
  const jd           = assessment.post?.jobDetails;
  const finalReport  = assessment.interviewData?.finalReport;
  const summary      = finalReport?.summary;
  const recommendations = finalReport?.recommendations || [];
  const overallScore = finalReport?.scores?.overall ?? score;
  const requiredSkills = assessment.post?.skillAnalysis?.requiredSkills || [];
  const softSkills   = assessment.post?.skillAnalysis?.softSkills || [];
  const [g1, g2]     = pickGradient(email || name);

  const verdict      = overallScore >= 70 ? "Passed" : overallScore >= 50 ? "In Review" : "Needs Work";
  const verdictColor = overallScore >= 70 ? TEAL : overallScore >= 50 ? "#D97706" : "#DC2626";
  const verdictBg    = overallScore >= 70 ? TEAL_BG : overallScore >= 50 ? "#FFFBEB" : "#FEF2F2";

  const hasAreas   = Object.keys(areas).length > 0;
  const hasSummary = !!summary;
  const hasRecs    = recommendations.length > 0;
  const hasSkills  = requiredSkills.length > 0 || softSkills.length > 0;
  const pipelineSteps: any[] = stepsData?.steps || [];

  // Compute dynamic tab indices
  let tabIdx = 0;
  const TAB_SCORES    = tabIdx++;
  const TAB_COVERAGE  = hasAreas ? tabIdx++ : -1;
  const TAB_REPORT    = (hasSummary || hasRecs) ? tabIdx++ : -1;
  const TAB_SKILLS    = hasSkills ? tabIdx++ : -1;
  const TAB_PIPELINE  = hasSteps && pipelineSteps.length > 0 ? tabIdx++ : -1;

  return (
    <Box sx={{ pb: 5 }}>

      {/* ── Back button ── */}
      <Button startIcon={<ArrowBackOutlined sx={{ fontSize: 16 }} />} onClick={onBack}
        sx={{ textTransform: "none", fontWeight: 600, color: "#6B7280", fontSize: "0.82rem", borderRadius: "8px", px: 1.5, mb: 2.5, "&:hover": { bgcolor: "#F3F4F6", color: "#374151" } }}>
        Back to Interviews
      </Button>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <Card sx={{ mb: 3, overflow: "hidden" }}>
        {/* Top gradient stripe */}
        <Box sx={{ height: 6, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

        <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          {/* Avatar */}
          <Avatar sx={{ width: 72, height: 72, fontWeight: 800, fontSize: "1.6rem", background: `linear-gradient(135deg, ${g1}, ${g2})`, color: "#fff", flexShrink: 0 }}>
            {letter}
          </Avatar>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#111827", lineHeight: 1.2 }}>{name}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5, mb: 1.25 }}>
              <EmailOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>{email || "—"}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              <Chip label={title} size="small" icon={<WorkOutlined style={{ fontSize: 12 }} />}
                sx={{ bgcolor: TEAL_BG, color: TEAL, fontWeight: 600, fontSize: "0.72rem", height: 24, border: `1px solid ${TEAL_BORDER}`, "& .MuiChip-icon": { color: `${TEAL} !important` } }} />
              {jd?.location && (
                <Chip label={jd.location} size="small" icon={<LocationOnOutlined style={{ fontSize: 12 }} />}
                  sx={{ bgcolor: "#F3F4F6", color: "#374151", fontWeight: 600, fontSize: "0.72rem", height: 24 }} />
              )}
              <Chip label={fmtDate(assessment.createdAt)} size="small" icon={<CalendarTodayOutlined style={{ fontSize: 12 }} />}
                sx={{ bgcolor: "#F3F4F6", color: "#374151", fontWeight: 600, fontSize: "0.72rem", height: 24 }} />
            </Box>
          </Box>

          {/* Score + verdict */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0 }}>
            <ScoreRing value={overallScore} color={sc.color} size={96} />
            <Chip label={verdict} size="small"
              sx={{ bgcolor: verdictBg, color: verdictColor, fontWeight: 700, fontSize: "0.72rem", height: 22, px: 0.5, border: `1px solid ${verdictColor}30` }} />
          </Box>
        </Box>

        {/* Quick stat strip */}
        <Box sx={{ px: { xs: 2.5, md: 3.5 }, pb: 2.5, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {analytics?.duration !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <AccessTimeOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>Duration: <strong style={{ color: "#374151" }}>{fmtDuration(analytics.duration)}</strong></Typography>
            </Box>
          )}
          {analytics?.messageCount !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <ChatBubbleOutlineOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>Responses: <strong style={{ color: "#374151" }}>{analytics.messageCount}</strong></Typography>
            </Box>
          )}
          {jd?.employmentType && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <WorkOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>Employment: <strong style={{ color: "#374151" }}>{jd.employmentType}</strong></Typography>
            </Box>
          )}
        </Box>
      </Card>

      {/* ══ TABS ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>

        {/* Tab bar */}
        <Box sx={{ borderBottom: "1px solid #F3F4F6", px: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 46,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8rem", minHeight: 46, color: "#9CA3AF", px: 0, mr: 3 },
              "& .Mui-selected": { color: TEAL },
              "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
            }}>
            <Tab label="Scores" />
            {hasAreas && <Tab label="Coverage" />}
            {(hasSummary || hasRecs) && <Tab label="AI Report" />}
            {hasSkills && <Tab label="Skills" />}
            {TAB_PIPELINE !== -1 && <Tab label="Pipeline" />}
          </Tabs>
        </Box>

        {/* ── Tab 0: Scores ── */}
        {tab === TAB_SCORES && (
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            {/* Score rings */}
            <Box sx={{ display: "flex", gap: 4, mb: 3.5, justifyContent: "center", flexWrap: "wrap" }}>
              <ScoreRing value={overallScore} color={sc.color} size={100} label="Overall" />
              {analytics?.coveragePercentage !== undefined && (
                <ScoreRing value={analytics.coveragePercentage} color="#0891B2" size={100} label="Coverage" />
              )}
            </Box>

            <Divider sx={{ mb: 3, borderColor: "#F3F4F6" }} />

            {/* Session details */}
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5 }}>
              Session Details
            </Typography>
            <Box>
              {analytics?.duration !== undefined && (
                <InfoRow icon={<AccessTimeOutlined sx={{ fontSize: 16 }} />} label="Duration" value={fmtDuration(analytics.duration)} />
              )}
              {analytics?.messageCount !== undefined && (
                <InfoRow icon={<ChatBubbleOutlineOutlined sx={{ fontSize: 16 }} />} label="Responses" value={String(analytics.messageCount)} />
              )}
              {jd?.employmentType && (
                <InfoRow icon={<WorkOutlined sx={{ fontSize: 16 }} />} label="Employment Type" value={jd.employmentType} />
              )}
              {jd?.experienceLevel && (
                <InfoRow icon={<StarOutlineOutlined sx={{ fontSize: 16 }} />} label="Experience Level" value={jd.experienceLevel} />
              )}
            </Box>
          </Box>
        )}

        {/* ── Tab 1: Coverage ── */}
        {tab === TAB_COVERAGE && hasAreas && (
          <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {Object.entries(areas).map(([area, data]: [string, any]) => {
              const pct = data.percentage ?? 0;
              const ac  = scoreStyle(pct);
              return (
                <Box key={area}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                      {area.replace(/_/g, " ")}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: ac.color }}>{pct}%</Typography>
                      <Chip label={ac.label} size="small"
                        sx={{ height: 20, bgcolor: ac.bg, color: ac.color, fontWeight: 700, fontSize: "0.65rem", "& .MuiChip-label": { px: 1 } }} />
                    </Box>
                  </Box>
                  <Bar value={pct} color={ac.color} />
                  {data.indicators?.length > 0 && (
                    <Box sx={{ mt: 1.25, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {data.indicators.slice(0, 4).map((ind: any) => (
                        <Box key={ind.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, bgcolor: ind.covered ? "#10B981" : "#EF4444" }} />
                          <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>
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

        {/* ── Tab 2: AI Report ── */}
        {tab === TAB_REPORT && (hasSummary || hasRecs) && (
          <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Summary */}
            {hasSummary && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PersonOutlined sx={{ fontSize: 15, color: "#10B981" }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>AI Assessment Summary</Typography>
                </Box>
                <Box sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #D1FAE5" }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.8 }}>{summary}</Typography>
                </Box>
              </Box>
            )}

            {/* Recommendations */}
            {hasRecs && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LightbulbOutlined sx={{ fontSize: 15, color: "#F59E0B" }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>Recommendations</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {recommendations.map((rec: string, i: number) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.5, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                      <CheckCircleOutlined sx={{ color: "#F59E0B", fontSize: 16, mt: 0.15, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.82rem", color: "#92400E", lineHeight: 1.65, textTransform: "capitalize" }}>{rec}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ── Tab 3: Skills ── */}
        {tab === TAB_SKILLS && hasSkills && (
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            {requiredSkills.length > 0 && (
              <Box sx={{ mb: softSkills.length ? 3 : 0 }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", mb: 2 }}>
                  Technical Skills
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {requiredSkills.map((sk: any) => (
                    <Box key={sk._id}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{sk.name}</Typography>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#8B5CF6" }}>{sk.percentage ?? 0}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={sk.percentage ?? 0}
                        sx={{ height: 6, borderRadius: 3, bgcolor: "#8B5CF615", "& .MuiLinearProgress-bar": { bgcolor: "#8B5CF6", borderRadius: 3 } }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {softSkills.length > 0 && (
              <Box>
                {requiredSkills.length > 0 && <Divider sx={{ mb: 2.5, borderColor: "#F3F4F6" }} />}
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5 }}>
                  Soft Skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {softSkills.map((sk: any) => (
                    <Chip key={sk._id} label={sk.name} size="small"
                      sx={{ height: 26, bgcolor: "#F5F3FF", color: "#6D28D9", fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px", border: "1px solid #DDD6FE", "& .MuiChip-label": { px: 1.5 } }} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ── Pipeline tab ── */}
        {tab === TAB_PIPELINE && TAB_PIPELINE !== -1 && (
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            {/* Current step banner */}
            {stepsData?.currentStep && (
              <Box sx={{ mb: 3, p: 2, borderRadius: "12px", bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TEAL, flexShrink: 0 }} />
                <Box>
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: TEAL, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Step</Typography>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>{stepsData.currentStep.data?.label || stepsData.currentStep.id}</Typography>
                </Box>
              </Box>
            )}

            {/* Steps list */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {pipelineSteps.map((step: any, idx: number) => {
                const sd   = step.stepId;
                const type = sd?.data?.type || "unknown";
                const label = sd?.data?.label || sd?.id || `Step ${idx + 1}`;
                const cfg  = sd?.data?.config || {};
                const status: string = step.status || "pending";
                const passed: boolean | null = step.passed;
                const score: number | null = step.finalScore;

                // Status colors
                const sColor = status === "done" ? (passed === false ? "#EF4444" : passed === true ? "#10B981" : "#6B7280")
                             : status === "inProgress" ? "#D97706" : "#9CA3AF";
                const sBg    = status === "done" ? (passed === false ? "#FEF2F2" : passed === true ? "#F0FDF4" : "#F9FAFB")
                             : status === "inProgress" ? "#FFFBEB" : "#F9FAFB";
                const sLabel = status === "done" ? (passed === false ? "Failed" : passed === true ? "Passed" : "Done")
                             : status === "inProgress" ? "In Progress" : "Pending";

                // Icon per type
                const typeIcon = type === "email" ? <MailOutlineOutlined sx={{ fontSize: 15 }} />
                               : type === "condition" ? <CallSplitOutlined sx={{ fontSize: 15 }} />
                               : type === "hr" ? <PersonOutlined sx={{ fontSize: 15 }} />
                               : type === "technical" ? <PsychologyOutlined sx={{ fontSize: 15 }} />
                               : <RadioButtonCheckedOutlined sx={{ fontSize: 15 }} />;

                const typeColor = type === "email" ? "#0891B2"
                                : type === "condition" ? "#D97706"
                                : type === "technical" ? "#8B5CF6"
                                : type === "hr" ? TEAL : "#6B7280";

                return (
                  <Box key={sd?._id || idx} sx={{ display: "flex", gap: 2 }}>
                    {/* Timeline spine */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 32 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: `${typeColor}15`, border: `2px solid ${typeColor}40`, display: "flex", alignItems: "center", justifyContent: "center", color: typeColor, zIndex: 1 }}>
                        {typeIcon}
                      </Box>
                      {idx < pipelineSteps.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: "#E5E7EB", my: 0.5 }} />
                      )}
                    </Box>

                    {/* Step card */}
                    <Box sx={{ flex: 1, pb: idx < pipelineSteps.length - 1 ? 2.5 : 0 }}>
                      <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#FAFAFA", border: "1px solid #E5E7EB" }}>
                        {/* Header row */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip label={type.toUpperCase()} size="small"
                              sx={{ height: 18, bgcolor: `${typeColor}12`, color: typeColor, fontWeight: 700, fontSize: "0.6rem", "& .MuiChip-label": { px: 1 } }} />
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>{label}</Typography>
                          </Box>
                          <Chip label={sLabel} size="small"
                            sx={{ height: 20, bgcolor: sBg, color: sColor, fontWeight: 700, fontSize: "0.65rem", border: `1px solid ${sColor}30`, "& .MuiChip-label": { px: 1 } }} />
                        </Box>

                        {/* Score row for assessments */}
                        {score !== null && score !== undefined && type !== "email" && type !== "condition" && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                            <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 600 }}>Score</Typography>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress variant="determinate" value={Math.min(score, 100)}
                                sx={{ height: 5, borderRadius: 3, bgcolor: `${sColor}18`, "& .MuiLinearProgress-bar": { bgcolor: sColor, borderRadius: 3 } }} />
                            </Box>
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: sColor, minWidth: 36 }}>{score}%</Typography>
                          </Box>
                        )}

                        {/* Condition config */}
                        {type === "condition" && cfg.field && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>If</Typography>
                            <Chip label={cfg.field} size="small" sx={{ height: 18, bgcolor: "#F3F4F6", color: "#374151", fontSize: "0.65rem", fontWeight: 600, "& .MuiChip-label": { px: 1 } }} />
                            <Chip label={cfg.operator} size="small" sx={{ height: 18, bgcolor: "#FEF3C7", color: "#92400E", fontSize: "0.65rem", fontWeight: 700, "& .MuiChip-label": { px: 1 } }} />
                            <Chip label={String(cfg.value)} size="small" sx={{ height: 18, bgcolor: "#F3F4F6", color: "#374151", fontSize: "0.65rem", fontWeight: 600, "& .MuiChip-label": { px: 1 } }} />
                          </Box>
                        )}

                        {/* Email config */}
                        {type === "email" && (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            {cfg.subject && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 600, minWidth: 48 }}>Subject</Typography>
                                <Typography sx={{ fontSize: "0.75rem", color: "#374151", fontWeight: 500 }}>{cfg.subject}</Typography>
                              </Box>
                            )}
                            {cfg.sendTo && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 600, minWidth: 48 }}>Send To</Typography>
                                <Chip label={cfg.sendTo} size="small" sx={{ height: 18, bgcolor: "#EFF6FF", color: "#1D4ED8", fontSize: "0.65rem", fontWeight: 600, "& .MuiChip-label": { px: 1 } }} />
                              </Box>
                            )}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 600, minWidth: 48 }}>Status</Typography>
                              <Chip label={status === "done" ? "Sent" : status === "inProgress" ? "Pending Send" : "Queued"} size="small"
                                sx={{ height: 18, bgcolor: status === "done" ? "#F0FDF4" : "#FFFBEB", color: status === "done" ? "#10B981" : "#D97706", fontSize: "0.65rem", fontWeight: 700, "& .MuiChip-label": { px: 1 } }} />
                            </Box>
                          </Box>
                        )}

                        {/* Meta row */}
                        <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
                          {step.attempts > 0 && (
                            <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                              Attempts: <strong style={{ color: "#6B7280" }}>{step.attempts}</strong>
                            </Typography>
                          )}
                          {step.completedAt && (
                            <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                              Completed: <strong style={{ color: "#6B7280" }}>{fmtDate(step.completedAt)}</strong>
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

      </Box>
    </Box>
  );
};

export default InterviewDetail;
