import React from "react";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import MilitaryTechOutlined from "@mui/icons-material/MilitaryTechOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import MoreHorizOutlined from "@mui/icons-material/MoreHorizOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ArrowUpwardOutlined from "@mui/icons-material/ArrowUpwardOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const kpiData = [
  { label: "Workforce Skill Index", value: "72/100", trend: "+5pts", up: true, icon: MilitaryTechOutlined, color: "#0D9488" },
  { label: "Assessment Pass Rate", value: "82%", trend: "+3%", up: true, icon: CheckCircleOutlined, color: "#3B82F6" },
  { label: "Training ROI", value: "3.2x", trend: "+0.4x", up: true, icon: TrendingUpOutlined, color: "#8B5CF6" },
  { label: "Skills Gap Reduction", value: "-18%", trend: "Improvement", up: true, icon: TrendingUpOutlined, color: "#10B981" },
  { label: "Credential Verifications", value: "234", trend: "+45", up: true, icon: DescriptionOutlined, color: "#F59E0B" },
];

const radarData = [
  { subject: "Technical", Engineering: 95, Marketing: 40, Product: 70, Sales: 30, fullMark: 100 },
  { subject: "Communication", Engineering: 60, Marketing: 95, Product: 85, Sales: 90, fullMark: 100 },
  { subject: "Leadership", Engineering: 50, Marketing: 70, Product: 80, Sales: 75, fullMark: 100 },
  { subject: "Problem Solving", Engineering: 90, Marketing: 60, Product: 90, Sales: 70, fullMark: 100 },
  { subject: "Domain Knowledge", Engineering: 85, Marketing: 80, Product: 95, Sales: 85, fullMark: 100 },
  { subject: "Collaboration", Engineering: 75, Marketing: 90, Product: 85, Sales: 95, fullMark: 100 },
];

const trendData = [
  { name: "Sep", technical: 65, soft: 70, overall: 68 },
  { name: "Oct", technical: 68, soft: 72, overall: 70 },
  { name: "Nov", technical: 72, soft: 75, overall: 73 },
  { name: "Dec", technical: 70, soft: 78, overall: 74 },
  { name: "Jan", technical: 78, soft: 80, overall: 79 },
  { name: "Feb", technical: 85, soft: 82, overall: 83 },
];

const pathData = [
  { name: "Adv React", completed: 65, inProgress: 25, notStarted: 10 },
  { name: "Cloud Arch", completed: 45, inProgress: 40, notStarted: 15 },
  { name: "Leadership", completed: 82, inProgress: 10, notStarted: 8 },
  { name: "Security", completed: 91, inProgress: 5, notStarted: 4 },
  { name: "Product Mgmt", completed: 55, inProgress: 35, notStarted: 10 },
];

const reports = [
  { name: "Q4 2025 Skills Audit", type: "Skills Matrix", date: "Jan 5, 2026", period: "Oct–Dec 2025", status: "Ready" },
  { name: "Annual Training Report", type: "Training", date: "Jan 10, 2026", period: "2025", status: "Ready" },
  { name: "Engineering Dept Review", type: "Department", date: "Jan 20, 2026", period: "Q4 2025", status: "Generating" },
];

