"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Avatar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  CodeOutlined,
  PsychologyOutlined,
  VerifiedOutlined,
  StarOutlined,
  TrendingUpOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TechSkill {
  name: string;
  ScoreTest: number;
  Levelconfirmed: number;
  proficiencyLevel?: number;
  updatedAt?: string;
}

interface SoftSkill {
  name: string;
  ScoreTest: number;
  Levelconfirmed: number;
  category?: string;
  experienceLevel?: string;
  updatedAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLevelColor = (level: number): string => {
  const map: Record<number, string> = {
    1: "#9CA3AF",
    2: "#FB923C",
    3: "#FBBF24",
    4: "#3B82F6",
    5: "#10B981",
  };
  return map[level] ?? "#9CA3AF";
};

const getLevelBg = (level: number): string => {
  const map: Record<number, string> = {
    1: "#F3F4F6",
    2: "#FFF7ED",
    3: "#FFFBEB",
    4: "#EFF6FF",
    5: "#ECFDF5",
  };
  return map[level] ?? "#F3F4F6";
};

const getLevelLabel = (level: number): string => {
  const map: Record<number, string> = {
    1: "Entry Level",
    2: "Junior",
    3: "Mid Level",
    4: "Senior",
    5: "Expert",
  };
  return map[level] ?? "Not Verified";
};

const getScoreGrade = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: "Excellent", color: "#10B981" };
  if (score >= 60) return { label: "Good", color: "#3B82F6" };
  if (score >= 40) return { label: "Fair", color: "#FBBF24" };
  if (score > 0) return { label: "Beginner", color: "#FB923C" };
  return { label: "Not Tested", color: "#9CA3AF" };
};

// ─── Mock data (shown when profile has no skills) ─────────────────────────────

