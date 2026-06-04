import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import {
  Box, Typography, Avatar, Chip, Divider, Skeleton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  LinearProgress, Tabs, Tab,
} from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlined from "@mui/icons-material/Cancel";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import axiosInstance from "@/utils/axiosInstance";
import { emitToast } from "@/utils/toastEmitter";

// ─── Constants ───────────────────────────────────────────────────────────────
const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";
const PURPLE      = "#8310FF";

const AVATAR_COLORS = [TEAL, "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  applied:              { bg: "#EFF6FF",  color: "#2563EB" },
  visited:              { bg: "#EFF6FF",  color: "#2563EB" },
  pending:              { bg: "#FFFBEB",  color: "#D97706" },
  shortlisted:          { bg: "#F0FDF4",  color: "#16A34A" },
  accepted:             { bg: TEAL_BG,    color: TEAL },
  rejected:             { bg: "#FEF2F2",  color: "#DC2626" },
  withdrawn:            { bg: "#F3F4F6",  color: "#6B7280" },
  interview_completed:  { bg: TEAL_BG,    color: TEAL },
};

const SCORE_COLORS = (s: number) =>
  s >= 70 ? "#059669" : s >= 50 ? "#D97706" : "#DC2626";

const SCORE_BG = (s: number) =>
  s >= 70 ? "#F0FDF4" : s >= 50 ? "#FFFBEB" : "#FEF2F2";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const getCvUrl = (app: any): string | null => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const base = raw.endsWith("/") ? raw : `${raw}/`;
  if (app.profile?.resume) return `${base}resume/${app.profile.resume}`;
  if (app.cvAnalysis?.sourceUrl) {
    const src = app.cvAnalysis.sourceUrl as string;
    return src.startsWith("http") ? src : `${base}${src.replace(/^public\//, "")}`;
  }
  return null;
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtDuration = (ms: number) => {
  if (!ms) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", ...sx }}>
    {children}
  </Box>
);

const SectionLabel: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    {icon}
    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {title}
    </Typography>
  </Box>
);

const ScoreRing: React.FC<{ value: number; size?: number }> = ({ value, size = 80 }) => {
  const color = SCORE_COLORS(value);
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(value, 100) / 100) * circ;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: size >= 88 ? "1.2rem" : "0.95rem", fontWeight: 900, color, lineHeight: 1 }}>
          {value}%
        </Typography>
      </Box>
    </Box>
  );
};

const BarRow: React.FC<{ label: string; score: number; maxScore: number; note: string }> = ({ label, score, maxScore, note }) => {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const color = SCORE_COLORS(pct);
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, alignItems: "center" }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{label}</Typography>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color, ml: 2, whiteSpace: "nowrap" }}>
          {score}/{maxScore}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={Math.min(pct, 100)}
        sx={{ height: 7, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
      <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.6, lineHeight: 1.5 }}>{note}</Typography>
    </Box>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────
const ApplicationDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteDone, setInviteDone] = useState(false);

  // Recruiter decision
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    if (!id) return;
    axiosInstance.get(`job-applications/${id}`)
      .then((res) => setApp(res.data?.data ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleInvite = async () => {
    if (!id || !inviteLink) return;
    setInviteSending(true);
    try {
      await axiosInstance.post(`job-applications/${id}/invite-to-interview`, { interviewLink: inviteLink });
      emitToast({ message: "Invitation sent successfully!", severity: "success" });
      setInviteDone(true);
      setTimeout(() => { setInviteOpen(false); setInviteDone(false); }, 1500);
    } catch {
      emitToast({ message: "Failed to send invitation. Please try again.", severity: "error" });
    } finally {
      setInviteSending(false);
    }
  };

  const handleDecision = async (decision: "shortlisted" | "rejected") => {
    if (!id) return;
    setDeciding(true);
    try {
      await axiosInstance.patch(`job-applications/${id}/recruiter-decision`, { decision });
      setApp((prev: any) => ({ ...prev, recruiterDecision: decision }));
      emitToast({ message: `Candidate ${decision === "shortlisted" ? "shortlisted" : "rejected"}.`, severity: "success" });
    } catch {
      emitToast({ message: "Failed to update decision.", severity: "error" });
    } finally {
      setDeciding(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Application" subtitle="" breadcrumbs={[
          { label: "Applications", href: "/company/applications" },
          { label: "..." },
        ]} />
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Skeleton variant="circular" width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="25%" height={16} sx={{ mt: 0.5 }} />
              <Skeleton variant="text" width="35%" height={14} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        </Card>
      </DashboardLayout>
    );
  }

  if (!app) {
    return (
      <DashboardLayout>
        <PageHeader title="Application" subtitle="" breadcrumbs={[
          { label: "Applications", href: "/company/applications" },
          { label: "Not found" },
        ]} />
        <Card sx={{ py: 10, textAlign: "center" }}>
          <Typography sx={{ color: "#9CA3AF" }}>Application not found.</Typography>
        </Card>
      </DashboardLayout>
    );
  }

  // ── Derived data ──
  const profile   = app.profile || {};
  const cv        = app.cvAnalysis || {};
  const interview = app.interviewAssessment || null;

  const name      = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || cv.name || "Candidate";
  const email     = (profile.userId as any)?.email || profile.contactInformation?.email || cv.email || "";
  const phone     = profile.phone || cv.phone || "";
  const location  = profile.contactInformation?.location || cv.location || "";
  const title     = cv.title || "";
  const summary   = cv.summary || "";
  const skills: string[]  = cv.skills || profile.skills?.map((s: any) => s.name) || [];
  const softSkills: any[] = cv.softSkills || profile.softSkills || [];
  const experience: any[] = cv.experience || [];
  const education: any[]  = cv.education || [];
  const certifications: string[] = cv.certifications || [];
  const projects: any[]   = cv.projects || [];

  const cvScore        = app.matchScore ?? cv.analysisScore ?? null;
  const matchReasoning = app.matchReasoning || "";
  const matchLabel     = app.matchRecommendation || "";
  const breakdown: any[] = app.matchBreakdown || [];

  const postTitle = app.post?.jobDetails?.title || "—";
  const status    = (app.status || "visited").toLowerCase();
  const sc        = STATUS_STYLE[status] ?? STATUS_STYLE.visited;
  const cvUrl     = getCvUrl(app);

  const interviewScore    = interview?.interviewData?.finalReport?.scores?.overall ?? null;
  const interviewAnalytics = interview?.interviewData?.analytics || {};
  const finalReport       = interview?.interviewData?.finalReport || {};
  const coverageAreas     = finalReport.coverage?.areas || {};
  const hasCoverage       = Object.keys(coverageAreas).length > 0;
  const hasReport         = !!(finalReport.summary || (finalReport.recommendations || []).length > 0);

  // Tab definitions: only show Interview tab when assessment exists
  const TABS = [
    { label: "Overview" },
    { label: "CV" },
    { label: "AI Match", show: cvScore != null },
    { label: "Interview", show: !!interview },
  ].filter((t) => t.show !== false);

  const tabLabel = (l: string) => TABS.findIndex((t) => t.label === l);

  return (
    <DashboardLayout>
      <PageHeader
        title=""
        subtitle=""
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Applications", href: "/company/applications" },
          { label: name },
        ]}
      />

      {/* ══ STICKY HEADER ══ */}
      <Card sx={{ mb: 2, overflow: "hidden" }}>
        {/* top accent stripe */}
        <Box sx={{ height: 5, background: `linear-gradient(90deg, ${TEAL}, ${PURPLE})` }} />

        <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
          {/* Avatar */}
          <Avatar sx={{ width: 60, height: 60, bgcolor: AVATAR_COLORS[0], fontSize: "18px", fontWeight: 700, flexShrink: 0 }}>
            {getInitials(name)}
          </Avatar>

          {/* Identity */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.4 }}>
              <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#111827" }}>{name}</Typography>
              <Chip
                label={status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                size="small"
                sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color }}
              />
              {app.recruiterDecision && (
                <Chip
                  label={app.recruiterDecision === "shortlisted" ? "Shortlisted" : "Rejected"}
                  size="small"
                  sx={{
                    height: 20, fontSize: "0.68rem", fontWeight: 700,
                    bgcolor: app.recruiterDecision === "shortlisted" ? "#F0FDF4" : "#FEF2F2",
                    color:   app.recruiterDecision === "shortlisted" ? "#16A34A" : "#DC2626",
                  }}
                />
              )}
            </Box>
            {title && <Typography sx={{ fontSize: "0.82rem", color: "#6B7280", mb: 0.6 }}>{title}</Typography>}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {email    && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><EmailOutlined    sx={{ fontSize: 13, color: "#9CA3AF" }} /><Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>{email}</Typography></Box>}
              {phone    && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><PhoneOutlined    sx={{ fontSize: 13, color: "#9CA3AF" }} /><Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>{phone}</Typography></Box>}
              {location && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><LocationOnOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} /><Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>{location}</Typography></Box>}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CalendarTodayOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Applied {fmtDate(app.appliedAt || app.createdAt)}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0, minWidth: 148 }}>
            {cvUrl && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadOutlined sx={{ fontSize: 15 }} />}
                onClick={() => window.open(cvUrl, "_blank")}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                  borderRadius: "10px", height: 34, color: "#374151",
                  borderColor: "#E5E7EB", bgcolor: "#fff",
                  "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" },
                  boxShadow: "none",
                }}
              >
                Download CV
              </Button>
            )}
            {app.status === "interview_completed" ? (
              <Box sx={{ borderRadius: "10px", bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, px: 1.5, py: 0.75, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: TEAL }}>✓ Interview Completed</Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<VideoCallOutlined sx={{ fontSize: 15 }} />}
                onClick={() => {
                  const postId = app.post?._id || "";
                  const companyId = app.company?._id || app.post?.user || "";
                  const ref = email ? encodeURIComponent(email) : "link";
                  const base = typeof window !== "undefined" ? window.location.origin : "";
                  setInviteLink(postId ? `${base}/candidate/interview?jobId=${postId}&companyId=${companyId}&ref=${ref}` : "");
                  setInviteOpen(true);
                }}
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                  borderRadius: "10px", height: 34, bgcolor: PURPLE, boxShadow: "none", color: "#fff",
                  "&:hover": { bgcolor: "#6d0ddb", boxShadow: "none" },
                }}
              >
                Invite to Interview
              </Button>
            )}
            {!app.recruiterDecision && (
              <Box sx={{ display: "flex", gap: 0.75 }}>
                <Button
                  size="small" variant="outlined" disabled={deciding}
                  onClick={() => handleDecision("shortlisted")}
                  startIcon={<CheckCircleOutlined sx={{ fontSize: 14 }} />}
                  sx={{
                    flex: 1, textTransform: "none", fontWeight: 600, fontSize: "0.72rem",
                    borderRadius: "8px", height: 30, color: "#16A34A",
                    borderColor: "#BBF7D0", bgcolor: "#F0FDF4",
                    "&:hover": { bgcolor: "#dcfce7", borderColor: "#86efac" },
                    boxShadow: "none",
                  }}
                >
                  Shortlist
                </Button>
                <Button
                  size="small" variant="outlined" disabled={deciding}
                  onClick={() => handleDecision("rejected")}
                  startIcon={<CancelOutlined sx={{ fontSize: 14 }} />}
                  sx={{
                    flex: 1, textTransform: "none", fontWeight: 600, fontSize: "0.72rem",
                    borderRadius: "8px", height: 30, color: "#DC2626",
                    borderColor: "#FECACA", bgcolor: "#FEF2F2",
                    "&:hover": { bgcolor: "#fee2e2", borderColor: "#fca5a5" },
                    boxShadow: "none",
                  }}
                >
                  Reject
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Tab bar */}
        <Box sx={{ borderTop: "1px solid #F3F4F6", px: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 44,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.8rem", minHeight: 44, color: "#9CA3AF", px: 0, mr: 3 },
              "& .Mui-selected": { color: TEAL },
              "& .MuiTabs-indicator": { bgcolor: TEAL, height: 2 },
            }}
          >
            {TABS.map((t) => <Tab key={t.label} label={t.label} />)}
          </Tabs>
        </Box>
      </Card>

      {/* ══ TAB CONTENT ══ */}

      {/* ── Overview ── */}
      {tab === tabLabel("Overview") && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Score summary row */}
          {(cvScore != null || interviewScore != null) && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<TrendingUpOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Scores" />
              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {cvScore != null && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ScoreRing value={cvScore} size={72} />
                    <Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>CV Match Score</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mt: 0.25 }}>
                        {matchLabel || (cvScore >= 70 ? "Strong Candidate" : cvScore >= 50 ? "Moderate Fit" : "Weak Match")}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {interviewScore != null && (
                  <>
                    {cvScore != null && <Divider orientation="vertical" flexItem sx={{ borderColor: "#F3F4F6" }} />}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ScoreRing value={interviewScore} size={72} />
                      <Box>
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Interview Score</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mt: 0.25 }}>
                          {interviewScore >= 70 ? "Passed" : interviewScore >= 50 ? "In Review" : "Needs Work"}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
              {matchReasoning && (
                <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", mt: 2, lineHeight: 1.7, p: 2, bgcolor: "#FAFAFA", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
                  {matchReasoning}
                </Typography>
              )}
            </Card>
          )}

          {summary && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<PersonOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Professional Summary" />
              <Typography sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8 }}>{summary}</Typography>
            </Card>
          )}

          {skills.length > 0 && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<CodeOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Technical Skills" />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {skills.map((s: string) => (
                  <Chip key={s} label={s} size="small"
                    sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#374151", borderRadius: "7px" }} />
                ))}
              </Box>
            </Card>
          )}
        </Box>
      )}

      {/* ── CV ── */}
      {tab === tabLabel("CV") && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* CV preview / download */}
          {cvUrl ? (
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <SectionLabel icon={<DescriptionOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Resume" />
                <Button
                  size="small" variant="outlined"
                  startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
                  onClick={() => window.open(cvUrl, "_blank")}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "0.75rem",
                    borderRadius: "8px", height: 30, color: "#374151",
                    borderColor: "#E5E7EB", boxShadow: "none",
                    "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" },
                  }}
                >
                  Open PDF
                </Button>
              </Box>
              <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                <iframe
                  src={`${cvUrl}#toolbar=0`}
                  width="100%"
                  height="640"
                  style={{ display: "block", border: "none" }}
                  title="CV Preview"
                />
              </Box>
            </Card>
          ) : (
            <Card sx={{ p: 3, textAlign: "center", color: "#9CA3AF" }}>
              <DescriptionOutlined sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
              <Typography sx={{ fontSize: "0.85rem" }}>No CV uploaded for this candidate.</Typography>
            </Card>
          )}

          {experience.length > 0 && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<WorkOutlineOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Experience" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {experience.map((exp: any, j: number) => (
                  <Box key={j}>
                    {j > 0 && <Divider sx={{ mb: 2 }} />}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{exp.title || exp.role || exp.position || "—"}</Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "#6B7280" }}>{exp.company}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                        {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : " – Present"}
                        {exp.duration ? ` (${exp.duration})` : ""}
                      </Typography>
                    </Box>
                    {exp.description && (
                      <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", mt: 0.75, lineHeight: 1.65 }}>{exp.description}</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Card>
          )}

          {education.length > 0 && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<SchoolOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Education" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {education.map((edu: any, j: number) => (
                  <Box key={j}>
                    {j > 0 && <Divider sx={{ mb: 1.5 }} />}
                    <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{edu.degree}</Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "#6B7280" }}>{edu.institution}{edu.field ? ` · ${edu.field}` : ""}</Typography>
                      </Box>
                      {edu.year && <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{edu.year}</Typography>}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          )}

          {certifications.length > 0 && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<StarOutlineOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Certifications" />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {certifications.map((c: string) => (
                  <Chip key={c} label={c} size="small"
                    sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500, bgcolor: "#EFF6FF", color: "#2563EB", borderRadius: "7px", border: "1px solid #BFDBFE" }} />
                ))}
              </Box>
            </Card>
          )}

          {projects.length > 0 && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<CodeOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Projects" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {projects.map((proj: any, j: number) => (
                  <Box key={j}>
                    {j > 0 && <Divider sx={{ mb: 2 }} />}
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", mb: 0.5 }}>{proj.name}</Typography>
                    {proj.description && <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", lineHeight: 1.65, mb: 0.75 }}>{proj.description}</Typography>}
                    {proj.technologies?.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {proj.technologies.map((t: string) => (
                          <Chip key={t} label={t} size="small"
                            sx={{ height: 20, fontSize: "0.7rem", bgcolor: "#F5F3FF", color: "#6D28D9", borderRadius: "6px", border: "1px solid #DDD6FE" }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Card>
          )}

          {softSkills.length > 0 && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<PersonOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Soft Skills" />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {softSkills.map((s: any) => (
                  <Chip
                    key={s.name || s}
                    label={s.name || s}
                    size="small"
                    sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500, bgcolor: "#F0FDFA", color: TEAL, borderRadius: "7px", border: `1px solid ${TEAL_BORDER}` }}
                  />
                ))}
              </Box>
            </Card>
          )}
        </Box>
      )}

      {/* ── AI Match ── */}
      {tab === tabLabel("AI Match") && cvScore != null && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Overall score hero */}
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
              <ScoreRing value={cvScore} size={96} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: SCORE_COLORS(cvScore), mb: 0.4 }}>
                  {matchLabel || (cvScore >= 70 ? "Strong Candidate" : cvScore >= 50 ? "Moderate Fit" : "Weak Match")}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.7 }}>
                  {matchReasoning || (cvScore >= 70
                    ? "This candidate's profile aligns well with the job requirements."
                    : cvScore >= 50
                    ? "This candidate partially meets the role's requirements."
                    : "This candidate's profile has limited alignment with the job requirements.")}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Breakdown bars */}
          {breakdown.length > 0 && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<TrendingUpOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Score Breakdown" />
              {breakdown.map((c: any) => (
                <BarRow key={c.key} label={c.label} score={c.score} maxScore={c.maxScore} note={c.note} />
              ))}
              <Box sx={{ pt: 1.5, mt: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Total</Typography>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 900, color: SCORE_COLORS(cvScore) }}>
                  {breakdown.reduce((a: number, c: any) => a + c.score, 0)} / {breakdown.reduce((a: number, c: any) => a + c.maxScore, 0)}
                </Typography>
              </Box>
            </Card>
          )}

          {/* Required skills match */}
          {app.post?.skillAnalysis?.requiredSkills?.length > 0 && skills.length > 0 && (() => {
            const required: string[] = app.post.skillAnalysis.requiredSkills.map((s: any) => s.name?.toLowerCase());
            const candidateNorm: string[] = skills.map((s: string) => s.toLowerCase());
            const matched = required.filter((r: string) => candidateNorm.some((c) => c.includes(r) || r.includes(c)));
            const missing = required.filter((r: string) => !matched.includes(r));
            return (
              <Card sx={{ p: 3 }}>
                <SectionLabel icon={<CodeOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Skills Match" />
                {matched.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.75 }}>
                      Matched ({matched.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                      {matched.map((s: string) => (
                        <Chip key={s} label={s} size="small"
                          sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600, bgcolor: "#F0FDF4", color: "#16A34A", borderRadius: "6px", border: "1px solid #BBF7D0" }} />
                      ))}
                    </Box>
                  </Box>
                )}
                {missing.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.75 }}>
                      Missing ({missing.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                      {missing.map((s: string) => (
                        <Chip key={s} label={s} size="small"
                          sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600, bgcolor: "#FEF2F2", color: "#DC2626", borderRadius: "6px", border: "1px solid #FECACA" }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>
            );
          })()}
        </Box>
      )}

      {/* ── Interview ── */}
      {tab === tabLabel("Interview") && interview && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Interview score hero */}
          {interviewScore != null && (
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                <ScoreRing value={interviewScore} size={96} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: SCORE_COLORS(interviewScore), mb: 0.4 }}>
                    {interviewScore >= 70 ? "Passed" : interviewScore >= 50 ? "In Review" : "Needs Work"}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                    {interviewAnalytics.duration !== undefined && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <AccessTimeOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                          Duration: <strong style={{ color: "#374151" }}>{fmtDuration(interviewAnalytics.duration)}</strong>
                        </Typography>
                      </Box>
                    )}
                    {interviewAnalytics.messageCount !== undefined && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <ChatBubbleOutlineOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                          Responses: <strong style={{ color: "#374151" }}>{interviewAnalytics.messageCount}</strong>
                        </Typography>
                      </Box>
                    )}
                    {interviewAnalytics.coveragePercentage !== undefined && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <TrendingUpOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>
                          Coverage: <strong style={{ color: "#374151" }}>{interviewAnalytics.coveragePercentage}%</strong>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Card>
          )}

          {/* Coverage areas */}
          {hasCoverage && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<TrendingUpOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Topic Coverage" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {Object.entries(coverageAreas).map(([area, data]: [string, any]) => {
                  const pct = data.percentage ?? 0;
                  const color = SCORE_COLORS(pct);
                  return (
                    <Box key={area}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                          {area.replace(/_/g, " ")}
                        </Typography>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color, ml: 2 }}>{pct}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min(pct, 100)}
                        sx={{ height: 7, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
                      {data.indicators?.length > 0 && (
                        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.4 }}>
                          {data.indicators.slice(0, 4).map((ind: any) => (
                            <Box key={ind.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, bgcolor: ind.covered ? "#10B981" : "#EF4444" }} />
                              <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>{ind.evidence?.[0] || ind.name}</Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Card>
          )}

          {/* AI Report */}
          {hasReport && (
            <Card sx={{ p: 3 }}>
              <SectionLabel icon={<LightbulbOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="AI Report" />
              {finalReport.summary && (
                <Box sx={{ p: 2.5, borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #D1FAE5", mb: 2 }}>
                  <Typography sx={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.8 }}>{finalReport.summary}</Typography>
                </Box>
              )}
              {(finalReport.recommendations || []).length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {finalReport.recommendations.map((rec: string, i: number) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.5, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                      <CheckCircleOutlined sx={{ color: "#F59E0B", fontSize: 16, mt: 0.15, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.82rem", color: "#92400E", lineHeight: 1.65, textTransform: "capitalize" }}>{rec}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          )}
        </Box>
      )}

      {/* ── Invite to Interview Modal ── */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 0.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VideoCallOutlined sx={{ color: PURPLE, fontSize: 22 }} />
            Invite to Interview
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: "12px !important" }}>
          {inviteDone ? (
            <Typography sx={{ fontSize: "0.88rem", color: "#059669", fontWeight: 600, textAlign: "center", py: 1 }}>
              ✓ Invitation sent successfully!
            </Typography>
          ) : (
            <Typography sx={{ fontSize: "0.88rem", color: "#4B5563", lineHeight: 1.7 }}>
              Send an interview invitation to <strong>{name}</strong> for the <strong>{postTitle}</strong> position?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ textTransform: "none", color: "#6B7280", borderRadius: "10px" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={inviteSending || !inviteLink || inviteDone}
            sx={{
              textTransform: "none", fontWeight: 600, borderRadius: "10px",
              bgcolor: PURPLE, boxShadow: "none", color: "#fff",
              "&:hover": { bgcolor: "#6d0ddb", boxShadow: "none" },
              "&.Mui-disabled": { bgcolor: "rgba(131,16,255,0.4)", color: "#fff" },
            }}
          >
            {inviteSending ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApplicationDetailPage;
