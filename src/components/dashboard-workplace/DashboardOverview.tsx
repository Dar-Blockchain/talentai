import React from "react";
import { Box, Typography, Avatar, Button, LinearProgress } from "@mui/material";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
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

const statsData = [
  { label: "Total Employees", value: "247", change: "+12 this month", trend: "up", icon: PeopleOutlined, color: "#0D9488" },
  { label: "Avg. Skill Score", value: "72%", change: "+5% vs last qtr", trend: "up", icon: PsychologyOutlined, color: "#3B82F6" },
  { label: "Active Campaigns", value: "3", change: "2 completing soon", trend: "neutral", icon: AssignmentTurnedInOutlined, color: "#F59E0B" },
  { label: "Training Completion", value: "68%", change: "156 / 247 done", trend: "up", icon: SchoolOutlined, color: "#8B5CF6" },
];

const gapData = [
  { name: "React.js", current: 85, required: 90 },
  { name: "Python", current: 72, required: 85, alert: true },
  { name: "System Design", current: 45, required: 80, critical: true },
  { name: "AWS", current: 68, required: 75 },
  { name: "TypeScript", current: 78, required: 85 },
  { name: "Docker", current: 55, required: 70, alert: true },
  { name: "Leadership", current: 62, required: 80, critical: true },
  { name: "Communication", current: 88, required: 85, success: true },
];

const recentActivity = [
  { user: "Sarah Chen", action: "completed React.js assessment", score: "92%", time: "2h ago" },
  { user: "John M.", action: "created campaign 'Leadership Eval'", time: "5h ago" },
  { user: "Engineering Team", action: "12 employees enrolled in AWS Training", time: "Yesterday" },
  { user: "Ahmed R.", action: "earned 'Advanced Python' credential", time: "Yesterday", achievement: true },
  { user: "System", action: "Q4 Assessment Report generated", time: "2 days ago" },
  { user: "Admin", action: "Skills matrix updated for Engineering", time: "3 days ago" },
];

const topPerformers = [
  { rank: 1, name: "Sarah Chen", dept: "Engineering", score: 94, trend: "up" },
  { rank: 2, name: "Marcus Johnson", dept: "DevOps", score: 91, trend: "up" },
  { rank: 3, name: "Priya Patel", dept: "Product", score: 89, trend: "neutral" },
  { rank: 4, name: "David Kim", dept: "Engineering", score: 87, trend: "up" },
  { rank: 5, name: "Elena Rossi", dept: "Marketing", score: 85, trend: "up" },
];

const campaigns = [
  { title: "Q1 Technical Assessment", status: "In Progress", dot: "#10B981", meta: "78/120 completed", progress: 65, due: "Feb 15, 2026", type: "tech" },
  { title: "Leadership Skills Eval", status: "Starting Soon", dot: "#F59E0B", meta: "0/45 assigned", progress: 0, due: "Feb 20, 2026", type: "soft" },
  { title: "Security Compliance Check", status: "In Progress", dot: "#10B981", meta: "34/60 completed", progress: 57, due: "Feb 10, 2026", type: "compliance" },
];