const MOCK_TECH_SKILLS: TechSkill[] = [
  { name: "React", ScoreTest: 82, Levelconfirmed: 4, updatedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { name: "TypeScript", ScoreTest: 75, Levelconfirmed: 4, updatedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { name: "Node.js", ScoreTest: 68, Levelconfirmed: 3, updatedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { name: "Python", ScoreTest: 55, Levelconfirmed: 3, updatedAt: new Date(Date.now() - 45 * 86400000).toISOString() },
  { name: "Docker", ScoreTest: 40, Levelconfirmed: 2, updatedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
  { name: "GraphQL", ScoreTest: 0, Levelconfirmed: 0, updatedAt: undefined },
];

const MOCK_SOFT_SKILLS: SoftSkill[] = [
  { name: "Communication", ScoreTest: 90, Levelconfirmed: 5, category: "Interpersonal", experienceLevel: "Expert", updatedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { name: "Problem Solving", ScoreTest: 78, Levelconfirmed: 4, category: "Analytical", experienceLevel: "Senior", updatedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { name: "Leadership", ScoreTest: 65, Levelconfirmed: 3, category: "Management", experienceLevel: "Mid Level", updatedAt: new Date(Date.now() - 40 * 86400000).toISOString() },
  { name: "Teamwork", ScoreTest: 88, Levelconfirmed: 5, category: "Interpersonal", experienceLevel: "Expert", updatedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];

// ─── Score Ring SVG ───────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number; level: number; size?: number }> = ({
  score,
  level,
  size = 64,
}) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = score > 0 ? (score / 100) * circ : 0;
  const color = getLevelColor(level);

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>
          {score > 0 ? `${score}%` : "—"}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Skill Card ───────────────────────────────────────────────────────────────

const SkillCardItem: React.FC<{ skill: TechSkill | SoftSkill; index: number }> = ({ skill, index }) => {
  const grade = getScoreGrade(skill.ScoreTest);
  const levelColor = getLevelColor(skill.Levelconfirmed);
  const levelBg = getLevelBg(skill.Levelconfirmed);
  const isVerified = skill.Levelconfirmed > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          p: 2.5,
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          transition: "box-shadow 0.2s, border-color 0.2s",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderColor: levelColor,
          },
        }}
      >
        {/* Score Ring */}
        <ScoreRing score={skill.ScoreTest} level={skill.Levelconfirmed} size={64} />

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75, flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
              {skill.name}
            </Typography>
            {isVerified && (
              <VerifiedOutlined sx={{ fontSize: 15, color: "#10B981" }} />
            )}
          </Box>

          {/* Level badge + grade */}
          <Box sx={{ display: "flex", gap: 1, mb: 1.25, flexWrap: "wrap" }}>
            <Chip
              label={getLevelLabel(skill.Levelconfirmed)}
              size="small"
              sx={{
                bgcolor: levelBg,
                color: levelColor,
                fontWeight: 600,
                fontSize: 11,
                height: 22,
                "& .MuiChip-label": { px: 1 },
              }}
            />
            <Chip
              label={grade.label}
              size="small"
              sx={{
                bgcolor: `${grade.color}15`,
                color: grade.color,
                fontWeight: 500,
                fontSize: 11,
                height: 22,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          </Box>

          {/* Progress bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(Math.max(skill.ScoreTest, 0), 100)}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: "#F3F4F6",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  bgcolor: levelColor,
                },
              }}
            />
            <Typography sx={{ fontSize: 11, color: "#6B7280", flexShrink: 0 }}>
              {skill.ScoreTest > 0 ? `${skill.ScoreTest}/100` : "Not tested"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
}> = ({ icon, label, value, sub, color, bg }) => (
  <Box
    sx={{
      bgcolor: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 3,
      p: 2.5,
      display: "flex",
      alignItems: "center",
      gap: 2,
      flex: "1 1 180px",
    }}
  >
    <Avatar sx={{ bgcolor: bg, color, width: 44, height: 44 }}>{icon}</Avatar>
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.25 }}>{label}</Typography>
      {sub && (
        <Typography sx={{ fontSize: 11, color, fontWeight: 600, mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EmployeeMySkills: React.FC = () => {
  const [tab, setTab] = useState<0 | 1>(0);

  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);

  const techSkills: TechSkill[] =
    profile?.skills && profile.skills.length > 0 ? profile.skills : MOCK_TECH_SKILLS;
  const softSkills: SoftSkill[] =
    profile?.softSkills && profile.softSkills.length > 0 ? profile.softSkills : MOCK_SOFT_SKILLS;

  const allSkills = [...techSkills, ...softSkills];

  // Stats
  const totalSkills = allSkills.length;
  const verifiedSkills = allSkills.filter((s) => s.Levelconfirmed > 0).length;
  const testedSkills = allSkills.filter((s) => s.ScoreTest > 0);
  const avgScore =
    testedSkills.length > 0
      ? Math.round(testedSkills.reduce((acc, s) => acc + s.ScoreTest, 0) / testedSkills.length)
      : 0;
  const expertSkills = allSkills.filter((s) => s.Levelconfirmed >= 4).length;

  const displayedSkills = tab === 0 ? techSkills : softSkills;

  // Category breakdown for soft skills
  const softCategories = useMemo(() => {
    const map: Record<string, number> = {};
    softSkills.forEach((s) => {
      const cat = (s as SoftSkill).category ?? "Other";
      map[cat] = (map[cat] ?? 0) + 1;
    });
    return Object.entries(map);
  }, [softSkills]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
          My Skills
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#6B7280", mt: 0.5 }}>
          Track your technical and soft skill proficiency
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
        <StatCard
          icon={<CodeOutlined sx={{ fontSize: 22 }} />}
          label="Total Skills"
          value={totalSkills}
          color="#0D9488"
          bg="#ECFDF5"
        />
        <StatCard
          icon={<VerifiedOutlined sx={{ fontSize: 22 }} />}
          label="Verified Skills"
          value={verifiedSkills}
          sub={totalSkills > 0 ? `${Math.round((verifiedSkills / totalSkills) * 100)}% verified` : undefined}
          color="#3B82F6"
          bg="#EFF6FF"
        />
        <StatCard
          icon={<StarOutlined sx={{ fontSize: 22 }} />}
          label="Average Score"
          value={avgScore > 0 ? `${avgScore}%` : "—"}
          sub={avgScore >= 70 ? "Above average" : avgScore > 0 ? "Room to grow" : undefined}
          color="#FBBF24"
          bg="#FFFBEB"
        />
        <StatCard
          icon={<WorkspacePremiumOutlined sx={{ fontSize: 22 }} />}
          label="Senior+ Skills"
          value={expertSkills}
          sub={expertSkills > 0 ? "Senior or Expert level" : undefined}
          color="#8B5CF6"
          bg="#F5F3FF"
        />
      </Box>

      {/* Level Legend */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          p: 2,
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mr: 0.5 }}>
          Level scale:
        </Typography>
        {[1, 2, 3, 4, 5].map((lvl) => (
          <Box key={lvl} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: getLevelColor(lvl),
              }}
            />
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
              {getLevelLabel(lvl)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ borderBottom: "1px solid #E5E7EB", px: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              "& .MuiTab-root": { fontSize: 13, fontWeight: 600, textTransform: "none", minWidth: 0, px: 2 },
              "& .Mui-selected": { color: "#0D9488" },
              "& .MuiTabs-indicator": { bgcolor: "#0D9488" },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CodeOutlined sx={{ fontSize: 16 }} />
                  Technical Skills
                  <Chip
                    label={techSkills.length}
                    size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: "#F3F4F6", "& .MuiChip-label": { px: 0.75 } }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <PsychologyOutlined sx={{ fontSize: 16 }} />
                  Soft Skills
                  <Chip
                    label={softSkills.length}
                    size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: "#F3F4F6", "& .MuiChip-label": { px: 0.75 } }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ p: 2.5 }}>
          {/* Soft skills: category chips */}
          {tab === 1 && softCategories.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
              {softCategories.map(([cat, count]) => (
                <Chip
                  key={cat}
                  label={`${cat} (${count})`}
                  size="small"
                  sx={{
                    bgcolor: "#F0FDF4",
                    color: "#065F46",
                    fontWeight: 500,
                    fontSize: 12,
                    border: "1px solid #A7F3D0",
                  }}
                />
              ))}
            </Box>
          )}

          {/* Skills grid */}
          {displayedSkills.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <TrendingUpOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
              <Typography sx={{ color: "#9CA3AF", fontSize: 15 }}>
                No {tab === 0 ? "technical" : "soft"} skills added yet
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              <AnimatePresence mode="popLayout">
                {displayedSkills.map((skill, i) => (
                  <SkillCardItem key={skill.name} skill={skill} index={i} />
                ))}
              </AnimatePresence>
            </Box>
          )}
        </Box>
      </Box>

      {/* Score distribution footer */}
      {testedSkills.length > 0 && (
        <Box
          sx={{
            mt: 3,
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 3,
            p: 2.5,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", mb: 2 }}>
            Score Distribution
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {[
              { label: "Expert (80–100%)", min: 80, max: 100, color: "#10B981" },
              { label: "Good (60–79%)", min: 60, max: 79, color: "#3B82F6" },
              { label: "Fair (40–59%)", min: 40, max: 59, color: "#FBBF24" },
              { label: "Beginner (1–39%)", min: 1, max: 39, color: "#FB923C" },
            ].map(({ label, min, max, color }) => {
              const count = testedSkills.filter((s) => s.ScoreTest >= min && s.ScoreTest <= max).length;
              const pct = Math.round((count / testedSkills.length) * 100);
              return (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: 12, color: "#6B7280", width: 160, flexShrink: 0 }}>
                    {label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#F3F4F6",
                      "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: color },
                    }}
                  />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color, width: 40, textAlign: "right", flexShrink: 0 }}>
                    {count > 0 ? `${count}` : "—"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EmployeeMySkills;
