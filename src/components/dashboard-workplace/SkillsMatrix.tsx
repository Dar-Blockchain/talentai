import React, { useState, memo } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Select,
  MenuItem,
  InputBase,
  IconButton,
  Alert,
} from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import GpsFixedOutlined from "@mui/icons-material/GpsFixedOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import ViewListOutlined from "@mui/icons-material/ViewListOutlined";
import { AnimatePresence, motion } from "framer-motion";

const departments = ["All Departments", "Engineering", "Marketing", "Product", "Sales", "Design"];
const skillCategories = ["All", "Development", "Web3", "AI", "Marketing", "QA", "Business", "Soft Skills"];

const employees = [
  { id: 1, name: "Sarah Chen", dept: "Engineering" },
  { id: 2, name: "Marcus Johnson", dept: "DevOps" },
  { id: 3, name: "Priya Patel", dept: "Product" },
  { id: 4, name: "David Kim", dept: "Engineering" },
  { id: 5, name: "Ahmed Rahman", dept: "Engineering" },
  { id: 6, name: "Elena Rossi", dept: "Marketing" },
  { id: 7, name: "Jordan Smith", dept: "Design" },
  { id: 8, name: "Li Na", dept: "Product" },
];

const skills = [
  { name: "React.js", req: 4 },
  { name: "Node.js", req: 3 },
  { name: "Python", req: 4 },
  { name: "TypeScript", req: 4 },
  { name: "Docker", req: 3 },
  { name: "AWS", req: 3 },
  { name: "System Design", req: 5 },
  { name: "Leadership", req: 4 },
  { name: "UI Design", req: 4 },
  { name: "Analytics", req: 3 },
];

const getLevel = (eId: number, sIdx: number) => ((eId * 3 + sIdx * 7) % 5) + 1;

const heatmapColors = ["#F3F4F6", "#D1FAE5", "#6EE7B7", "#34D399", "#0D9488"];

