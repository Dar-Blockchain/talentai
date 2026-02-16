import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Select,
  MenuItem,
  InputBase,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { motion } from "framer-motion";

const campaignStats = [
  { label: "Total Campaigns", value: "12", icon: DescriptionOutlined, color: "#6B7280" },
  { label: "Active Now", value: "3", icon: AssignmentTurnedInOutlined, color: "#10B981", active: true },
  { label: "Avg. Completion", value: "76%", icon: AccessTimeOutlined, color: "#3B82F6" },
  { label: "Avg. Score", value: "74%", icon: PsychologyOutlined, color: "#8B5CF6" },
];

const campaigns = [
  { id: 1, name: "Q1 Technical Skills Assessment", status: "Active", type: "Technical Skills", typeColor: "blue", skills: ["React.js", "Node.js", "TypeScript", "PostgreSQL"], extraSkills: 3, completed: 78, total: 120, progress: 65, avgScore: 74, passRate: 82, created: "Jan 15, 2026", due: "Feb 15, 2026", remaining: 11 },
  { id: 2, name: "Leadership Skills Eval", status: "Scheduled", type: "Soft Skills", typeColor: "purple", skills: ["Conflict Resolution", "Communication", "Strategic Thinking"], extraSkills: 1, completed: 0, total: 45, progress: 0, avgScore: 0, passRate: 0, created: "Jan 20, 2026", due: "Feb 20, 2026", remaining: 16 },
  { id: 3, name: "Security Compliance Check", status: "Active", type: "Mixed", typeColor: "teal", skills: ["Data Privacy", "OWASP Top 10", "Social Engineering"], extraSkills: 0, completed: 34, total: 60, progress: 57, avgScore: 81, passRate: 95, created: "Jan 10, 2026", due: "Feb 10, 2026", remaining: 6 },
  { id: 4, name: "Annual Culture & Values", status: "Completed", type: "Soft Skills", typeColor: "purple", skills: ["Collaboration", "Adaptability", "Integrity"], extraSkills: 0, completed: 247, total: 247, progress: 100, avgScore: 88, passRate: 100, created: "Dec 01, 2025", due: "Dec 30, 2025", remaining: 0 },
];

const statusColors: any = { Active: { bg: "#F0FDF4", fg: "#16A34A" }, Scheduled: { bg: "#FFFBEB", fg: "#D97706" }, Completed: { bg: "#EFF6FF", fg: "#2563EB" } };
const typeColors: any = { blue: { bg: "#EFF6FF", fg: "#2563EB", border: "#BFDBFE" }, purple: { bg: "#F5F3FF", fg: "#7C3AED", border: "#DDD6FE" }, teal: { bg: "#F0FDFA", fg: "#0D9488", border: "#99F6E4" } };

