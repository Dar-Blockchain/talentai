import React, { memo, useCallback, useEffect } from "react";
import { Box, Typography, Avatar, Button, Chip, LinearProgress, Skeleton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchCompanyInterviews,
  selectCompanyInterviews,
  selectCompanyInterviewsLoading,
} from "@/store/slices/interviewSlice";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const TEAL = "#0D9488";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Employees",
    value: "247",
    change: "+12 this month",
    trend: "up",
    icon: PeopleOutlined,
    color: "#0D9488",
  },
  {
    label: "Avg. Interview Score",
    value: "74%",
    change: "+5% vs last quarter",
    trend: "up",
    icon: PsychologyOutlined,
    color: "#3B82F6",
  },
  {
    label: "Active Job Posts",
    value: "18",
    change: "4 closing soon",
    trend: "neutral",
    icon: WorkOutlined,
    color: "#F59E0B",
  },
  {
    label: "Active Campaigns",
    value: "6",
    change: "3 in progress",
    trend: "up",
    icon: AssignmentTurnedInOutlined,
    color: "#8B5CF6",
  },
];


const ACTIVE_POSTS = [
  { title: "Senior React Developer",  applicants: 34, status: "Active",  deadline: "Mar 15, 2026", skills: ["React", "TypeScript"] },
  { title: "DevOps Engineer",         applicants: 21, status: "Active",  deadline: "Mar 20, 2026", skills: ["Docker", "AWS"] },
  { title: "Product Manager",         applicants: 58, status: "Active",  deadline: "Mar 10, 2026", skills: ["Strategy", "Roadmap"] },
  { title: "Backend Engineer",        applicants: 12, status: "Draft",   deadline: "—",             skills: ["Node.js", "MongoDB"] },
];

const ACTIVE_CAMPAIGNS = [
  { title: "Q1 Leadership Eval",       type: "ASSESSMENT",  modules: 4, progress: 72, status: "ACTIVE",  deadline: "Mar 30, 2026" },
  { title: "Engineering Skills Mapping", type: "SKILLS",    modules: 6, progress: 45, status: "ACTIVE",  deadline: "Apr 5, 2026" },
  { title: "Onboarding Enablement",    type: "ENABLEMENT",  modules: 3, progress: 90, status: "ACTIVE",  deadline: "Mar 12, 2026" },
  { title: "Sales Productivity Check", type: "DIAGNOSTIC",  modules: 5, progress: 20, status: "ACTIVE",  deadline: "Apr 20, 2026" },
];

const GAP_DATA = [
  { name: "React.js",       current: 85, required: 90 },
  { name: "Python",         current: 72, required: 85, alert: true },
  { name: "System Design",  current: 45, required: 80, critical: true },
  { name: "AWS",            current: 68, required: 75 },
  { name: "TypeScript",     current: 78, required: 85 },
  { name: "Docker",         current: 55, required: 70, alert: true },
  { name: "Leadership",     current: 62, required: 80, critical: true },
  { name: "Communication",  current: 88, required: 85, success: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VERDICT_STYLE: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  Excellent:  { bg: "#F0FDFA", color: "#0D9488", icon: CheckCircleOutlined },
  Good:       { bg: "#EFF6FF", color: "#2563EB", icon: CheckCircleOutlined },
  "Needs Work": { bg: "#FEF2F2", color: "#DC2626", icon: CancelOutlined },
  Pending:    { bg: "#FFFBEB", color: "#D97706", icon: HourglassEmptyOutlined },
};

const CAMPAIGN_TYPE_COLOR: Record<string, { bg: string; fg: string }> = {
  ASSESSMENT: { bg: "#F0FDFA", fg: "#0D9488" },
  SKILLS:     { bg: "#EFF6FF", fg: "#2563EB" },
  ENABLEMENT: { bg: "#F5F3FF", fg: "#7C3AED" },
  DIAGNOSTIC: { bg: "#FFF7ED", fg: "#C2410C" },
};

const AVATAR_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB" }}>
    {children}
  </Box>
);

