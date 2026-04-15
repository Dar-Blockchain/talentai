import React, { memo, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Avatar, Chip, Skeleton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchCompanyInterviews, selectCompanyInterviews, selectCompanyInterviewsLoading } from "@/store/slices/interviewSlice";
import { fetchMyPosts, selectMyPosts, selectMyPostsLoading } from "@/store/slices/postSlice";
import { fetchDashboardStats, selectDashboardStats, selectDashboardStatsLoading, fetchRichStats, selectRichStats, selectRichStatsLoading } from "@/store/slices/companySlice";
import { fetchCompanyApplicationMetrics, fetchCompanyApplications, selectApplicationMetrics, selectApplicationMetricsLoading, selectAllApplications, selectApplicationsLoading } from "@/store/slices/jobApplicationSlice";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, Cell,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────
const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

const STAT_CONFIG = [
  // { key: "totalEmployees",   label: "Team Members",       icon: PeopleOutlined,           color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "avgInterviewScore", label: "Avg. Interview Score", icon: PsychologyOutlined, color: "#3B82F6", bg: "#EFF6FF", suffix: "%", emptyText: "No interviews yet", emptyHref: "/company/posts/create" },
  { key: "activeJobPosts",    label: "Active Job Posts",    icon: WorkOutlined,        color: TEAL,      bg: TEAL_BG,   emptyText: "No posts yet",       emptyHref: "/company/posts/create" },
  // { key: "activeCampaigns",  label: "Active Campaigns",   icon: TrendingUpOutlined,        color: "#F59E0B", bg: "#FFFBEB" },
];

const VERDICT_STYLE: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  Excellent:    { bg: "#F0FDFA", color: "#0D9488", icon: CheckCircleOutlined },
  Good:         { bg: "#EFF6FF", color: "#2563EB", icon: CheckCircleOutlined },
  "Needs Work": { bg: "#FEF2F2", color: "#DC2626", icon: CancelOutlined },
  Pending:      { bg: "#FFFBEB", color: "#D97706", icon: HourglassEmptyOutlined },
};

const BAR_COLORS = ["#EF4444", "#F59E0B", "#3B82F6", TEAL, "#10B981"];
const AVATAR_COLORS = [TEAL, "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];
const SKELETON_ROWS = [0, 1, 2, 3, 4];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (iso?: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};

const getVerdict = (score: number) =>
  score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

const fmtDay = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; sx?: object; [key: string]: any }> = ({ children, sx, ...rest }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", ...sx }} {...rest}>
    {children}
  </Box>
);

const CardHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 3, pb: 2.5, borderBottom: "1px solid #F3F4F6" }}>
    <Box>
      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.2 }}>{subtitle}</Typography>}
    </Box>
    {action}
  </Box>
);

const ViewAll: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Typography onClick={onClick} sx={{ fontSize: "0.72rem", fontWeight: 600, color: TEAL, cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3, "&:hover": { textDecoration: "underline" } }}>
    View all <ChevronRightOutlined sx={{ fontSize: 14 }} />
  </Typography>
);

const ScoreTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: "#fff", p: 1.5, border: "1px solid #E5E7EB", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }}>
      <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.75rem", mb: 0.5 }}>{label}</Typography>
      {payload.map((p: any) => (
        <Typography key={p.dataKey} sx={{ color: "#6B7280", fontSize: "0.72rem" }}>
          {p.name}: <strong style={{ color: p.color }}>{p.value}{p.dataKey === "avgScore" ? "%" : ""}</strong>
        </Typography>
      ))}
    </Box>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const DashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();

  const rawInterviews   = useSelector(selectCompanyInterviews);
  const interviewsLoading = useSelector(selectCompanyInterviewsLoading);
  const rawPosts        = useSelector(selectMyPosts);
  const postsLoading    = useSelector(selectMyPostsLoading);
  const dashboardStats  = useSelector(selectDashboardStats);
  const statsLoading    = useSelector(selectDashboardStatsLoading);
  const richStats       = useSelector(selectRichStats);
  const richLoading     = useSelector(selectRichStatsLoading);
  const appMetrics        = useSelector(selectApplicationMetrics);
  const appMetricsLoading = useSelector(selectApplicationMetricsLoading);
  const allApplications   = useSelector(selectAllApplications);
  const appsLoading       = useSelector(selectApplicationsLoading);

  useEffect(() => {
    dispatch(fetchCompanyInterviews({ limit: 5 }));
    dispatch(fetchMyPosts({ limit: 5 }));
    dispatch(fetchDashboardStats());
    dispatch(fetchRichStats());
    dispatch(fetchCompanyApplicationMetrics());
    dispatch(fetchCompanyApplications({}));
  }, [dispatch]);

  const recentInterviews = useMemo(() =>
    rawInterviews.slice(0, 5).map((iv: any) => {
      const score = Math.round(iv.interviewData?.finalReport?.scores?.overall ?? iv.interviewData?.finalReport?.coverage?.overall ?? iv.score ?? 0);
      const name = iv.candidate?.username ||
        (iv.candidate?.firstName ? `${iv.candidate.firstName} ${iv.candidate.lastName ?? ""}`.trim() : "Candidate");
      return { id: iv._id as string, name, job: iv.post?.jobDetails?.title || "—", score, verdict: getVerdict(score), avatar: getInitials(name), time: fmtTime(iv.createdAt) };
    }),
    [rawInterviews]);

  const recentPosts = useMemo(() => rawPosts.slice(0, 5), [rawPosts]);

  // Applications over time — last 30 days
  const appTrendData = useMemo(() => {
    const map = new Map<string, number>();
    allApplications.forEach((app: any) => {
      const key = new Date(app.createdAt).toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + 1);
    });
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      days.push({ label: i % 5 === 0 ? fmtDay(key) : "", count: map.get(key) || 0 });
    }
    return days;
  }, [allApplications]);

  // Applications per job post — top 6
  const appPerJobData = useMemo(() => {
    const map = new Map<string, number>();
    allApplications.forEach((app: any) => {
      const title = app.post?.jobDetails?.title || app.jobPost?.jobDetails?.title || "Unknown";
      map.set(title, (map.get(title) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([title, count]) => ({ title: title.length > 18 ? title.slice(0, 18) + "…" : title, count }));
  }, [allApplications]);

  // Build 30-day trend — fill missing days with 0
  const trendData = useMemo(() => {
    if (!richStats?.trend?.length) return [];
    const map = new Map(richStats.trend.map((d) => [d._id, d]));
    const days: { day: string; label: string; count: number; avgScore: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const entry = map.get(key);
      days.push({ day: key, label: fmtDay(key), count: entry?.count || 0, avgScore: Math.round(entry?.avgScore || 0) });
    }
    // Show only every 5th label to avoid clutter
    return days.map((d, i) => ({ ...d, label: i % 5 === 0 ? d.label : "" }));
  }, [richStats]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ══ Row 1: Stat Cards ════════════════════════════════════════════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2.5 }}>
        {STAT_CONFIG.map((stat, idx) => {
          const raw = dashboardStats ? (dashboardStats as any)[stat.key] : null;
          const isEmpty = !statsLoading && raw == null;
          return (
            <motion.div key={stat.key} style={{ height: "100%" }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}>
              <Card sx={{ p: 3, height: "100%", boxSizing: "border-box", "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }, transition: "box-shadow 0.2s" }} data-tour={`stat-${stat.key === "activeJobPosts" ? "jobs" : ""}`}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <stat.icon sx={{ fontSize: 20, color: stat.color }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 24 }}>
                    {[3, 5, 4, 7, 5, 8, 6].map((h, i) => (
                      <Box key={i} sx={{ width: 3, borderRadius: "2px 2px 0 0", height: `${h * 12}%`, bgcolor: stat.color, opacity: isEmpty ? 0.08 : 0.2 + i * 0.1 }} />
                    ))}
                  </Box>
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={70} height={38} />
                ) : isEmpty ? (
                  <Box>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#9CA3AF" }}>{stat.emptyText}</Typography>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: "-0.5px" }}>{raw}{stat.suffix || ""}</Typography>
                )}
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#9CA3AF", mt: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</Typography>
              </Card>
            </motion.div>
          );
        })}

        {/* Total Applicants */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: STAT_CONFIG.length * 0.07 }}>
          <Card sx={{ p: 3, "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }, transition: "box-shadow 0.2s", cursor: "pointer" }} onClick={() => router.push("/company/applications")}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PeopleOutlined sx={{ fontSize: 20, color: "#8B5CF6" }} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 24 }}>
                {[3, 5, 4, 7, 5, 8, 6].map((h, i) => (
                  <Box key={i} sx={{ width: 3, borderRadius: "2px 2px 0 0", height: `${h * 12}%`, bgcolor: "#8B5CF6", opacity: 0.2 + i * 0.1 }} />
                ))}
              </Box>
            </Box>
            {appMetricsLoading ? (
              <Skeleton variant="text" width={70} height={38} />
            ) : appMetrics?.totalApplicants ? (
              <Typography sx={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: "-0.5px" }}>
                {appMetrics.totalApplicants}
              </Typography>
            ) : (
              <Box>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#9CA3AF" }}>No applicants yet</Typography>
                <Typography onClick={() => router.push("/company/posts/create")} sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#8B5CF6", cursor: "pointer", mt: 0.5, "&:hover": { textDecoration: "underline" } }}>
                  Post a job →
                </Typography>
              </Box>
            )}
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#9CA3AF", mt: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Applicants</Typography>
          </Card>
        </motion.div>
      </Box>

      {/* ══ Row 3: Interview Trend + Score Distribution ══════════════════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" }, gap: 2.5 }}>

        {/* Interview Trend — 30 days */}
        <Card data-tour="chart-trend">
          <CardHeader title="Interview Activity" subtitle="Interviews conducted over the last 30 days" />
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            {richLoading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "8px" }} />
            ) : trendData.length === 0 ? (
              <Box sx={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#6B7280" }}>No interviews conducted yet</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center", maxWidth: 260 }}>Interviews run automatically when candidates complete a campaign</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ScoreTooltip />} />
                  <Area type="monotone" dataKey="count" name="Interviews" stroke={TEAL} strokeWidth={2} fill="url(#tealGrad)" dot={false} activeDot={{ r: 4, fill: TEAL }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {/* Pass rate pill — only show when there's real data */}
            {!richLoading && richStats && richStats.totalInterviews > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5, pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TEAL }} />
                  <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>Total: <strong style={{ color: "#111827" }}>{richStats.totalInterviews}</strong></Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981" }} />
                  <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>Pass rate: <strong style={{ color: "#111827" }}>{richStats.passRate}%</strong></Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader title="Score Distribution" subtitle="Candidates grouped by interview score" />
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            {richLoading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "8px" }} />
            ) : !richStats?.scoreDistribution?.some((d: any) => d.count > 0) ? (
              <Box sx={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#6B7280" }}>No scores recorded yet</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", textAlign: "center", maxWidth: 200 }}>
                  Scores appear after candidates complete interviews
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={richStats.scoreDistribution} margin={{ left: -24, right: 4, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={true} vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ScoreTooltip />} />
                  <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {richStats.scoreDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={BAR_COLORS[i]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            {/* Legend — only show when there's real data */}
            {!richLoading && richStats?.scoreDistribution?.some((d: any) => d.count > 0) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5, pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
                {richStats.scoreDistribution.filter((d: any) => d.count > 0).map((d: any, i: number) => (
                  <Box key={d.range} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: BAR_COLORS[i] }} />
                    <Typography sx={{ fontSize: "0.68rem", color: "#6B7280" }}>{d.range}: <strong style={{ color: "#111827" }}>{d.count}</strong></Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* ══ Row 3: Top Jobs by Interviews + Recent Interviews ════════════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>

        {/* Top Jobs */}
        <Card data-tour="top-jobs">
          <CardHeader title="Top Job Posts" subtitle="By number of interviews conducted" action={<ViewAll onClick={() => router.push("/company/posts")} />} />
          <Box sx={{ px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            {richLoading ? (
              SKELETON_ROWS.slice(0, 4).map((i) => <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: "8px" }} />)
            ) : !richStats?.topJobs?.length ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#6B7280" }}>No interviews yet</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.4 }}>Interview data appears after candidates complete a campaign</Typography>
              </Box>
            ) : richStats.topJobs.map((job: any, i: number) => {
              const pct = richStats.totalInterviews > 0 ? Math.round((job.count / richStats.totalInterviews) * 100) : 0;
              return (
                <Box key={job._id || i}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{job.count} interviews</Typography>
                      <Chip label={job.avgScore != null ? `${job.avgScore}%` : "—"} size="small" sx={{ fontSize: "0.65rem", height: 18, fontWeight: 700, bgcolor: (job.avgScore ?? 0) >= 60 ? TEAL_BG : "#FEF2F2", color: (job.avgScore ?? 0) >= 60 ? TEAL : "#DC2626" }} />
                    </Box>
                  </Box>
                  <Box sx={{ height: 5, borderRadius: "3px", bgcolor: "#F3F4F6", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: "3px", bgcolor: TEAL, transition: "width 0.6s ease" }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>

        {/* Recent Interviews */}
        <Card>
          <CardHeader
            title="Recent Interviews"
            subtitle={interviewsLoading ? "Loading..." : recentInterviews.length > 0 ? `${recentInterviews.length} latest results` : "No results yet"}
            action={<ViewAll onClick={() => router.push("/company/applications")} />}
          />
          <Box sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {interviewsLoading ? (
              SKELETON_ROWS.map((i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "10px", border: "1px solid #F3F4F6" }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}><Skeleton variant="text" width="60%" height={14} /><Skeleton variant="text" width="40%" height={11} /></Box>
                  <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: "6px" }} />
                </Box>
              ))
            ) : recentInterviews.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#6B7280" }}>No interviews yet</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.4 }}>Interviews are generated automatically via campaigns</Typography>
              </Box>
            ) : recentInterviews.map((iv, i) => {
              const vs = VERDICT_STYLE[iv.verdict] ?? VERDICT_STYLE.Pending;
              const VIcon = vs.icon;
              return (
                <Box key={iv.id || i} onClick={() => iv.id && router.push(`/company/applications/${iv.id}`)}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "10px", border: "1px solid #F3F4F6", cursor: "pointer", "&:hover": { borderColor: TEAL_BORDER, bgcolor: TEAL_BG }, transition: "all 0.15s" }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                    {iv.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iv.name}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iv.job}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: "#111827" }}>{iv.score}%</Typography>
                    <Chip icon={<VIcon sx={{ fontSize: "11px !important" }} />} label={iv.verdict} size="small"
                      sx={{ fontSize: "0.65rem", height: 20, fontWeight: 600, bgcolor: vs.bg, color: vs.color, border: "none", "& .MuiChip-icon": { color: `${vs.color} !important` } }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>
      </Box>

      {/* ══ Application Charts ══════════════════════════════════════════════ */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>

        {/* Applications Over Time */}
        <Card>
          <CardHeader title="Applications Over Time" subtitle="Daily applications in the last 30 days" />
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            {appsLoading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "8px" }} />
            ) : appTrendData.every(d => d.count === 0) ? (
              <Box sx={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>No applications yet</Typography>
                <Typography onClick={() => router.push("/company/posts/create")} sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#8B5CF6", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Post a job to attract candidates →</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={appTrendData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ScoreTooltip />} />
                  <Area type="monotone" dataKey="count" name="Applications" stroke="#8B5CF6" strokeWidth={2} fill="url(#purpleGrad)" dot={false} activeDot={{ r: 4, fill: "#8B5CF6" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Card>

        {/* Applications per Job Post */}
        <Card>
          <CardHeader title="Applications per Job Post" subtitle="Top job posts by number of applicants" />
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            {appsLoading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "8px" }} />
            ) : appPerJobData.length === 0 ? (
              <Box sx={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>No applications yet</Typography>
                <Typography onClick={() => router.push("/company/posts/create")} sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#8B5CF6", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Post a job to attract candidates →</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={appPerJobData} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="title" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<ScoreTooltip />} />
                  <Bar dataKey="count" name="Applications" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {appPerJobData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Card>

      </Box>

      {/* ══ Row 4: Job Posts ═══════════════════════════════════════════════ */}
      <Card data-tour="job-posts">
        <CardHeader
          title="Job Posts"
          subtitle={postsLoading ? "Loading..." : recentPosts.length > 0 ? `${recentPosts.length} recent posts` : "No posts yet"}
          action={<ViewAll onClick={() => router.push("/company/posts")} />}
        />
        <Box sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {postsLoading ? (
            SKELETON_ROWS.map((i) => <Skeleton key={i} variant="rectangular" height={72} sx={{ borderRadius: "10px" }} />)
          ) : recentPosts.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>No job posts yet</Typography>
              <Typography onClick={() => router.push("/company/posts/create")} sx={{ fontSize: "0.75rem", fontWeight: 600, color: TEAL, cursor: "pointer", mt: 0.75, "&:hover": { textDecoration: "underline" } }}>Create your first post →</Typography>
            </Box>
          ) : recentPosts.map((post: any, i: number) => {
            const status = post.status || "draft";
            const isActive = status.toLowerCase() === "active";
            return (
              <Box key={post._id || i} onClick={() => post._id && router.push(`/company/posts/${post._id}`)}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.75, borderRadius: "10px", border: "1px solid #E5E7EB", cursor: "pointer", "&:hover": { borderColor: TEAL_BORDER, bgcolor: TEAL_BG }, transition: "all 0.15s" }}>
                <Box sx={{ width: 38, height: 38, borderRadius: "9px", bgcolor: isActive ? TEAL_BG : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <WorkOutlined sx={{ fontSize: 18, color: isActive ? TEAL : "#9CA3AF" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.jobDetails?.title || "—"}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.4 }}>
                    <Chip label={status.charAt(0).toUpperCase() + status.slice(1)} size="small"
                      sx={{ fontSize: "0.65rem", height: 18, fontWeight: 600, bgcolor: isActive ? TEAL_BG : "#F3F4F6", color: isActive ? TEAL : "#6B7280" }} />
                    {post.expirationDate && (
                      <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>Exp. {fmtDate(post.expirationDate)}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>


    </Box>
  );
};

export default memo(DashboardOverview);
