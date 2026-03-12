import React, { memo, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Avatar, Button, Chip, Skeleton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchCompanyInterviews,
  selectCompanyInterviews,
  selectCompanyInterviewsLoading,
} from "@/store/slices/interviewSlice";
import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsLoading,
} from "@/store/slices/postSlice";
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectDashboardStatsLoading,
} from "@/store/slices/companySlice";
import {
  fetchCampaigns,
  selectCampaigns,
  selectCampaignLoading,
} from "@/store/slices/campaignSlice";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#0D9488";

const STAT_CONFIG = [
  // { key: "totalEmployees",    label: "Total Employees",      icon: PeopleOutlined,             color: "#0D9488", format: (v: number) => String(v) },
  { key: "avgInterviewScore", label: "Avg. Interview Score", icon: PsychologyOutlined, color: "#3B82F6", format: (v: number) => `${v}%` },
  { key: "activeJobPosts", label: "Active Job Posts", icon: WorkOutlined, color: "#F59E0B", format: (v: number) => String(v) },
  // { key: "activeCampaigns",   label: "Active Campaigns",     icon: AssignmentTurnedInOutlined, color: "#8B5CF6", format: (v: number) => String(v) },
];

const GAP_DATA = [
  { name: "React.js", current: 85, required: 90 },
  { name: "Python", current: 72, required: 85, alert: true },
  { name: "System Design", current: 45, required: 80, critical: true },
  { name: "AWS", current: 68, required: 75 },
  { name: "TypeScript", current: 78, required: 85 },
  { name: "Docker", current: 55, required: 70, alert: true },
  { name: "Leadership", current: 62, required: 80, critical: true },
  { name: "Communication", current: 88, required: 85, success: true },
];

const GAP_LEGEND = [
  { color: TEAL, label: "On Track" },
  { color: "#F59E0B", label: "Minor Gap" },
  { color: "#EF4444", label: "Critical Gap" },
];

const VERDICT_STYLE: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  Excellent: { bg: "#F0FDFA", color: "#0D9488", icon: CheckCircleOutlined },
  Good: { bg: "#EFF6FF", color: "#2563EB", icon: CheckCircleOutlined },
  "Needs Work": { bg: "#FEF2F2", color: "#DC2626", icon: CancelOutlined },
  Pending: { bg: "#FFFBEB", color: "#D97706", icon: HourglassEmptyOutlined },
};

const CAMPAIGN_TYPE_COLOR: Record<string, { bg: string; fg: string }> = {
  PRODUCTIVITY_DIAGNOSTIC: { bg: "#FFF7ED", fg: "#C2410C" },
  SKILLS_MAPPING: { bg: "#EFF6FF", fg: "#2563EB" },
  ENABLEMENT: { bg: "#F5F3FF", fg: "#7C3AED" },
  CUSTOM: { bg: "#F0FDFA", fg: "#0D9488" },
};

const AVATAR_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];
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
  return days === 1 ? "Yesterday" : `${days} days ago`;
};

const getVerdict = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Needs Work";
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const fmtType = (type?: string) => type?.replaceAll("_", " ") ?? "—";

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

const ViewAllLink: React.FC<{ color?: string; onClick: () => void }> = ({ color = TEAL, onClick }) => (
  <Typography onClick={onClick} sx={{ fontSize: "12px", fontWeight: 600, color, cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3, "&:hover": { textDecoration: "underline" } }}>
    View all <ChevronRightOutlined sx={{ fontSize: 15 }} />
  </Typography>
);

const GapTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: "#fff", p: 1.5, border: "1px solid #E5E7EB", borderRadius: 2, boxShadow: 2, fontSize: "11px" }}>
      <Typography sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>{payload[0].payload.name}</Typography>
      <Typography sx={{ color: "#6B7280" }}>Current: <strong style={{ color: TEAL }}>{payload[0].value}%</strong></Typography>
      <Typography sx={{ color: "#6B7280" }}>Required: <strong>{payload[1]?.value}%</strong></Typography>
    </Box>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const rawInterviews = useSelector(selectCompanyInterviews);
  const interviewsLoading = useSelector(selectCompanyInterviewsLoading);
  const rawPosts = useSelector(selectMyPosts);
  const postsLoading = useSelector(selectMyPostsLoading);
  const rawCampaigns = useSelector(selectCampaigns);
  const campaignsLoading = useSelector(selectCampaignLoading);
  const dashboardStats = useSelector(selectDashboardStats);
  const statsLoading = useSelector(selectDashboardStatsLoading);

  useEffect(() => {
    dispatch(fetchCompanyInterviews({ limit: 5 }));
    dispatch(fetchMyPosts({ limit: 5 }));
    dispatch(fetchCampaigns({ limit: 5 }));
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const recentInterviews = useMemo(() =>
    rawInterviews.slice(0, 5).map((iv: any) => {
      const score = Math.round(iv.interviewData?.finalReport?.coverage?.overall ?? iv.score ?? 0);
      const name = iv.candidate?.username ||
        (iv.candidate?.firstName ? `${iv.candidate.firstName} ${iv.candidate.lastName ?? ""}`.trim() : "Candidate");
      return {
        id: iv._id as string,
        name,
        job: iv.post?.jobDetails?.title || iv.post?.title || "—",
        score,
        verdict: getVerdict(score),
        avatar: getInitials(name),
        time: fmtTime(iv.createdAt),
      };
    }),
    [rawInterviews]);

  const recentPosts = useMemo(() => rawPosts.slice(0, 5), [rawPosts]);
  const recentCampaigns = useMemo(() => rawCampaigns.slice(0, 5), [rawCampaigns]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Row 1: Stat Cards ─────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        {STAT_CONFIG.map((stat, idx) => {
          const raw = dashboardStats ? (dashboardStats as any)[stat.key] : null;
          const displayValue = statsLoading ? null : raw != null ? stat.format(raw) : "—";
          return (
            <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${stat.color}15` }}>
                    <stat.icon sx={{ fontSize: 22, color: stat.color }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.3, height: 28, width: 52 }}>
                    {[4, 6, 3, 7, 5, 8, 6].map((h, i) => (
                      <Box key={i} sx={{ flex: 1, borderRadius: "1px 1px 0 0", height: `${h * 10}%`, bgcolor: stat.color, opacity: 0.25 }} />
                    ))}
                  </Box>
                </Box>
                {statsLoading ? (
                  <Skeleton variant="text" width={80} height={36} />
                ) : (
                  <Typography sx={{ fontSize: "26px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{displayValue}</Typography>
                )}
                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF", mt: 0.5, textTransform: "uppercase", letterSpacing: 0.8 }}>{stat.label}</Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* ── Row 2: Skills Gap + Recent Interviews ─────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "6fr 5fr" }, gap: 3 }}>

        {/* <SectionBox>
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
                <Tooltip content={<GapTooltip />} />
                <Bar dataKey="required" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                <Bar dataKey="current"  fill={TEAL}    radius={[0, 4, 4, 0]}>
                  {GAP_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.critical ? "#EF4444" : entry.alert ? "#F59E0B" : entry.success ? "#10B981" : TEAL} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #E5E7EB", display: "flex", gap: 2 }}>
            {GAP_LEGEND.map((l) => (
              <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: l.color }} />
                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{l.label}</Typography>
              </Box>
            ))}
          </Box>
        </SectionBox> */}


      </Box>
      <SectionBox>
        <SectionTitle
          title="Recent Interviews"
          subtitle={interviewsLoading ? "Loading..." : `${recentInterviews.length} latest results`}
          action={<ViewAllLink onClick={() => router.push("/company/interviews")} />}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {interviewsLoading ? (
            SKELETON_ROWS.map((i) => (
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
                <Box key={iv.id || i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, border: "1px solid #F3F4F6", "&:hover": { borderColor: "#D1FAE5", bgcolor: "#F9FAFB" }, transition: "all 0.15s", cursor: "pointer" }}>
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
      {/* ── Row 3: Active Job Posts + Active Campaigns ────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>

        {/* Active Job Posts */}


        {/* Active Campaigns */}
        {/* <SectionBox>
          <SectionTitle
            title="Active Campaigns"
            subtitle={campaignsLoading ? "Loading..." : `${recentCampaigns.length} recent campaigns`}
            action={<ViewAllLink color="#8B5CF6" onClick={() => router.push("/company/campaigns")} />}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {campaignsLoading ? (
              SKELETON_ROWS.map((i) => (
                <Box key={i} sx={{ p: 2, borderRadius: 2, border: "1px solid #E5E7EB" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Skeleton variant="rounded" width={80} height={20} />
                      <Skeleton variant="text" width={130} height={16} />
                    </Box>
                    <Skeleton variant="text" width={30} height={16} />
                  </Box>
                  <Skeleton variant="rounded" width="100%" height={6} />
                </Box>
              ))
            ) : recentCampaigns.length === 0 ? (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>No campaigns yet</Typography>
              </Box>
            ) : (
              recentCampaigns.map((camp: any, i: number) => {
                const colors      = CAMPAIGN_TYPE_COLOR[camp.type] ?? CAMPAIGN_TYPE_COLOR.CUSTOM;
                const isActive    = camp.status === "ACTIVE";
                const statusColor = isActive ? "#10B981" : camp.status === "PAUSED" ? "#F59E0B" : "#6B7280";
                return (
                  <Box key={camp._id || i} sx={{ p: 2, borderRadius: 2, border: "1px solid #E5E7EB", "&:hover": { borderColor: "#8B5CF6" }, transition: "border-color 0.2s", cursor: "pointer" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: colors.bg }}>
                          <Typography sx={{ fontSize: "9px", fontWeight: 700, color: colors.fg, textTransform: "uppercase", letterSpacing: 0.8 }}>
                            {fmtType(camp.type)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {camp.title}
                        </Typography>
                      </Box>
                      <Chip
                        label={camp.status}
                        size="small"
                        sx={{ fontSize: "9px", height: 18, fontWeight: 700, bgcolor: isActive ? "#D1FAE5" : "#F3F4F6", color: statusColor }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                      <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>{fmtType(camp.module?.type)}</Typography>
                      {camp.deadline && (
                        <Typography sx={{ fontSize: "10px", color: "#9CA3AF" }}>Due {fmtDate(camp.deadline)}</Typography>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </SectionBox> */}
      </Box>
      <SectionBox>
        <SectionTitle
          title="Job Posts"
          subtitle={postsLoading ? "Loading..." : `${recentPosts.length} recent posts`}
          action={<ViewAllLink onClick={() => router.push("/company/posts")} />}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {postsLoading ? (
            SKELETON_ROWS.map((i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, border: "1px solid #E5E7EB" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Skeleton variant="rounded" width={38} height={38} />
                  <Box>
                    <Skeleton variant="text" width={150} height={16} />
                    <Skeleton variant="text" width={100} height={12} />
                  </Box>
                </Box>
                <Skeleton variant="rounded" width={60} height={20} />
              </Box>
            ))
          ) : recentPosts.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>No job posts yet</Typography>
            </Box>
          ) : (
            recentPosts.map((post: any, i: number) => {
              const status = post.status || "draft";
              const isActive = status.toLowerCase() === "active";
              return (
                <Box key={post._id || i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, border: "1px solid #E5E7EB", "&:hover": { borderColor: TEAL }, transition: "border-color 0.2s", cursor: "pointer" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <WorkOutlined sx={{ fontSize: 18, color: TEAL }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{post.jobDetails?.title || "—"}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.3 }}>
                        {post.jobDetails?.workMode && <Chip label={post.jobDetails.workMode} size="small" sx={{ fontSize: "9px", height: 18, bgcolor: "#F3F4F6", color: "#6B7280" }} />}
                        {post.jobDetails?.employmentType && <Chip label={post.jobDetails.employmentType} size="small" sx={{ fontSize: "9px", height: 18, bgcolor: "#F3F4F6", color: "#6B7280" }} />}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Chip
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
                      size="small"
                      sx={{ fontSize: "10px", height: 20, fontWeight: 600, bgcolor: isActive ? "#F0FDFA" : "#F3F4F6", color: isActive ? TEAL : "#6B7280" }}
                    />
                    {post.expirationDate && (
                      <Typography sx={{ fontSize: "10px", color: "#9CA3AF", mt: 0.5 }}>Expires {fmtDate(post.expirationDate)}</Typography>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </SectionBox>
    </Box>
  );
};

export default memo(DashboardOverview);