const AssessmentCampaigns: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "flex-end" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>Assessment Campaigns</Typography>
          <Typography sx={{ color: "#6B7280" }}>Create and manage AI-powered skill assessments for your team</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button startIcon={<DownloadOutlined />} sx={{ textTransform: "none", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: "13px", fontWeight: 600, color: "#374151", px: 2 }}>
            Export Results
          </Button>
          <Button startIcon={<AddOutlined />} sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontSize: "13px", fontWeight: 600, px: 2, "&:hover": { bgcolor: "#0b7a6f" } }}>
            New Campaign
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        {campaignStats.map((stat, i) => (
          <Box key={i} sx={{ bgcolor: "#fff", p: 2.5, borderRadius: 3, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${stat.color}20`, color: stat.color }}>
              <stat.icon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{stat.value}</Typography>
                {stat.active && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981", animation: "pulse 2s infinite", "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } } }} />}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Campaign Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        {campaigns.map((camp) => {
          const sc = statusColors[camp.status] || statusColors.Active;
          const tc = typeColors[camp.typeColor] || typeColors.blue;
          return (
            <motion.div key={camp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s", overflow: "hidden" }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Box>
                      <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                        <Chip label={camp.status} size="small" sx={{ bgcolor: sc.bg, color: sc.fg, fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, height: 22 }} />
                        <Chip label={camp.type} size="small" sx={{ bgcolor: tc.bg, color: tc.fg, fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, height: 22, border: `1px solid ${tc.border}` }} />
                      </Box>
                      <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", mt: 1 }}>{camp.name}</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: "#9CA3AF" }}><MoreVertOutlined /></IconButton>
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 3 }}>
                    {camp.skills.map((s, i) => (
                      <Chip key={i} label={s} size="small" sx={{ bgcolor: "#F3F4F6", color: "#4B5563", fontSize: "10px", fontWeight: 500, height: 24 }} />
                    ))}
                    {camp.extraSkills > 0 && <Chip label={`+${camp.extraSkills} more`} size="small" sx={{ bgcolor: "#F3F4F6", color: "#4B5563", fontSize: "10px", fontWeight: 500, height: 24 }} />}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{camp.completed} / {camp.total} employees completed</Typography>
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#111827" }}>{camp.progress}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={camp.progress}
                      sx={{
                        height: 8, borderRadius: 4, bgcolor: "#F3F4F6",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          background: camp.status === "Completed" ? "linear-gradient(to right, #3B82F6, #60A5FA)" : "linear-gradient(to right, #0D9488, #34D399)",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, pt: 2, borderTop: "1px solid #F3F4F6" }}>
                    {[
                      { label: "Avg Score", value: camp.avgScore > 0 ? `${camp.avgScore}%` : "\u2014", color: "#374151" },
                      { label: "Pass Rate", value: camp.passRate > 0 ? `${camp.passRate}%` : "\u2014", color: "#10B981" },
                      { label: "Created", value: camp.created.split(",")[0], color: "#374151" },
                    ].map((m, i) => (
                      <Box key={i}>
                        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1, mb: 0.5 }}>{m.label}</Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: m.color }}>{m.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ px: 3, py: 2, bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTimeOutlined sx={{ fontSize: 16, color: "#6B7280" }} />
                    <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                      Due: <strong style={{ color: "#374151" }}>{camp.due}</strong>
                    </Typography>
                    {camp.remaining > 0 && <Typography sx={{ fontSize: "11px", color: "#0D9488", fontWeight: 700, ml: 0.5 }}>({camp.remaining} days left)</Typography>}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton size="small" sx={{ color: "#6B7280" }}><NotificationsOutlined sx={{ fontSize: 16 }} /></IconButton>
                    <Button
                      endIcon={<ChevronRightOutlined sx={{ fontSize: 14 }} />}
                      sx={{ bgcolor: "#0D9488", color: "#fff", textTransform: "none", borderRadius: 5, fontSize: "11px", fontWeight: 700, px: 2, py: 0.5, "&:hover": { bgcolor: "#0b7a6f" } }}
                    >
                      View Results
                    </Button>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* Pipeline Config Preview */}
      <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", overflow: "hidden", mt: 2 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB", bgcolor: "rgba(249,250,251,0.5)" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: { xs: 4, md: 6 } }}>
            {[
              { step: 1, label: "Assessment Type", done: true },
              { step: 2, label: "Configure Skills", active: true },
              { step: 3, label: "Assign Employees" },
              { step: 4, label: "Review & Launch" },
            ].map((s, i) => (
              <Box key={i} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, position: "relative" }}>
                <Box
                  sx={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 700, zIndex: 1,
                    bgcolor: s.active ? "#0D9488" : s.done ? "#D1FAE5" : "#E5E7EB",
                    color: s.active ? "#fff" : s.done ? "#16A34A" : "#6B7280",
                  }}
                >
                  {s.done ? <CheckCircleOutlined sx={{ fontSize: 20 }} /> : s.step}
                </Box>
                <Typography sx={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: s.active ? "#0D9488" : "#6B7280", textAlign: "center" }}>
                  {s.label}
                </Typography>
                {i < 3 && <Box sx={{ position: "absolute", top: 16, left: "calc(100% + 8px)", width: 48, height: 1, bgcolor: "#E5E7EB", display: { xs: "none", md: "block" } }} />}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 700, mx: "auto" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", mb: 2 }}>Selected Skills & Proficiency Levels</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {["React.js", "Node.js", "System Design", "AWS"].map((s) => (
              <Chip
                key={s}
                label={s}
                onDelete={() => {}}
                sx={{ bgcolor: "#E6F7F5", color: "#0D9488", fontWeight: 600, fontSize: "13px", border: "1px solid rgba(13,148,136,0.3)", "& .MuiChip-deleteIcon": { color: "#0D9488" } }}
              />
            ))}
            <Button startIcon={<AddOutlined />} sx={{ textTransform: "none", bgcolor: "#F3F4F6", color: "#6B7280", borderRadius: 5, fontSize: "13px", fontWeight: 600, "&:hover": { bgcolor: "#E5E7EB" } }}>
              Add Skill
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 2, mb: 1 }}>Difficulty Level</Typography>
              <Select defaultValue="Mid Level (Intermediate)" size="small" fullWidth sx={{ fontSize: "13px", borderRadius: 2 }}>
                <MenuItem value="Junior (Beginner)" sx={{ fontSize: "13px" }}>Junior (Beginner)</MenuItem>
                <MenuItem value="Mid Level (Intermediate)" sx={{ fontSize: "13px" }}>Mid Level (Intermediate)</MenuItem>
                <MenuItem value="Senior (Expert)" sx={{ fontSize: "13px" }}>Senior (Expert)</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 2, mb: 1 }}>Proficiency Threshold</Typography>
              <Box sx={{ pt: 3, position: "relative" }}>
                <Box sx={{ height: 6, bgcolor: "#E5E7EB", borderRadius: 3, position: "relative" }}>
                  <Box sx={{ position: "absolute", top: 0, left: 0, height: "100%", width: "70%", bgcolor: "#0D9488", borderRadius: 3 }} />
                  <Box sx={{ position: "absolute", top: "50%", left: "70%", transform: "translate(-50%, -50%)", width: 16, height: 16, bgcolor: "#fff", border: "2px solid #0D9488", borderRadius: "50%", boxShadow: 1, cursor: "pointer" }} />
                  <Box sx={{ position: "absolute", top: -24, left: "70%", transform: "translateX(-50%)", bgcolor: "#0D9488", color: "#fff", fontSize: "9px", fontWeight: 700, px: 0.7, py: 0.2, borderRadius: 1 }}>70%</Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", mb: 1 }}>Custom AI Interview Instructions</Typography>
          <InputBase
            multiline
            minRows={4}
            placeholder="e.g., Focus on microservices architecture and system design patterns used in our production environment..."
            sx={{ width: "100%", bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 2, p: 2, fontSize: "13px" }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, mb: 3 }}>
            <InfoOutlined sx={{ fontSize: 14, color: "#6B7280" }} />
            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>Our AI will tailor the interview questions based on these instructions.</Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 2 }}>
            <Button sx={{ textTransform: "none", borderRadius: 5, fontWeight: 700, fontSize: "13px", color: "#374151", border: "1px solid #E5E7EB", px: 3 }}>Back</Button>
            <Button sx={{ textTransform: "none", borderRadius: 5, fontWeight: 700, fontSize: "13px", bgcolor: "#0D9488", color: "#fff", px: 3, boxShadow: "0 4px 14px rgba(13,148,136,0.2)", "&:hover": { bgcolor: "#0b7a6f" } }}>
              Next: Assign Employees
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AssessmentCampaigns;