const SectionTitle: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
    <Box>
      <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{title}</Typography>
      {subtitle && <Typography sx={{ fontSize: "12px", color: "#6B7280", mt: 0.3 }}>{subtitle}</Typography>}
    </Box>
    {action}
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (iso?: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const getVerdict = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Needs Work";
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const DashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rawInterviews = useSelector(selectCompanyInterviews);
  const interviewsLoading = useSelector(selectCompanyInterviewsLoading);

  useEffect(() => {
    dispatch(fetchCompanyInterviews({ limit: 5 }));
  }, [dispatch]);

  const recentInterviews = rawInterviews.slice(0, 5).map((iv: any) => {
    const score = Math.round(
      iv.interviewData?.finalReport?.coverage?.overall ?? iv.score ?? 0
    );
    const candidateName =
      iv.candidate?.username ||
      (iv.candidate?.firstName
        ? `${iv.candidate?.firstName || ""} ${iv.candidate?.lastName || ""}`.trim()
        : "Candidate");
    const jobTitle = iv.post?.jobDetails?.title || iv.post?.title || "—";
    const verdict = getVerdict(score);
    const time = fmtTime(iv.createdAt);
    return { name: candidateName, job: jobTitle, score, verdict, avatar: getInitials(candidateName), time };
  });

  const renderTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <Box sx={{ bgcolor: "#fff", p: 1.5, border: "1px solid #E5E7EB", borderRadius: 2, boxShadow: 2, fontSize: "11px" }}>
          <Typography sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>{payload[0].payload.name}</Typography>
          <Typography sx={{ color: "#6B7280" }}>Current: <strong style={{ color: TEAL }}>{payload[0].value}%</strong></Typography>
          <Typography sx={{ color: "#6B7280" }}>Required: <strong>{payload[1]?.value}%</strong></Typography>
        </Box>
      );
    }
    return null;
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Row 1: Stat Cards ─────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        {STATS.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
            <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${stat.color}15` }}>
                  <stat.icon sx={{ fontSize: 22, color: stat.color }} />
                </Box>
                {/* Mini sparkline */}
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.3, height: 28, width: 52 }}>
                  {[4, 6, 3, 7, 5, 8, 6].map((h, i) => (
                    <Box key={i} sx={{ flex: 1, borderRadius: "1px 1px 0 0", height: `${h * 10}%`, bgcolor: stat.color, opacity: 0.25 }} />
                  ))}
                </Box>
              </Box>
              <Typography sx={{ fontSize: "26px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", mt: 0.5, textTransform: "uppercase", letterSpacing: 0.8 }}>{stat.label}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5 }}>
                {stat.trend === "up"   && <TrendingUpOutlined sx={{ fontSize: 15, color: "#10B981" }} />}
                {stat.trend === "down" && <TrendingDownOutlined sx={{ fontSize: 15, color: "#EF4444" }} />}
                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: stat.trend === "up" ? "#10B981" : stat.trend === "down" ? "#EF4444" : "#6B7280" }}>
                  {stat.change}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* ── Row 2: Skills Gap + Recent Interviews ─────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "6fr 5fr" }, gap: 3 }}>

        {/* Skills Gap Chart */}
        <SectionBox>
          <SectionTitle
            title="Skills Gap Analysis"
            subtitle="Current vs. required proficiency levels"
            action={
              <Button startIcon={<FilterListOutlined />} size="small" sx={{ textTransform: "none", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 2, fontSize: "12px" }}>
                All Depts
              </Button>
            }
          />
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GAP_DATA} layout="vertical" margin={{ left: 10, right: 24 }} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: "#374151" }} width={105} />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="required" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                <Bar dataKey="current"  fill={TEAL}     radius={[0, 4, 4, 0]}>
                  {GAP_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.critical ? "#EF4444" : entry.alert ? "#F59E0B" : entry.success ? "#10B981" : TEAL} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #E5E7EB", display: "flex", gap: 2 }}>
            {[{ color: TEAL, label: "On Track" }, { color: "#F59E0B", label: "Minor Gap" }, { color: "#EF4444", label: "Critical Gap" }].map((l) => (
              <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: l.color }} />
                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{l.label}</Typography>
              </Box>
            ))}
          </Box>
        </SectionBox>

        {/* Recent Interviews */}
        <SectionBox>
          <SectionTitle
            title="Recent Interviews"
            subtitle={interviewsLoading ? "Loading..." : `${recentInterviews.length} latest results`}
            action={
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: TEAL, cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3, "&:hover": { textDecoration: "underline" } }}>
                View all <ChevronRightOutlined sx={{ fontSize: 15 }} />
              </Typography>
            }
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {interviewsLoading ? (
              [1,2,3,4,5].map((i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, border: "1px solid #F3F4F6" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Skeleton variant="circular" width={36} height={36} />
                    <Box>
                      <Skeleton variant="text" width={120} height={16} />
                      <Skeleton variant="text" width={80} height={12} />
                    </Box>
                  </Box>
                  <Skeleton variant="rounded" width={70} height={22} />
                </Box>
              ))
            ) : recentInterviews.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>No interviews yet</Typography>
              </Box>
            ) : (
              recentInterviews.map((iv, i) => {
                const vs = VERDICT_STYLE[iv.verdict] ?? VERDICT_STYLE.Pending;
                const VIcon = vs.icon;
                return (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, border: "1px solid #F3F4F6", "&:hover": { borderColor: "#D1FAE5", bgcolor: "#F9FAFB" }, transition: "all 0.15s", cursor: "pointer" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: 12, fontWeight: 700 }}>
                        {iv.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{iv.name}</Typography>
                        <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{iv.job}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{iv.score}%</Typography>
                        <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{iv.time}</Typography>
                      </Box>
                      <Chip
                        icon={<VIcon sx={{ fontSize: "12px !important" }} />}
                        label={iv.verdict}
                        size="small"
                        sx={{ fontSize: "10px", height: 22, bgcolor: vs.bg, color: vs.color, fontWeight: 600, border: "none", "& .MuiChip-icon": { color: vs.color } }}
                      />
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </SectionBox>
      </Box>

      {/* ── Row 3: Active Job Posts + Active Campaigns ────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>

        {/* Active Job Posts */}
        <SectionBox>
          <SectionTitle
            title="Active Job Posts"
            subtitle={`${ACTIVE_POSTS.length} positions open`}
            action={
              <Button startIcon={<AddOutlined />} size="small" sx={{ bgcolor: TEAL, color: "#fff", textTransform: "none", borderRadius: 5, fontSize: "12px", fontWeight: 600, px: 2, "&:hover": { bgcolor: "#0F766E" } }}>
                New Post
              </Button>
            }
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ACTIVE_POSTS.map((post, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, border: "1px solid #E5E7EB", "&:hover": { borderColor: TEAL }, transition: "border-color 0.2s", cursor: "pointer" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <WorkOutlined sx={{ fontSize: 18, color: TEAL }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{post.title}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.3 }}>
                      {post.skills.map((s) => (
                        <Chip key={s} label={s} size="small" sx={{ fontSize: "9px", height: 18, bgcolor: "#F3F4F6", color: "#6B7280" }} />
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Chip
                    label={post.status}
                    size="small"
                    sx={{ fontSize: "10px", height: 20, fontWeight: 600,
                      bgcolor: post.status === "Active" ? "#F0FDFA" : "#F3F4F6",
                      color: post.status === "Active" ? TEAL : "#6B7280",
                    }}
                  />
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF", mt: 0.5 }}>{post.applicants} applicants</Typography>
                  <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>Due {post.deadline}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2, textAlign: "center", cursor: "pointer", color: TEAL, fontSize: "13px", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
            View all posts →
          </Box>
        </SectionBox>

        {/* Active Campaigns */}
        <SectionBox>
          <SectionTitle
            title="Active Campaigns"
            subtitle={`${ACTIVE_CAMPAIGNS.length} running`}
            action={
              <Button startIcon={<AddOutlined />} size="small" sx={{ bgcolor: "#8B5CF6", color: "#fff", textTransform: "none", borderRadius: 5, fontSize: "12px", fontWeight: 600, px: 2, "&:hover": { bgcolor: "#7C3AED" } }}>
                New
              </Button>
            }
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {ACTIVE_CAMPAIGNS.map((camp, i) => {
              const colors = CAMPAIGN_TYPE_COLOR[camp.type] ?? CAMPAIGN_TYPE_COLOR.ASSESSMENT;
              const progressColor = camp.progress >= 75 ? "#10B981" : camp.progress >= 40 ? TEAL : "#F59E0B";
              return (
                <Box key={i} sx={{ p: 2, borderRadius: 2, border: "1px solid #E5E7EB", "&:hover": { borderColor: "#8B5CF6" }, transition: "border-color 0.2s", cursor: "pointer" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: colors.bg }}>
                        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: colors.fg, textTransform: "uppercase", letterSpacing: 0.8 }}>{camp.type}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {camp.title}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "12px", fontWeight: 800, color: progressColor }}>{camp.progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={camp.progress}
                    sx={{ height: 6, borderRadius: 3, bgcolor: "#F3F4F6", "& .MuiLinearProgress-bar": { bgcolor: progressColor, borderRadius: 3 } }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{camp.modules} modules</Typography>
                    <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>Due {camp.deadline}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ mt: 2, textAlign: "center", cursor: "pointer", color: "#8B5CF6", fontSize: "13px", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
            View all campaigns →
          </Box>
        </SectionBox>
      </Box>

    </Box>
  );
};

export default memo(DashboardOverview);
