import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Avatar, LinearProgress, Button, Divider, Chip } from "@mui/material";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCandidateStats, selectCandidateStats } from "@/store/slices/jobApplicationSlice";
import { useRouter } from "next/router";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNew";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import { DashboardOutlined } from "@mui/icons-material";

const T    = "#0D9488";
const TL   = "#14B8A6";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

const STATUS_COLORS: Record<string, string> = {
  applied:             "#2563EB",
  pending:             "#D97706",
  shortlisted:         "#16A34A",
  accepted:            "#0D9488",
  rejected:            "#DC2626",
  withdrawn:           "#6B7280",
  interview_scheduled: "#7C3AED",
  interview_completed: "#059669",
};

const QuickNavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  bg: string;
  border: string;
}> = ({ icon: Icon, label, href, color, bg, border }) => {
  const router = useRouter();
  const isActive = router.pathname === href || router.pathname.startsWith(href + "/");
  return (
    <Box
      onClick={() => router.push(href)}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 1.5, py: 1.1, borderRadius: "10px", cursor: "pointer",
        border: `1px solid ${isActive ? border : "#E5E7EB"}`,
        bgcolor: isActive ? bg : "#FAFAFA",
        transition: "all 0.18s ease",
        "&:hover": { borderColor: border, bgcolor: bg },
      }}
    >
      <Box sx={{
        width: 30, height: 30, borderRadius: "8px",
        bgcolor: isActive ? bg : "#fff",
        border: `1px solid ${isActive ? border : "#E5E7EB"}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon sx={{ fontSize: 15, color: isActive ? color : "#6B7280" }} />
      </Box>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: isActive ? 700 : 500, color: isActive ? color : "#374151" }}>
        {label}
      </Typography>
    </Box>
  );
};

const StatPill: React.FC<{ label: string; value: number | string; color: string; bg: string; border: string }> = ({ label, value, color, bg, border }) => (
  <Box sx={{ flex: 1, px: 1.5, py: 1.25, borderRadius: "10px", bgcolor: bg, border: `1px solid ${border}`, textAlign: "center" }}>
    <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 500, mt: 0.25 }}>{label}</Typography>
  </Box>
);

const DashboardCandidate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const stats    = useSelector(selectCandidateStats);
  const quota    = profile?.quota ?? 0;

  useEffect(() => { dispatch(fetchCandidateStats()); }, [dispatch]);

  const totalApplications = stats?.totalApplications ?? 0;
  const totalInterviews   = stats?.totalInterviews   ?? 0;
  const monthlyData       = stats?.monthly           ?? [];
  const statusCounts      = stats?.statusCounts      ?? {};

  const accepted    = statusCounts["accepted"]  ?? 0;
  const rejected    = statusCounts["rejected"]  ?? 0;
  const pending     = (statusCounts["pending"] ?? 0) + (statusCounts["applied"] ?? 0);
  const shortlisted = statusCounts["shortlisted"] ?? 0;
  const successRate = totalApplications > 0 ? Math.round((accepted / totalApplications) * 100) : 0;

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.username || "Candidate";
  const initial   = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : undefined;

  const quotaData = [
    { name: "Used",      value: quota,                  fill: T        },
    { name: "Remaining", value: Math.max(0, 5 - quota), fill: "#E5E7EB" },
  ];

  const checklist = [
    { label: "Complete your profile",      done: !!(profile?.firstName && profile?.lastName) },
    { label: "Add a target role",          done: !!profile?.targetRole                       },
    { label: "Set experience level",       done: !!profile?.requiredExperienceLevel          },
    { label: "Take your first skill test", done: quota > 0                                   },
    { label: "Submit an application",      done: totalApplications > 0                       },
  ];

  const QUICK_LINKS = [
    { icon: DashboardOutlined,  label: "Dashboard",    href: "/dashboard/candidate",              color: T,         bg: TBG,       border: TBRD      },
    { icon: AssignmentOutlined, label: "Applications", href: "/dashboard/candidate/applications", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { icon: PsychologyOutlined, label: "Skills",       href: "/dashboard/candidate/skills",       color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    { icon: SchoolOutlined,     label: "Interviews",   href: "/dashboard/candidate/interviews",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr 240px" }, gap: 2.5, alignItems: "start" }}>

        {/* ══ LEFT — Profile ══ */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Profile card */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Box sx={{ height: 56, background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)`, position: "relative" }}>
              <Box sx={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", bgcolor: `${TL}30`, border: `1px solid ${TL}40` }} />
            </Box>
            <Box sx={{ px: 2, pb: 2 }}>
              <Box sx={{ mt: -3, mb: 1 }}>
                <Avatar src={avatarUrl}
                  sx={{ width: 52, height: 52, bgcolor: T, fontSize: "1.2rem", fontWeight: 700, border: "2.5px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                  {initial}
                </Avatar>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: NAVY, lineHeight: 1.2 }}>{displayName}</Typography>
              {user?.email && (
                <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.25, mb: 1 }}>{user.email}</Typography>
              )}
              {profile?.targetRole && (
                <Chip label={profile.targetRole} size="small"
                  sx={{ fontSize: "0.65rem", height: 20, bgcolor: TBG, border: `1px solid ${TBRD}`, color: T, fontWeight: 600, mb: 1 }} />
              )}
              {profile?.requiredExperienceLevel && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EmojiEventsOutlined sx={{ fontSize: 12, color: "#D97706" }} />
                  <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 500 }}>{profile.requiredExperienceLevel}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <StatPill label="Applications" value={totalApplications} color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />
                <StatPill label="Interviews"   value={totalInterviews}   color={T}        bg={TBG}    border={TBRD}    />
              </Box>
            </Box>
          </Box>

          {/* Monthly quota */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <QuizOutlined sx={{ fontSize: 16, color: T }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: NAVY }}>Monthly Tests</Typography>
              <Chip label={quota >= 5 ? "Maxed" : `${5 - quota} left`} size="small"
                sx={{ ml: "auto", fontSize: "0.6rem", height: 18, fontWeight: 700,
                  bgcolor: quota >= 5 ? "#FEF2F2" : TBG, color: quota >= 5 ? "#DC2626" : T,
                  border: `1px solid ${quota >= 5 ? "#FECACA" : TBRD}` }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ResponsiveContainer width={70} height={70}>
                <PieChart>
                  <Pie data={quotaData} cx="50%" cy="50%" innerRadius={22} outerRadius={32}
                    startAngle={90} endAngle={-270} dataKey="value" paddingAngle={2}>
                    {quotaData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: 14, fontWeight: 800, fill: NAVY }}>{quota}</text>
                  <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: 8, fill: "#9CA3AF" }}>of 5</text>
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Box key={n} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: n <= quota ? T : "#E5E7EB", transition: "all 0.3s" }} />
                    <Box sx={{ flex: 1, height: 4, borderRadius: "99px", bgcolor: "#F3F4F6", overflow: "hidden" }}>
                      <Box sx={{ height: "100%", borderRadius: "99px", bgcolor: n <= quota ? T : "transparent", width: n <= quota ? "100%" : "0%", transition: "width 0.6s ease" }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Profile strength */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <TrendingUpOutlined sx={{ fontSize: 16, color: "#7C3AED" }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: NAVY }}>Profile Strength</Typography>
            </Box>
            <LinearProgress variant="determinate"
              value={Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)}
              sx={{ height: 5, borderRadius: "99px", bgcolor: "#F3F4F6", mb: 1.5, "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: "#7C3AED" } }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {checklist.map((item, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {item.done
                    ? <CheckCircleOutlined sx={{ fontSize: 14, color: "#059669" }} />
                    : <RadioButtonUncheckedOutlined sx={{ fontSize: 14, color: "#D1D5DB" }} />}
                  <Typography sx={{ fontSize: "0.72rem", color: item.done ? "#374151" : "#9CA3AF", fontWeight: item.done ? 500 : 400 }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ══ CENTER — Feed ══ */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Welcome */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Box sx={{ height: 3, background: `linear-gradient(90deg, ${T}, ${TL})` }} />
            <Box sx={{ px: 3, py: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: NAVY }}>
                Welcome back, {displayName} 👋
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#9CA3AF", mt: 0.25 }}>
                Ready to continue your journey? Let's make today productive!
              </Typography>
            </Box>
          </Box>

          {/* Activity chart */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: NAVY }}>Application Activity</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", mt: 0.2 }}>Last 6 months</Typography>
              </Box>
              <Chip label={`${totalApplications} total`} size="small"
                sx={{ fontSize: "0.65rem", height: 20, bgcolor: TBG, color: T, border: `1px solid ${TBRD}`, fontWeight: 700 }} />
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={T} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 11 }} cursor={{ stroke: `${T}40`, strokeWidth: 2 }} />
                <Area dataKey="applications" stroke={T} strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: T, r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Outcomes */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: NAVY }}>Application Outcomes</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", mt: 0.2 }}>Accepted vs Rejected</Typography>
              </Box>
              <Box sx={{ px: 1.5, py: 0.4, borderRadius: "20px", bgcolor: successRate >= 50 ? TBG : "#FEF2F2", border: `1px solid ${successRate >= 50 ? TBRD : "#FECACA"}` }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: successRate >= 50 ? T : "#DC2626" }}>{successRate}% success</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {[
                { label: "Accepted",    value: accepted,    color: "#059669" },
                { label: "Shortlisted", value: shortlisted, color: "#16A34A" },
                { label: "Pending",     value: pending,     color: "#D97706" },
                { label: "Rejected",    value: rejected,    color: "#DC2626" },
              ].map(({ label, value, color }) => (
                <Box key={label}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                    <Typography sx={{ fontSize: "0.72rem", color: "#374151", fontWeight: 500 }}>{label}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color }}>{value}</Typography>
                  </Box>
                  <Box sx={{ height: 5, bgcolor: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", borderRadius: "99px", bgcolor: color, width: totalApplications > 0 ? `${(value / totalApplications) * 100}%` : "0%", transition: "width 0.8s ease" }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Status chips */}
          {Object.keys(statusCounts).length > 0 && (
            <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: NAVY, mb: 2 }}>Status Breakdown</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {Object.entries(statusCounts).map(([key, count]) => {
                  const color = STATUS_COLORS[key] || "#9CA3AF";
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.6, borderRadius: "8px", bgcolor: `${color}0D`, border: `1px solid ${color}25` }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
                      <Typography sx={{ fontSize: "0.72rem", color: "#374151", fontWeight: 500 }}>{label}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color }}>{count as number}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>

        {/* ══ RIGHT — Quick nav ══ */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Quick navigation */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: NAVY, mb: 1.5 }}>Quick Navigation</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {QUICK_LINKS.map(link => (
                <QuickNavItem key={link.href} {...link} />
              ))}
            </Box>
          </Box>

          {/* Career actions */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: NAVY, mb: 1.5 }}>Career Actions</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button fullWidth size="small" startIcon={<WorkOutlineOutlined sx={{ fontSize: 15 }} />}
                onClick={() => router.push("/dashboard/candidate/applications")}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#7C3AED", bgcolor: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "10px", py: 0.9, justifyContent: "flex-start", px: 1.5, "&:hover": { bgcolor: "#EDE9FE" } }}>
                View Applications
              </Button>
              <Button fullWidth size="small" startIcon={<PsychologyOutlined sx={{ fontSize: 15 }} />}
                onClick={() => router.push("/dashboard/candidate/skills")}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#2563EB", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", py: 0.9, justifyContent: "flex-start", px: 1.5, "&:hover": { bgcolor: "#DBEAFE" } }}>
                Manage Skills
              </Button>
              <Button fullWidth size="small" startIcon={<SchoolOutlined sx={{ fontSize: 15 }} />}
                onClick={() => router.push("/dashboard/candidate/interviews")}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#D97706", bgcolor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", py: 0.9, justifyContent: "flex-start", px: 1.5, "&:hover": { bgcolor: "#FEF3C7" } }}>
                View Interviews
              </Button>
            </Box>
          </Box>

          {/* Explore jobs */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: NAVY, mb: 0.5 }}>Explore Opportunities</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", mb: 1.5 }}>Find jobs that match your profile</Typography>
            <Button fullWidth size="small" endIcon={<OpenInNewOutlined sx={{ fontSize: 13 }} />}
              onClick={() => router.push("/jobs")}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", color: "#fff", bgcolor: T, borderRadius: "10px", py: 1, "&:hover": { bgcolor: TL } }}>
              Browse Jobs
            </Button>
          </Box>

          {/* At a glance */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: NAVY, mb: 1.5 }}>At a Glance</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                { label: "Total Applications", value: totalApplications, color: "#7C3AED" },
                { label: "Total Interviews",   value: totalInterviews,   color: T           },
                { label: "Accepted",           value: accepted,          color: "#059669"   },
                { label: "Pending",            value: pending,           color: "#D97706"   },
              ].map(({ label, value, color }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>{label}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

      </Box>
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(DashboardCandidate), { ssr: false });