const SkillsMatrix: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);
  const [activeCategory, setActiveCategory] = useState("Development");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "flex-end" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>Skills Matrix</Typography>
          <Typography sx={{ color: "#6B7280" }}>Map, track, and analyze skills across your organization</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button startIcon={<DownloadOutlined />} sx={{ textTransform: "none", border: "1px solid #E5E7EB", borderRadius: 5, fontSize: "13px", fontWeight: 600, color: "#374151", px: 2 }}>
            Export Report
          </Button>
          <Button startIcon={<AddOutlined />} sx={{ textTransform: "none", bgcolor: "#0D9488", color: "#fff", borderRadius: 5, fontSize: "13px", fontWeight: 600, px: 2, "&:hover": { bgcolor: "#0b7a6f" } }}>
            Add Skill Category
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ bgcolor: "#fff", p: 2, borderRadius: 3, border: "1px solid #E5E7EB", display: "flex", flexDirection: { xs: "column", xl: "row" }, alignItems: "center", gap: 3 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <Select defaultValue="All Departments" size="small" sx={{ fontSize: "13px", borderRadius: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}>
            {departments.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: "13px" }}>{d}</MenuItem>)}
          </Select>
          <Box sx={{ display: { xs: "none", xl: "block" }, height: 24, width: 1, bgcolor: "#E5E7EB" }} />
          <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
            {skillCategories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setActiveCategory(cat)}
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  bgcolor: activeCategory === cat ? "#0D9488" : "#F3F4F6",
                  color: activeCategory === cat ? "#fff" : "#374151",
                  "&:hover": { bgcolor: activeCategory === cat ? "#0D9488" : "#E5E7EB" },
                }}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ flex: 1, width: "100%", position: "relative" }}>
          <SearchOutlined sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 18 }} />
          <InputBase
            placeholder="Search skills or employees..."
            sx={{ width: "100%", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, pl: 5, pr: 2, py: 0.8, fontSize: "13px" }}
          />
        </Box>
        <Box sx={{ display: "flex", p: 0.5, bgcolor: "#F3F4F6", borderRadius: 2 }}>
          <IconButton size="small" sx={{ bgcolor: "#fff", boxShadow: 1, color: "#0D9488", borderRadius: 1 }}><GridViewOutlined sx={{ fontSize: 18 }} /></IconButton>
          <IconButton size="small" sx={{ color: "#6B7280", borderRadius: 1 }}><ViewListOutlined sx={{ fontSize: 18 }} /></IconButton>
        </Box>
      </Box>

      {/* Heatmap + Side Panel */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", xl: "row" }, gap: 3 }}>
        {/* Heatmap Table */}
        <Box sx={{ flex: 1, bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto", pb: 2 }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Box component="th" sx={{ p: 1.5, textAlign: "left", position: "sticky", left: 0, bgcolor: "#fff", zIndex: 2, width: 180, minWidth: 180 }}>
                    <Typography sx={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 700, color: "#6B7280", letterSpacing: 1 }}>Employee</Typography>
                  </Box>
                  {skills.map((skill, idx) => (
                    <Box
                      component="th"
                      key={idx}
                      onClick={() => setSelectedSkill(skill)}
                      sx={{ p: 1.5, textAlign: "center", minWidth: 64, cursor: "pointer", borderRadius: "8px 8px 0 0", bgcolor: selectedSkill?.name === skill.name ? "#F0FDFA" : "transparent", transition: "background 0.2s" }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#374151", transform: "rotate(-45deg)", transformOrigin: "bottom left", whiteSpace: "nowrap", mb: 4, ml: 1 }}>
                          {skill.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, fontSize: "9px", fontWeight: 700, color: "#9CA3AF", bgcolor: "#F9FAFB", px: 0.7, py: 0.2, borderRadius: 1, border: "1px solid #E5E7EB" }}>
                          <GpsFixedOutlined sx={{ fontSize: 12 }} /> {skill.req}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <Box component="tr" key={emp.id} sx={{ "&:hover td": { bgcolor: "#F9FAFB" }, transition: "background 0.2s" }}>
                    <Box component="td" sx={{ p: 1.5, position: "sticky", left: 0, bgcolor: "#fff", zIndex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: "#0D9488" }}>
                          {emp.name.split(" ").map((n) => n[0]).join("")}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{emp.name}</Typography>
                          <Typography sx={{ fontSize: "9px", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{emp.dept}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    {skills.map((skill, sIdx) => {
                      const level = getLevel(emp.id, sIdx);
                      const hasGap = level < skill.req;
                      return (
                        <Box
                          component="td"
                          key={sIdx}
                          onClick={() => setSelectedSkill(skill)}
                          sx={{ p: 1, textAlign: "center", bgcolor: selectedSkill?.name === skill.name ? "rgba(240,253,250,0.5)" : "transparent", cursor: "pointer" }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Box
                              sx={{
                                width: 44, height: 44,
                                bgcolor: heatmapColors[level - 1],
                                borderRadius: 1.5,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                position: "relative",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.1)" },
                              }}
                            >
                              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: level > 3 ? "#fff" : "#374151" }}>{level}</Typography>
                              {hasGap && (
                                <Box sx={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: "8px solid #EF4444", borderLeft: "8px solid transparent" }} />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </tbody>
            </Box>
          </Box>
        </Box>

        {/* Right Panel */}
        <Box sx={{ width: { xs: "100%", xl: 300 }, display: "flex", flexDirection: "column", gap: 3 }}>
          <AnimatePresence mode="wait">
            {selectedSkill && (
              <motion.div key={selectedSkill.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: 3, border: "1px solid #E5E7EB" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{selectedSkill.name}</Typography>
                    <Chip label="Development" size="small" sx={{ bgcolor: "#E6F7F5", color: "#0D9488", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", height: 22 }} />
                  </Box>

                  {/* Required Proficiency */}
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>Required Proficiency</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 3 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box key={i} sx={{ width: 28, height: 6, borderRadius: 3, bgcolor: i <= selectedSkill.req ? "#0D9488" : "#E5E7EB" }} />
                    ))}
                    <Typography sx={{ ml: 1, fontSize: "13px", fontWeight: 700, color: "#111827" }}>{selectedSkill.req}/5</Typography>
                  </Box>

                  {/* Avg Team Score */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, bgcolor: "#F9FAFB", borderRadius: 3, mb: 3 }}>
                    <Box>
                      <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Avg Team Score</Typography>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>3.8</Typography>
                        <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>/5</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ width: 44, height: 44 }}>
                      <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="22" cy="22" r="16" stroke="#E5E7EB" strokeWidth="4" fill="transparent" />
                        <circle cx="22" cy="22" r="16" stroke="#0D9488" strokeWidth="4" fill="transparent" strokeDasharray={100} strokeDashoffset={100 * (1 - 3.8 / 5)} strokeLinecap="round" />
                      </svg>
                    </Box>
                  </Box>

                  {/* Level Distribution */}
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, mb: 1.5 }}>Level Distribution</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
                    {[
                      { l: 5, c: 2, p: 25 },
                      { l: 4, c: 3, p: 37.5 },
                      { l: 3, c: 2, p: 25 },
                      { l: 2, c: 1, p: 12.5 },
                      { l: 1, c: 0, p: 0 },
                    ].map((item) => (
                      <Box key={item.l} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#6B7280", width: 16 }}>L{item.l}</Typography>
                        <Box sx={{ flex: 1, height: 6, bgcolor: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                          <Box sx={{ height: "100%", width: `${item.p}%`, bgcolor: "#0D9488" }} />
                        </Box>
                        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#111827", width: 12 }}>{item.c}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Alert severity="error" icon={<WarningAmberOutlined sx={{ fontSize: 16 }} />} sx={{ fontSize: "11px", borderRadius: 2, mb: 2, "& .MuiAlert-message": { fontSize: "11px", fontWeight: 500 } }}>
                    12 employees below required level
                  </Alert>

                  <Button fullWidth sx={{ bgcolor: "#0D9488", color: "#fff", textTransform: "none", borderRadius: 5, fontWeight: 700, fontSize: "13px", mb: 1, "&:hover": { bgcolor: "#0b7a6f" } }} endIcon={<ChevronRightOutlined />}>
                    Launch Assessment
                  </Button>
                  <Button fullWidth sx={{ bgcolor: "#fff", color: "#111827", textTransform: "none", borderRadius: 5, fontWeight: 700, fontSize: "13px", border: "1px solid #E5E7EB" }}>
                    Assign Training
                  </Button>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Growth Opportunity Card */}
          <Box sx={{ bgcolor: "#111827", p: 3, borderRadius: 3, color: "#fff", position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <TrendingUpOutlined sx={{ color: "#34D399", fontSize: 20 }} />
                <Typography sx={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Growth Opportunity</Typography>
              </Box>
              <Typography sx={{ fontSize: "22px", fontWeight: 700, mb: 1 }}>System Design</Typography>
              <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", mb: 3 }}>This skill has the widest gap in the Engineering department (45% vs 80%).</Typography>
              <Button fullWidth sx={{ bgcolor: "#fff", color: "#000", textTransform: "none", borderRadius: 5, fontWeight: 700, fontSize: "13px", "&:hover": { bgcolor: "rgba(255,255,255,0.9)" } }}>
                Create Focus Path
              </Button>
            </Box>
            <Box sx={{ position: "absolute", bottom: -24, right: -24, width: 120, height: 120, bgcolor: "rgba(13,148,136,0.2)", borderRadius: "50%", filter: "blur(20px)" }} />
          </Box>
        </Box>
      </Box>

      {/* Bottom Critical Gaps */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
        {[
          { skill: "Python", gap: "Critical", count: 15, color: "error" as const },
          { skill: "Cloud Arch", gap: "Moderate", count: 8, color: "warning" as const },
          { skill: "Leadership", gap: "Moderate", count: 12, color: "warning" as const },
          { skill: "Web3 Security", gap: "Minor", count: 4, color: "success" as const },
        ].map((item, i) => {
          const chipColors: any = { error: { bg: "#FEF2F2", fg: "#DC2626" }, warning: { bg: "#FFFBEB", fg: "#D97706" }, success: { bg: "#F0FDFA", fg: "#0D9488" } };
          const c = chipColors[item.color];
          return (
            <Box key={i} sx={{ bgcolor: "#fff", p: 2, borderRadius: 3, border: "1px solid #E5E7EB", "&:hover": { borderColor: "#0D9488" }, transition: "border-color 0.2s" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontWeight: 700, color: "#111827" }}>{item.skill}</Typography>
                <Chip label={item.gap} size="small" sx={{ bgcolor: c.bg, color: c.fg, fontSize: "9px", fontWeight: 700, height: 20 }} />
              </Box>
              <Typography sx={{ fontSize: "11px", color: "#6B7280", mb: 2 }}>
                <strong style={{ color: "#111827" }}>{item.count} employees</strong> need improvement
              </Typography>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#0D9488", cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3, "&:hover": { textDecoration: "underline" } }}>
                Create Campaign <AddOutlined sx={{ fontSize: 14 }} />
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default memo(SkillsMatrix);