const DashboardOverview: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        {statsData.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { boxShadow: 2 }, transition: "box-shadow 0.2s" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${stat.color}10` }}>
                  <stat.icon sx={{ fontSize: 24, color: stat.color }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.3, height: 32, width: 60 }}>
                  {[4, 6, 3, 7, 5, 8, 6].map((h, i) => (
                    <Box key={i} sx={{ flex: 1, borderRadius: "1px 1px 0 0", height: `${h * 10}%`, bgcolor: stat.color, opacity: 0.3 }} />
                  ))}
                </Box>
              </Box>
              <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", mt: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5 }}>
                {stat.trend === "up" ? (
                  <TrendingUpOutlined sx={{ fontSize: 16, color: "#10B981" }} />
                ) : stat.trend === "down" ? (
                  <TrendingDownOutlined sx={{ fontSize: 16, color: "#EF4444" }} />
                ) : null}
                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: stat.trend === "up" ? "#10B981" : stat.trend === "down" ? "#EF4444" : "#6B7280" }}>
                  {stat.change}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Skills Gap + Active Campaigns */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" }, gap: 3 }}>
        {/* Skills Gap Analysis */}
        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
            <Box>
              <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Skills Gap Analysis</Typography>
              <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>Current vs. Required proficiency levels</Typography>
            </Box>
            <Button startIcon={<FilterListOutlined />} sx={{ textTransform: "none", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 2, fontSize: "13px" }}>
              All Departments
            </Button>
          </Box>
          <Box sx={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapData} layout="vertical" margin={{ left: 20, right: 30 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 500, fill: "#374151" }} width={110} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload?.length) {
                      return (
                        <Box sx={{ bgcolor: "#fff", p: 1.5, border: "1px solid #E5E7EB", borderRadius: 2, boxShadow: 2, fontSize: "11px" }}>
                          <Typography sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>{payload[0].payload.name}</Typography>
                          <Typography sx={{ color: "#6B7280" }}>Current: <strong style={{ color: "#0D9488" }}>{payload[0].value}%</strong></Typography>
                          <Typography sx={{ color: "#6B7280" }}>Required: <strong>{payload[1]?.value}%</strong></Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="required" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                <Bar dataKey="current" fill="#0D9488" radius={[0, 4, 4, 0]}>
                  {gapData.map((entry, index) => (
                    <Cell key={index} fill={entry.critical ? "#EF4444" : entry.alert ? "#F59E0B" : "#0D9488"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              {[
                { color: "#0D9488", label: "On Track" },
                { color: "#F59E0B", label: "Minor Gap" },
                { color: "#EF4444", label: "Critical Gap" },
              ].map((l) => (
                <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: l.color }} />
                  <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0D9488", cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5, "&:hover": { textDecoration: "underline" } }}>
              View Full Matrix <ChevronRightOutlined sx={{ fontSize: 16 }} />
            </Typography>
          </Box>
        </Box>

        {/* Active Campaigns */}
        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Active Campaigns</Typography>
            <Button startIcon={<AddOutlined />} sx={{ bgcolor: "#0D9488", color: "#fff", textTransform: "none", borderRadius: 5, fontSize: "13px", fontWeight: 600, px: 2, "&:hover": { bgcolor: "#0b7a6f" } }}>
              New Campaign
            </Button>
          </Box>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {campaigns.map((camp, i) => {
              const iconMap: any = { tech: PsychologyOutlined, soft: PeopleOutlined, compliance: AssignmentTurnedInOutlined };
              const colorMap: any = { tech: { bg: "#EFF6FF", fg: "#2563EB" }, soft: { bg: "#F5F3FF", fg: "#7C3AED" }, compliance: { bg: "#FFFBEB", fg: "#D97706" } };
              const Icon = iconMap[camp.type];
              const colors = colorMap[camp.type];
              return (
                <Box key={i} sx={{ p: 2, borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { borderColor: "#0D9488" }, transition: "border-color 0.2s", cursor: "pointer" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: colors.bg, color: colors.fg }}><Icon sx={{ fontSize: 20 }} /></Avatar>
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{camp.title}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: camp.dot }} />
                          <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{camp.status}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <ChevronRightOutlined sx={{ color: "#9CA3AF", fontSize: 20 }} />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{camp.meta}</Typography>
                      <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#111827" }}>{camp.progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={camp.progress}
                      sx={{ height: 6, borderRadius: 3, bgcolor: "#E5E7EB", "& .MuiLinearProgress-bar": { borderRadius: 3, background: "linear-gradient(to right, #0D9488, #34D399)" } }}
                    />
                  </Box>
                  <Typography sx={{ mt: 1.5, fontSize: "9px", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, color: "#9CA3AF" }}>
                    Due Date: {camp.due}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Activity + Top Performers */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        {/* Recent Activity */}
        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827", mb: 3 }}>Recent Activity</Typography>
          <Box sx={{ position: "relative", pl: 3 }}>
            <Box sx={{ position: "absolute", left: "5px", top: 8, bottom: 8, width: 1, bgcolor: "#E5E7EB" }} />
            {recentActivity.map((a, i) => (
              <Box key={i} sx={{ position: "relative", mb: 3, "&:last-child": { mb: 0 } }}>
                <Box sx={{ position: "absolute", left: -21, top: 6, width: 12, height: 12, borderRadius: "50%", bgcolor: "#0D9488", border: "2px solid #fff", zIndex: 1 }} />
                <Typography sx={{ fontSize: "13px", color: "#374151" }}>
                  <Box component="span" sx={{ fontWeight: 700, color: "#0D9488", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>{a.user}</Box>{" "}
                  {a.action}
                  {a.score && (
                    <Box component="span" sx={{ ml: 0.5, px: 0.7, py: 0.2, bgcolor: "#E6F7F5", color: "#0D9488", borderRadius: 1, fontWeight: 700, fontSize: "11px" }}>
                      {a.score}
                    </Box>
                  )}
                  {a.achievement && " \u{1F3C6}"}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.5 }}>{a.time}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Top Performers */}
        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <EmojiEventsOutlined sx={{ color: "#F59E0B", fontSize: 20 }} />
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Top Performers This Quarter</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {topPerformers.map((p) => (
              <Box key={p.rank} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 3, "&:hover": { bgcolor: "#F0FDFA", border: "1px solid #E6F7F5" }, border: "1px solid transparent", transition: "all 0.2s" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ width: 24, fontSize: "13px", fontWeight: 700, color: p.rank === 1 ? "#F59E0B" : "#6B7280", textAlign: "center" }}>
                    #{p.rank}
                  </Typography>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: p.rank % 2 === 0 ? "#3B82F6" : "#0D9488", fontSize: 13 }}>
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{p.dept}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{p.score}%</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.3 }}>
                      {p.trend === "up" && <TrendingUpOutlined sx={{ fontSize: 12, color: "#10B981" }} />}
                      <Typography sx={{ fontSize: "9px", color: "#10B981", fontWeight: 700 }}>UP</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ width: 40, height: 40, position: "relative" }}>
                    <svg width="40" height="40" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="20" cy="20" r="15" stroke="#E5E7EB" strokeWidth="3" fill="transparent" />
                      <circle
                        cx="20" cy="20" r="15"
                        stroke="#0D9488" strokeWidth="3" fill="transparent"
                        strokeDasharray={2 * Math.PI * 15}
                        strokeDashoffset={2 * Math.PI * 15 * (1 - p.score / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardOverview;
