import React, { memo, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box, Typography, Avatar, Chip, Skeleton, LinearProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchEmployeePermissions,
  selectEmployeePermissions,
  selectFetchingPermissions,
} from "@/store/slices/memberSlice";
import {
  fetchCompanyInterviews,
  selectCompanyInterviews,
  selectCompanyInterviewsLoading,
} from "@/store/slices/interviewSlice";
import { Campaign } from "@/types/campaign";
import {
  CampaignOutlined,
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  ChevronRightOutlined,
  PsychologyOutlined,
  StarOutlined,
  AssignmentTurnedInOutlined,
  CalendarTodayOutlined,
  MailOutlined,
  TrendingUpOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { STATUS_COLORS, TYPE_LABELS } from "@/constants/campaign";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL   = "#0D9488";
const PURPLE = "#8B5CF6";
const BLUE   = "#3B82F6";
const AMBER  = "#F59E0B";
const GREEN  = "#10B981";
const ROSE   = "#F43F5E";

const AVATAR_COLORS = [TEAL, BLUE, PURPLE, AMBER, GREEN, ROSE];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const fmtTime = (iso?: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const scoreColor = (score: number) => {
  if (score >= 80) return GREEN;
  if (score >= 60) return TEAL;
  if (score >= 40) return AMBER;
  return ROSE;
};

// ─── Circular Score Gauge ─────────────────────────────────────────────────────

const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 96 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: size < 80 ? "16px" : "20px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{score}%</Typography>
        <Typography sx={{ fontSize: "9px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Score</Typography>
      </Box>
    </Box>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, sub, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }} style={{ height: "100%" }}>
    <Box sx={{
      bgcolor: "#fff", p: 2.5, borderRadius: 3, border: "1px solid #E5E7EB", height: "100%",
      "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
      transition: "all 0.2s",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${color}14` }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 24, width: 40 }}>
          {[4, 7, 5, 9, 6, 8, 7].map((h, i) => (
            <Box key={i} sx={{ flex: 1, borderRadius: "1px 1px 0 0", height: `${h * 10}%`, bgcolor: color, opacity: 0.2 }} />
          ))}
        </Box>
      </Box>
      <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", mt: 0.5, textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: "11px", color: color, fontWeight: 500, mt: 0.5 }}>{sub}</Typography>}
    </Box>
  </motion.div>
);

// ─── Section Shell ────────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}> = ({ title, subtitle, action, children }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", overflow: "hidden" }}>
    <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.2 }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
    <Box sx={{ px: 3, pb: 3 }}>{children}</Box>
  </Box>
);

const ViewAll: React.FC<{ color?: string; onClick: () => void }> = ({ color = TEAL, onClick }) => (
  <Typography onClick={onClick} sx={{ fontSize: "12px", fontWeight: 600, color, cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3, "&:hover": { textDecoration: "underline" } }}>
    View all <ChevronRightOutlined sx={{ fontSize: 14 }} />
  </Typography>
);

const EmptyRow: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ py: 5, textAlign: "center" }}>
    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{text}</Typography>
  </Box>
);

const RowSkeleton: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
    <Skeleton variant="circular" width={36} height={36} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={16} />
      <Skeleton variant="text" width="40%" height={12} />
    </Box>
    <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: 99 }} />
  </Box>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const EmployeeDashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();

  const userId   = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);

  const permissions        = useSelector(selectEmployeePermissions);
  const fetchingPermissions = useSelector(selectFetchingPermissions);

  const rawInterviews    = useSelector(selectCompanyInterviews);
  const interviewsLoading = useSelector(selectCompanyInterviewsLoading);
  const campaignsLoading = false;
  const rawCampaigns: Campaign[] = [
    { _id: "1", company: "c1", title: "Q1 Skills Mapping", type: "SKILLS_MAPPING",    status: "ACTIVE",  anonymityMode: "NOMINATIVE", module: { type: "SKILL_TEST",    config: { skill: "React", passingScore: 70 } }, accessMethod: "ACCOUNTS", createdBy: "u1", createdAt: "2025-03-01T09:00:00Z", updatedAt: "2025-03-01T09:00:00Z", deadline: "2025-04-30T00:00:00Z" },
    { _id: "2", company: "c1", title: "Leadership Enablement", type: "ENABLEMENT",    status: "ACTIVE",  anonymityMode: "ANONYMOUS",  module: { type: "AI_INTERVIEW", config: { agentPrompt: "Assess leadership skills", durationMinutes: 30 } }, accessMethod: "LINK", createdBy: "u1", createdAt: "2025-02-15T09:00:00Z", updatedAt: "2025-02-15T09:00:00Z", deadline: "2025-05-15T00:00:00Z" },
    { _id: "3", company: "c1", title: "Productivity Diagnostic H1", type: "PRODUCTIVITY_DIAGNOSTIC", status: "CLOSED", anonymityMode: "NOMINATIVE", module: { type: "QUESTIONNAIRE", config: { questions: [{ question: "Rate your productivity", type: "RATING" }] } }, accessMethod: "BOTH", createdBy: "u1", createdAt: "2025-01-10T09:00:00Z", updatedAt: "2025-02-28T09:00:00Z" },
    { _id: "4", company: "c1", title: "TypeScript Deep Dive",      type: "CUSTOM",    status: "CLOSED",  anonymityMode: "NOMINATIVE", module: { type: "SKILL_TEST",    config: { skill: "TypeScript", passingScore: 65 } }, accessMethod: "ACCOUNTS", createdBy: "u1", createdAt: "2024-12-01T09:00:00Z", updatedAt: "2025-01-31T09:00:00Z" },
    { _id: "5", company: "c1", title: "Team Collaboration Survey",  type: "CUSTOM",    status: "ACTIVE",  anonymityMode: "ANONYMOUS",  module: { type: "QUESTIONNAIRE", config: { questions: [{ question: "How collaborative is your team?", type: "TEXT" }] } }, accessMethod: "LINK", createdBy: "u1", createdAt: "2025-03-10T09:00:00Z", updatedAt: "2025-03-10T09:00:00Z", deadline: "2025-06-01T00:00:00Z" },
  ];

  // ── Fetch permissions then data ──────────────────────────────────────────
  useEffect(() => {
    if (userId) dispatch(fetchEmployeePermissions(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!permissions) return;
    if (permissions.canViewInterviewResults) dispatch(fetchCompanyInterviews({ limit: 20 }));
  }, [dispatch, permissions]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const skills: string[] = profile?.skills ?? [];

  const interviews = useMemo(() =>
    rawInterviews.map((iv: any) => {
      const score = Math.round(iv.interviewData?.finalReport?.coverage?.overall ?? iv.score ?? 0);
      const name  = iv.candidate?.username ||
        (iv.candidate?.firstName ? `${iv.candidate.firstName} ${iv.candidate.lastName ?? ""}`.trim() : "Candidate");
      return { id: iv._id as string, name, score, job: iv.post?.jobDetails?.title || "—", createdAt: iv.createdAt, status: iv.status };
    }),
    [rawInterviews]);

  const interviewsPassed   = useMemo(() => interviews.filter((iv) => iv.score >= 60), [interviews]);
  const upcomingInterviews = useMemo(() => interviews.slice(0, 4), [interviews]);
  const avgScore           = useMemo(() => {
    if (!interviews.length) return 0;
    return Math.round(interviews.reduce((s, iv) => s + iv.score, 0) / interviews.length);
  }, [interviews]);

  const activeCampaigns = useMemo(() =>
    rawCampaigns.filter((c: any) => c.status === "ACTIVE").slice(0, 5),
    [rawCampaigns]);

  const completedCampaigns = useMemo(() =>
    rawCampaigns.filter((c: any) => c.status === "CLOSED"),
    [rawCampaigns]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (fetchingPermissions) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2.5 }}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />)}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
        </Box>
      </Box>
    );
  }

  const fullName = `${user?.firstName || profile?.firstName || ""} ${user?.lastName || profile?.lastName || ""}`.trim() || user?.username || "there";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Box sx={{
          borderRadius: 3, overflow: "hidden", position: "relative",
          bgcolor: "#fff", border: "1px solid #E5E7EB",
          p: { xs: 3, md: 3.5 },
        }}>
          {/* subtle teal accent bar */}
          <Box sx={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", bgcolor: TEAL, borderRadius: "3px 0 0 3px" }} />

          {/* decorative blobs */}
          <Box sx={{ position: "absolute", top: -24, right: 40, width: 140, height: 140, borderRadius: "50%", bgcolor: "#F0FDFA", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: -30, right: -20, width: 100, height: 100, borderRadius: "50%", bgcolor: "#EFF6FF", pointerEvents: "none" }} />

          <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, mb: 0.4 }}>
                {greeting()},
              </Typography>
              <Typography sx={{ fontSize: { xs: "20px", md: "24px" }, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
                {fullName} 👋
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>
                Here's your workspace overview for today.
              </Typography>
            </Box>
            {avgScore > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: "#F0FDFA", border: "1px solid #99F6E4", borderRadius: 3, px: 2.5, py: 1.5 }}>
                <ScoreGauge score={avgScore} size={72} />
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>Performance</Typography>
                  <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.3 }}>Avg. interview score</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2.5 }}>
        <StatCard
          label="Campaigns Participated"
          value={rawCampaigns.length}
          icon={CampaignOutlined}
          color={PURPLE}
          sub={completedCampaigns.length > 0 ? `${completedCampaigns.length} completed` : undefined}
          delay={0.05}
        />
        <StatCard
          label="Skills"
          value={skills.length}
          icon={PsychologyOutlined}
          color={TEAL}
          sub={skills.length > 0 ? skills.slice(0, 2).join(", ") + (skills.length > 2 ? "…" : "") : undefined}
          delay={0.1}
        />
        <StatCard
          label="Interviews Passed"
          value={interviewsPassed.length}
          icon={WorkspacePremiumOutlined}
          color={GREEN}
          sub={interviews.length > 0 ? `of ${interviews.length} total` : undefined}
          delay={0.15}
        />
        <StatCard
          label="Tasks Completed"
          value={completedCampaigns.length}
          icon={AssignmentTurnedInOutlined}
          color={AMBER}
          sub={activeCampaigns.length > 0 ? `${activeCampaigns.length} in progress` : undefined}
          delay={0.2}
        />
      </Box>

      {/* ── Row 2: Upcoming Interviews + Campaign Invitations ──────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>

        {/* Upcoming Interviews */}
        <Section
          title="Upcoming Interviews"
          subtitle={interviewsLoading ? "Loading..." : `${upcomingInterviews.length} recent`}
          action={<ViewAll onClick={() => router.push("/employee/interviews")} />}
        >
          {interviewsLoading ? (
            [0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : upcomingInterviews.length === 0 ? (
            <EmptyRow text="No interviews scheduled" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {upcomingInterviews.map((iv, i) => (
                <Box
                  key={iv.id || i}
                  onClick={() => iv.id && router.push(`/company/interviews/${iv.id}`)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2,
                    border: "1px solid #F3F4F6", cursor: "pointer",
                    "&:hover": { bgcolor: "#F9FAFB", borderColor: "#E5E7EB" },
                    transition: "all 0.15s",
                  }}
                >
                  <Avatar sx={{ width: 36, height: 36, bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: 12, fontWeight: 700 }}>
                    {getInitials(iv.name)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {iv.job}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{fmtTime(iv.createdAt)}</Typography>
                  </Box>
                  {iv.score > 0 ? (
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontSize: "14px", fontWeight: 800, color: scoreColor(iv.score) }}>{iv.score}%</Typography>
                      <Box sx={{ width: 48, mt: 0.3 }}>
                        <LinearProgress
                          variant="determinate"
                          value={iv.score}
                          sx={{ height: 3, borderRadius: 2, bgcolor: "#F3F4F6", "& .MuiLinearProgress-bar": { bgcolor: scoreColor(iv.score) } }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Chip
                      icon={<HourglassEmptyOutlined sx={{ fontSize: "11px !important" }} />}
                      label="Pending"
                      size="small"
                      sx={{ fontSize: "10px", height: 20, bgcolor: "#FFFBEB", color: AMBER, fontWeight: 600, border: "none", "& .MuiChip-icon": { color: AMBER } }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Section>

        {/* Campaign Invitations */}
        <Section
          title="Campaign Invitations"
          subtitle={campaignsLoading ? "Loading..." : `${activeCampaigns.length} active`}
          action={<ViewAll color={PURPLE} onClick={() => router.push("/employee/campaigns")} />}
        >
          {campaignsLoading ? (
            [0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)
          ) : activeCampaigns.length === 0 ? (
            <EmptyRow text="No campaign invitations" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {activeCampaigns.map((campaign: any, i: number) => {
                const sc = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT;
                return (
                  <Box
                    key={campaign._id || i}
                    onClick={() => campaign._id && router.push(`/company/campaigns/${campaign._id}`)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2,
                      border: "1px solid #F3F4F6", cursor: "pointer",
                      "&:hover": { bgcolor: "#F9FAFB", borderColor: "#E5E7EB" },
                      transition: "all 0.15s",
                    }}
                  >
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CampaignOutlined sx={{ fontSize: 18, color: PURPLE }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {campaign.title}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>
                        {TYPE_LABELS[campaign.type as keyof typeof TYPE_LABELS] || campaign.type}
                        {campaign.deadline ? ` · Due ${fmtDate(campaign.deadline)}` : ""}
                      </Typography>
                    </Box>
                    <Chip
                      label="Active"
                      size="small"
                      sx={{ fontSize: "9px", height: 20, bgcolor: sc.bg, color: sc.fg, fontWeight: 700, letterSpacing: 0.3 }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Section>

      </Box>

      {/* ── Performance Score ──────────────────────────────────────────────── */}
      {interviews.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Performance Score</Typography>
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.2 }}>Based on {interviews.length} interview{interviews.length !== 1 ? "s" : ""}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: `${scoreColor(avgScore)}14`, borderRadius: 2, px: 2, py: 0.75 }}>
                <TrendingUpOutlined sx={{ fontSize: 16, color: scoreColor(avgScore) }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: scoreColor(avgScore) }}>{avgScore}% avg</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              {/* Big gauge */}
              <ScoreGauge score={avgScore} size={112} />

              {/* Score breakdown bars */}
              <Box sx={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "Passed (≥60%)", value: interviewsPassed.length, total: interviews.length, color: GREEN },
                  { label: "Excellent (≥80%)", value: interviews.filter(iv => iv.score >= 80).length, total: interviews.length, color: TEAL },
                  { label: "Need Improvement (<60%)", value: interviews.filter(iv => iv.score < 60).length, total: interviews.length, color: ROSE },
                ].map((row) => (
                  <Box key={row.label}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{row.label}</Typography>
                      <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 700 }}>{row.value}/{row.total}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={row.total > 0 ? (row.value / row.total) * 100 : 0}
                      sx={{ height: 6, borderRadius: 3, bgcolor: "#F3F4F6", "& .MuiLinearProgress-bar": { bgcolor: row.color, borderRadius: 3 } }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Recent scores list */}
              <Box sx={{ display: { xs: "none", xl: "flex" }, flexDirection: "column", gap: 1, minWidth: 200 }}>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5 }}>
                  Recent results
                </Typography>
                {interviews.slice(0, 4).map((iv, i) => (
                  <Box key={iv.id || i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: scoreColor(iv.score), flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {iv.job}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: scoreColor(iv.score) }}>{iv.score}%</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </motion.div>
      )}

    </Box>
  );
};

export default memo(EmployeeDashboardOverview);
