import React, { memo } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  InputBase,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import MoreHorizOutlined from "@mui/icons-material/MoreHorizOutlined";

const enablementStats = [
  { label: "Active Learners", value: "156", sub: "/ 247 total", p: 63, icon: PeopleOutlined, color: "#0D9488" },
  { label: "Learning Paths", value: "8", sub: "3 new this qtr", p: 100, icon: MenuBookOutlined, color: "#3B82F6" },
  { label: "Courses Completed", value: "487", sub: "+23% vs last qtr", p: 85, icon: CheckCircleOutlined, color: "#10B981" },
  { label: "Avg. Comp. Time", value: "4.2d", sub: "Per path", p: 100, icon: AccessTimeOutlined, color: "#F59E0B" },
];

const learningPaths = [
  { id: 1, title: "Advanced React Development", desc: "Master modern React patterns, state management, and performance optimization.", courses: 6, hours: 12, enrolled: 42, completed: 28, type: "Technical", color: "blue", skills: ["React.js", "TypeScript"] },
  { id: 2, title: "Cloud Architecture Fundamentals", desc: "Build scalable and resilient infrastructure using AWS, Docker, and Kubernetes.", courses: 8, hours: 20, enrolled: 35, completed: 16, type: "Technical", color: "blue", skills: ["AWS", "Docker"] },
  { id: 3, title: "Leadership & Communication", desc: "Develop essential soft skills for managing teams and driving organizational success.", courses: 4, hours: 8, enrolled: 45, completed: 37, type: "Soft Skills", color: "purple", skills: ["Management", "EQ"] },
  { id: 4, title: "Security & Compliance Essentials", desc: "Comprehensive training on data privacy, secure coding, and company policies.", courses: 3, hours: 5, enrolled: 180, completed: 164, type: "Compliance", color: "amber", skills: ["Security", "Legal"] },
];

const trainingActivity = [
  { id: 1, name: "Sarah Chen", dept: "Engineering", path: "Advanced React", progress: 85, activity: "2 hours ago", status: "On Track" },
  { id: 2, name: "Marcus Johnson", dept: "DevOps", path: "Cloud Architecture", progress: 62, activity: "1 day ago", status: "Behind" },
  { id: 3, name: "Priya Patel", dept: "Product", path: "Leadership", progress: 100, activity: "3 days ago", status: "Completed" },
  { id: 4, name: "Ahmed Rahman", dept: "Engineering", path: "Security Compliance", progress: 45, activity: "5 days ago", status: "At Risk" },
  { id: 5, name: "Elena Rossi", dept: "Marketing", path: "Communication", progress: 92, activity: "6 hours ago", status: "On Track" },
  { id: 6, name: "David Kim", dept: "Engineering", path: "Advanced React", progress: 30, activity: "1 week ago", status: "At Risk" },
];

const statusColors: any = { "On Track": "#10B981", Completed: "#3B82F6", Behind: "#F59E0B", "At Risk": "#EF4444" };
const pathColors: any = { blue: { bar: "#3B82F6", bg: "#EFF6FF", fg: "#2563EB" }, purple: { bar: "#8B5CF6", bg: "#F5F3FF", fg: "#7C3AED" }, amber: { bar: "#F59E0B", bg: "#FFFBEB", fg: "#D97706" } };