const AnalyticsReporting = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "flex-end" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "30px", fontWeight: 700, color: "#111827" }}>Analytics & Reports</Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "14px" }}>Comprehensive data visualization of workforce development metrics</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<CalendarTodayOutlined sx={{ fontSize: 16 }} />}
            endIcon={<KeyboardArrowDownOutlined sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              borderColor: "#E5E7EB",
              borderRadius: "8px",
              px: 2,
              "&:hover": { bgcolor: "#F9FAFB", borderColor: "#E5E7EB" },
            }}
          >
            Last 30 Days
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              borderColor: "#E5E7EB",
              borderRadius: "20px",
              px: 2,
              "&:hover": { bgcolor: "#fff", borderColor: "#E5E7EB" },
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 600,
              bgcolor: "#0D9488",
              borderRadius: "20px",
              px: 2,
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              "&:hover": { bgcolor: "#0b7a6f" },
            }}
          >
            Schedule Report
          </Button>
        </Box>
      </Box>

      {/* KPI Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(5, 1fr)" }, gap: 2 }}>
        {kpiData.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Box
              sx={{
                bgcolor: "#fff",
                p: 2.5,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  width: "fit-content",
                  borderRadius: "8px",
                  mb: 1.5,
                  bgcolor: `${kpi.color}10`,
                  color: kpi.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <kpi.icon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
                {kpi.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>{kpi.value}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <ArrowUpwardOutlined sx={{ fontSize: 12, color: "#10B981" }} />
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#10B981" }}>{kpi.trend}</Typography>
                </Box>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Charts Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        {/* Radar Chart - Skills Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>Skills Distribution by Department</Typography>
              <Select
                defaultValue="all"
                variant="standard"
                disableUnderline
                sx={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", "& .MuiSelect-select": { p: 0, pr: 2 } }}
              >
                <MenuItem value="all" sx={{ fontSize: "12px" }}>All Departments</MenuItem>
                <MenuItem value="engineering" sx={{ fontSize: "12px" }}>Engineering</MenuItem>
                <MenuItem value="marketing" sx={{ fontSize: "12px" }}>Marketing</MenuItem>
              </Select>
            </Box>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600, fill: "#6B7280" }} />
                  <Radar name="Engineering" dataKey="Engineering" stroke="#0D9488" fill="#0D9488" fillOpacity={0.3} />
                  <Radar name="Marketing" dataKey="Marketing" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  <Radar name="Product" dataKey="Product" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 20 }} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </motion.div>

        {/* Area Chart - Assessment Scores Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>Assessment Scores Trend</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0D9488" }} />
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#0D9488" }}>Tech</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#8B5CF6" }} />
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#8B5CF6" }}>Soft</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSoft" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: "#9CA3AF" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: "#9CA3AF" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Area type="monotone" dataKey="technical" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorTech)" />
                  <Area type="monotone" dataKey="soft" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSoft)" />
                  <Line type="monotone" dataKey="overall" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </motion.div>

        {/* Stacked Bar Chart - Training Completion by Path */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "14px", mb: 3 }}>Training Completion by Path</Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pathData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#374151" }} width={80} />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#0D9488" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="notStarted" stackId="a" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 20 }} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </motion.div>

        {/* Bar Chart - Employee Growth & Credentials */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "14px", mb: 3 }}>Employee Growth & Credentials</Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: "#9CA3AF" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: "#9CA3AF" }} />
                  <Tooltip />
                  <Bar dataKey="technical" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={30} />
                  <Line type="monotone" dataKey="overall" stroke="#111827" strokeWidth={2} dot={{ r: 4, fill: "#111827" }} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Reports Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Box sx={{ bgcolor: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>Generated Reports</Typography>
            <Typography
              component="button"
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#0D9488",
                cursor: "pointer",
                background: "none",
                border: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Generate New Report
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F9FAFB" }}>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E5E7EB" }}>
                    Report Name
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E5E7EB" }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E5E7EB" }}>
                    Generated
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E5E7EB" }}>
                    Period
                  </TableCell>
                  <TableCell sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E5E7EB" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #E5E7EB" }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report, i) => (
                  <TableRow
                    key={i}
                    sx={{
                      "&:hover": { bgcolor: "#F0FDFA" },
                      transition: "background-color 0.15s",
                      "& .action-buttons": { opacity: 0, transition: "opacity 0.15s" },
                      "&:hover .action-buttons": { opacity: 1 },
                    }}
                  >
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <DescriptionOutlined sx={{ fontSize: 16, color: "#6B7280" }} />
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{report.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 2 }}>
                      <Chip
                        label={report.type}
                        size="small"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          bgcolor: "#F3F4F6",
                          color: "#6B7280",
                          height: 22,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 2 }}>
                      <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{report.date}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 2 }}>
                      <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{report.period}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        {report.status === "Ready" ? (
                          <CheckCircleOutlined sx={{ fontSize: 14, color: "#10B981" }} />
                        ) : (
                          <AccessTimeOutlined sx={{ fontSize: 14, color: "#F59E0B", animation: "spin 2s linear infinite", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
                        )}
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: report.status === "Ready" ? "#10B981" : "#F59E0B" }}>
                          {report.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6", py: 2, textAlign: "right" }}>
                      <Box className="action-buttons" sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5 }}>
                        <Box
                          component="button"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#0D9488",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          Download <DownloadOutlined sx={{ fontSize: 12 }} />
                        </Box>
                        <Box
                          component="button"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#6B7280",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          Share <OpenInNewOutlined sx={{ fontSize: 12 }} />
                        </Box>
                        <MoreHorizOutlined sx={{ fontSize: 16, color: "#9CA3AF", cursor: "pointer" }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </motion.div>
    </Box>
  );
};

export default AnalyticsReporting;
