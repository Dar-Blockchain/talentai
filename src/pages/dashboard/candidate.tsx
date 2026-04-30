import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Chip } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from "recharts";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import WelcomeHeader from "@/components/features/candidate/WelcomeHeader";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCandidateStats, selectCandidateStats } from "@/store/slices/jobApplicationSlice";

const T  = "#0D9488";
const TL = "#14B8A6";

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

// ── Tiny section label ────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", mb: 1.5 }}>
    {children}
  </Typography>
);

// ── Chart card ────────────────────────────────────────────
const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  minHeight?: number;
}> = ({ title, subtitle, badge, badgeColor = T, children, minHeight = 0 }) => (
  <Box sx={{
    bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB",
    p: 3, flex: 1, minHeight,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.25 }}>{subtitle}</Typography>}
      </Box>
      {badge && (
        <Chip label={badge} size="small" sx={{
          fontSize: "0.65rem", fontWeight: 700, height: 20,
          bgcolor: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30`,
        }} />
      )}
    </Box>
    {children}
  </Box>
);

// ── Mini stat pill ────────────────────────────────────────
const MiniStat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <Box sx={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    px: 1.5, py: 1, borderRadius: "10px", bgcolor: `${color}0D`, border: `1px solid ${color}25`,
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
      <Typography sx={{ fontSize: "0.72rem", color: "#374151", fontWeight: 500 }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color }}>{value}</Typography>
  </Box>
);

const DashboardCandidate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);
  const stats    = useSelector(selectCandidateStats);

  const quota    = profile?.quota ?? 0;

  useEffect(() => { dispatch(fetchCandidateStats()); }, [dispatch]);

  const totalApplications = stats?.totalApplications ?? 0;
  const totalInterviews   = stats?.totalInterviews   ?? 0;
  const monthlyData       = stats?.monthly           ?? [];
  const statusCounts      = stats?.statusCounts      ?? {};

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name:  name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    value: value as number,
    color: STATUS_COLORS[name] || "#9CA3AF",
  }));

  const accepted    = statusCounts["accepted"]  ?? 0;
  const rejected    = statusCounts["rejected"]  ?? 0;
  const pending     = (statusCounts["pending"] ?? 0) + (statusCounts["applied"] ?? 0);
  const shortlisted = statusCounts["shortlisted"] ?? 0;
  const successRate = totalApplications > 0 ? Math.round((accepted / totalApplications) * 100) : 0;

  const quotaData = [
    { name: "Used",      value: quota,               fill: T },
    { name: "Remaining", value: Math.max(0, 5 - quota), fill: "#E5E7EB" },
  ];

  return (
    <DashboardLayout>

      {/* ── Welcome banner ── */}
      <Box sx={{ mb: 2 }}>
        <WelcomeHeader />
      </Box>

      {/* ── Charts: top row ── */}
      <SectionLabel>Application Analytics</SectionLabel>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>

        {/* Area chart — activity over time */}
        <ChartCard
          title="Application Activity"
          subtitle="Last 6 months"
          badge="6 months"
          badgeColor={T}
          minHeight={260}
          // grow to fill ~60% of row
        >
          <Box sx={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={T} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 12 }}
                  cursor={{ stroke: `${T}40`, strokeWidth: 2 }}
                />
                <Area dataKey="applications" stroke={T} strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: T, r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </ChartCard>

        {/* Donut — status breakdown */}
        <ChartCard title="Status Breakdown" subtitle="All applications" badge={`${totalApplications} total`} badgeColor="#2563EB" minHeight={260}>
          {statusData.length === 0 ? (
            <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#9CA3AF" }}>No applications yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={44} outerRadius={66}
                    dataKey="value" paddingAngle={3} label={false}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                {statusData.map((s, i) => (
                  <MiniStat key={i} label={s.name} value={s.value} color={s.color} />
                ))}
              </Box>
            </Box>
          )}
        </ChartCard>
      </Box>

      {/* ── Charts: bottom row ── */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

        {/* Bar chart — monthly */}
        <ChartCard title="Monthly Applications" subtitle="Last 6 months" minHeight={240}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 12 }}
                cursor={{ fill: `${T}10` }}
              />
              <Bar dataKey="applications" radius={[5, 5, 0, 0]}>
                {monthlyData.map((_, i) => (
                  <Cell key={i} fill={i === monthlyData.length - 1 ? T : `${T}60`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quota card */}
        <ChartCard title="Monthly Test Quota" subtitle={`${quota} of 5 tests used`} badge={quota >= 5 ? "Maxed out" : `${5 - quota} left`} badgeColor={quota >= 5 ? "#DC2626" : T} minHeight={240}>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={quotaData} cx="50%" cy="50%" innerRadius={40} outerRadius={58}
                  startAngle={90} endAngle={-270} dataKey="value" paddingAngle={2}>
                  {quotaData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 22, fontWeight: 800, fill: "#111827" }}>{quota}</text>
                <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 11, fill: "#9CA3AF" }}>of 5</text>
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ flex: 1 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <Box key={n} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box sx={{
                    width: 10, height: 10, borderRadius: "50%",
                    bgcolor: n <= quota ? T : "#E5E7EB",
                    boxShadow: n <= quota ? `0 0 6px ${TL}` : "none",
                    transition: "all 0.3s",
                  }} />
                  <Box sx={{ flex: 1, height: 6, borderRadius: "99px", bgcolor: "#F3F4F6", overflow: "hidden" }}>
                    <Box sx={{
                      height: "100%", borderRadius: "99px",
                      bgcolor: n <= quota ? T : "transparent",
                      width: n <= quota ? "100%" : "0%",
                      transition: "width 0.6s ease",
                    }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", minWidth: 36 }}>Test {n}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </ChartCard>

        {/* Outcome summary card */}
        <ChartCard title="Application Outcomes" subtitle="Accepted vs Rejected" minHeight={240}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[
              { label: "Accepted",    value: accepted,    color: "#059669", max: totalApplications },
              { label: "Shortlisted", value: shortlisted, color: "#16A34A", max: totalApplications },
              { label: "Pending",     value: pending,     color: "#D97706", max: totalApplications },
              { label: "Rejected",    value: rejected,    color: "#DC2626", max: totalApplications },
            ].map(({ label, value, color, max }) => (
              <Box key={label}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: "0.72rem", color: "#374151", fontWeight: 500 }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color }}>{value}</Typography>
                </Box>
                <Box sx={{ height: 6, bgcolor: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                  <Box sx={{
                    height: "100%", borderRadius: "99px", bgcolor: color,
                    width: max > 0 ? `${(value / max) * 100}%` : "0%",
                    transition: "width 0.8s ease",
                  }} />
                </Box>
              </Box>
            ))}
            <Box sx={{ mt: 1, pt: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>Overall success rate</Typography>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: T }}>{successRate}%</Typography>
            </Box>
          </Box>
        </ChartCard>

      </Box>
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(DashboardCandidate), { ssr: false });