const EmployeeEnablement: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "flex-end" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>Employee Enablement</Typography>
          <Typography sx={{ color: "#6B7280" }}>Track learning paths, training progress, and professional development</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button sx={{ textTransform: "none", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: "13px", fontWeight: 600, color: "#374151", px: 2 }}>
            Assign Training
          </Button>
          <Button startIcon={<AddOutlined />} sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontSize: "13px", fontWeight: 600, px: 2, "&:hover": { bgcolor: "#0b7a6f" } }}>
            Create Learning Path
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        {enablementStats.map((stat, i) => (
          <Box key={i} sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${stat.color}10`, color: stat.color }}>
                <stat.icon sx={{ fontSize: 24 }} />
              </Box>
              {stat.p < 100 && (
                <Box sx={{ width: 36, height: 36 }}>
                  <svg width="36" height="36" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="14" stroke="#E5E7EB" strokeWidth="3" fill="transparent" />
                    <circle cx="18" cy="18" r="14" stroke={stat.color} strokeWidth="3" fill="transparent" strokeDasharray={88} strokeDashoffset={88 * (1 - stat.p / 100)} strokeLinecap="round" />
                  </svg>
                </Box>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
              <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>{stat.sub}</Typography>
            </Box>
            <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", mt: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Learning Paths + Spotlight */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
        {/* Learning Paths */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Active Learning Paths</Typography>
            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0D9488", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>View All</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            {learningPaths.map((path) => {
              const pc = pathColors[path.color] || pathColors.blue;
              const pct = Math.round((path.completed / path.enrolled) * 100);
              return (
                <Box key={path.id} sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { borderColor: "#0D9488" }, transition: "border-color 0.2s", overflow: "hidden" }}>
                  <Box sx={{ height: 4, bgcolor: pc.bar }} />
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: pc.bg, color: pc.fg }}>
                        <MenuBookOutlined sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#9CA3AF" }}>{path.type}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: "#111827", mb: 1 }}>{path.title}</Typography>
                    <Typography sx={{ fontSize: "11px", color: "#6B7280", mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{path.desc}</Typography>

                    <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                      {[
                        { icon: <MenuBookOutlined sx={{ fontSize: 12 }} />, text: `${path.courses} courses` },
                        { icon: <AccessTimeOutlined sx={{ fontSize: 12 }} />, text: `${path.hours} hours` },
                        { icon: <PeopleOutlined sx={{ fontSize: 12 }} />, text: `${path.enrolled} enrolled` },
                      ].map((m, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.3, fontSize: "9px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>
                          {m.icon} {m.text}
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{path.completed}/{path.enrolled} completed</Typography>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#111827" }}>{pct}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: "#F3F4F6", "& .MuiLinearProgress-bar": { borderRadius: 3, background: "linear-gradient(to right, #0D9488, #34D399)" } }} />
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7 }}>
                      {path.skills.map((s) => (
                        <Chip key={s} label={s} size="small" sx={{ bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "9px", fontWeight: 700, color: "#374151", height: 22 }} />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "flex-end" }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#0D9488", cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3 }}>
                      View Path <ChevronRightOutlined sx={{ fontSize: 14 }} />
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Learning Spotlight */}
        <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", mb: 3, alignSelf: "flex-start" }}>Learning Spotlight</Typography>
          <Box sx={{ position: "relative", mb: 2 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: "#0D9488", fontSize: 24, border: "4px solid #F0FDFA", boxShadow: 3 }}>SC</Avatar>
            <Box sx={{ position: "absolute", bottom: -4, right: -4, bgcolor: "#fff", borderRadius: "50%", p: 0.3, boxShadow: 1, border: "1px solid #E5E7EB" }}>
              <CheckCircleOutlined sx={{ fontSize: 20, color: "#10B981" }} />
            </Box>
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Sarah Chen</Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280", mb: 3, fontWeight: 500 }}>Senior Software Engineer</Typography>

          <Box sx={{ width: 110, height: 110, position: "relative", mb: 3 }}>
            <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="55" cy="55" r="45" stroke="#F3F4F6" strokeWidth="10" fill="transparent" />
              <circle cx="55" cy="55" r="45" stroke="#0D9488" strokeWidth="10" fill="transparent" strokeDasharray={283} strokeDashoffset={283 * (1 - 0.88)} strokeLinecap="round" />
            </svg>
            <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: "26px", fontWeight: 700, color: "#111827" }}>88%</Typography>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 2 }}>Growth</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: "100%", mb: 3 }}>
            <Box sx={{ p: 1.5, bgcolor: "#F9FAFB", borderRadius: 3 }}>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", mb: 0.5 }}>Courses</Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>12 / 15</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: "#F9FAFB", borderRadius: 3 }}>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", mb: 0.5 }}>Rank</Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#F59E0B" }}>#3 Org</Typography>
            </Box>
          </Box>

          <Box sx={{ width: "100%", textAlign: "left", mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>Active Path: Advanced React</Typography>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#111827" }}>85%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={85} sx={{ height: 6, borderRadius: 3, bgcolor: "#F3F4F6", "& .MuiLinearProgress-bar": { bgcolor: "#0D9488", borderRadius: 3 } }} />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, width: "100%", mb: 2 }}>
            <Chip label="AWS EXPERT" size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontSize: "8px", fontWeight: 700, letterSpacing: 1, height: 22 }} />
            <Chip label="TEAM LEAD QUAL" size="small" sx={{ bgcolor: "#F5F3FF", color: "#7C3AED", fontSize: "8px", fontWeight: 700, letterSpacing: 1, height: 22 }} />
          </Box>

          <Button fullWidth sx={{ mt: 1, bgcolor: "#F9FAFB", color: "#374151", textTransform: "none", borderRadius: 5, fontWeight: 700, fontSize: "13px", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#fff" } }}>
            View Full Profile
          </Button>
        </Box>
      </Box>

      {/* Training Activity Table */}
      <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB", display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 2 }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Training Activity</Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ position: "relative" }}>
              <SearchOutlined sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 18 }} />
              <InputBase placeholder="Filter employees..." sx={{ bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, pl: 4.5, pr: 2, py: 0.8, fontSize: "13px" }} />
            </Box>
            <IconButton sx={{ border: "1px solid #E5E7EB", borderRadius: 2, color: "#6B7280" }}><FilterListOutlined sx={{ fontSize: 18 }} /></IconButton>
          </Box>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <Box component="tr" sx={{ bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Employee", "Department", "Current Path", "Progress", "Last Activity", "Status", ""].map((h) => (
                  <Box component="th" key={h} sx={{ p: 2, fontSize: "9px", textTransform: "uppercase", fontWeight: 700, color: "#6B7280", letterSpacing: 1, whiteSpace: "nowrap" }}>{h}</Box>
                ))}
              </Box>
            </thead>
            <tbody>
              {trainingActivity.map((row) => (
                <Box component="tr" key={row.id} sx={{ borderBottom: "1px solid #F3F4F6", "&:hover": { bgcolor: "#F0FDFA" }, transition: "background 0.2s", "& .action-buttons": { opacity: 0 }, "&:hover .action-buttons": { opacity: 1 } }}>
                  <Box component="td" sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#0D9488", fontSize: 12 }}>
                        {row.name.split(" ").map((n) => n[0]).join("")}
                      </Avatar>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{row.name}</Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ p: 2 }}><Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{row.dept}</Typography></Box>
                  <Box component="td" sx={{ p: 2 }}><Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>{row.path}</Typography></Box>
                  <Box component="td" sx={{ p: 2, width: 180 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ flex: 1, height: 6, bgcolor: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                        <Box sx={{ height: "100%", width: `${row.progress}%`, bgcolor: "#0D9488" }} />
                      </Box>
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#111827", width: 30 }}>{row.progress}%</Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ p: 2 }}><Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{row.activity}</Typography></Box>
                  <Box component="td" sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: statusColors[row.status] }} />
                      <Typography sx={{ fontSize: "11px", fontWeight: 500, color: "#374151" }}>{row.status}</Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ p: 2, textAlign: "right" }}>
                    <Box className="action-buttons" sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, transition: "opacity 0.2s" }}>
                      <IconButton size="small" sx={{ color: "#6B7280", "&:hover": { color: "#0D9488", bgcolor: "#E6F7F5" } }}><MailOutlined sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" sx={{ color: "#6B7280", "&:hover": { color: "#0D9488", bgcolor: "#E6F7F5" } }}><OpenInNewOutlined sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" sx={{ color: "#6B7280", "&:hover": { color: "#0D9488", bgcolor: "#E6F7F5" } }}><MoreHorizOutlined sx={{ fontSize: 16 }} /></IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </tbody>
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
            Showing <strong style={{ color: "#374151" }}>1-6</strong> of 156 employees
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button disabled size="small" sx={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", border: "1px solid #E5E7EB", textTransform: "none", bgcolor: "#fff", borderRadius: 1 }}>Previous</Button>
            <Button size="small" sx={{ fontSize: "11px", fontWeight: 700, color: "#374151", border: "1px solid #E5E7EB", textTransform: "none", bgcolor: "#fff", borderRadius: 1 }}>Next</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(EmployeeEnablement);
