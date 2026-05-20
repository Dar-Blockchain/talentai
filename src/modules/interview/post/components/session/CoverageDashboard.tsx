import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { type Coverage, type CoverageArea } from "../../types/interview";

// ── Helpers ────────────────────────────────────────────────────────────────────

const scoreColor = (pct: number) =>
  pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

const TECH_LABELS: Record<string, string> = {
  reactjs: "ReactJS", nodejs: "Node.js", expressjs: "ExpressJS", nextjs: "Next.js",
  vuejs: "Vue.js", angularjs: "AngularJS", typescript: "TypeScript", javascript: "JavaScript",
  python: "Python", java: "Java", golang: "Go", rust: "Rust", ruby: "Ruby",
  css: "CSS", html: "HTML", html5: "HTML5", css3: "CSS3",
  api: "API", rest: "REST", graphql: "GraphQL", http: "HTTP",
  sql: "SQL", nosql: "NoSQL", mongodb: "MongoDB", postgresql: "PostgreSQL",
  mysql: "MySQL", redis: "Redis", aws: "AWS", gcp: "GCP", azure: "Azure",
  docker: "Docker", kubernetes: "Kubernetes", devops: "DevOps",
  ui: "UI", ux: "UX", oop: "OOP", ai: "AI", ml: "ML",
  blockchain: "Blockchain", web3: "Web3", kotlin: "Kotlin",
  swift: "Swift", flutter: "Flutter",
};

function formatAreaLabel(key: string): string {
  return key
    .split("_")
    .map(w => TECH_LABELS[w.toLowerCase()] ?? (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// ── Component ──────────────────────────────────────────────────────────────────

interface CoverageDashboardProps {
  coverage: Coverage | null;
}

const CoverageDashboard: React.FC<CoverageDashboardProps> = ({ coverage }) => {
  if (!coverage) return null;

  const overall     = Math.round(coverage.overall || 0);
  const areas       = coverage.areas ? Object.entries(coverage.areas) : [];
  const color       = scoreColor(overall);
  const scoreLabel  = overall >= 80 ? "Strong" : overall >= 50 ? "Moderate" : "Needs Work";

  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fff",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        overflow: "hidden",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Coverage
        </Typography>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "0.88rem", color }}>
          {overall}% · {scoreLabel}
        </Typography>
      </Box>

      {/* ── Overall bar ────────────────────────────────────────────────── */}
      <LinearProgress
        variant="determinate"
        value={Math.min(overall, 100)}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: "#f3f4f6",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 2 },
        }}
      />

      {/* ── Topic rows ─────────────────────────────────────────────────── */}
      {areas.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.875 }}>
          {areas.map(([areaName, areaData]: [string, CoverageArea]) => {
            const pct = Math.round(areaData.percentage || 0);
            const c   = scoreColor(pct);
            return (
              <Box key={areaName}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {areaData.label || formatAreaLabel(areaName)}
                  </Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", fontWeight: 700, color: c, flexShrink: 0, ml: 1 }}>
                    {pct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(pct, 100)}
                  sx={{
                    height: 3,
                    borderRadius: 2,
                    bgcolor: "#f3f4f6",
                    "& .MuiLinearProgress-bar": { bgcolor: c, borderRadius: 2, transition: "transform 0.6s ease" },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography sx={{ fontFamily: "Poppins", fontSize: "0.73rem", color: "#d1d5db", textAlign: "center", py: 1.5 }}>
          Topics appear as the interview progresses
        </Typography>
      )}
    </Box>
  );
};

export default CoverageDashboard;
