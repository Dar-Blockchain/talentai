import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { type Coverage, type CoverageArea } from "../../types/interview";

// ── Helpers ────────────────────────────────────────────────────────────────────

const scoreColor = (pct: number) =>
  pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

const scoreBg = (pct: number) =>
  pct >= 80 ? "rgba(34,197,94,0.08)" : pct >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";

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

  const overall  = Math.round(coverage.overall || 0);
  const areas    = coverage.areas ? Object.entries(coverage.areas) : [];
  const color    = scoreColor(overall);
  const completed = areas.filter(([, d]) =>
    Math.round((d as CoverageArea).percentage || 0) >= 50,
  ).length;

  const scoreLabel =
    overall >= 80 ? "Strong" : overall >= 50 ? "Moderate" : "Needs Work";

  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fff",
        borderRadius: "20px",
        boxShadow: "0 2px 24px rgba(16,69,63,0.07)",
        overflow: "hidden",
        border: "1px solid rgba(106,211,156,0.12)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Gradient accent bar ──────────────────────────────────────────── */}
      <Box
        sx={{
          height: 5,
          background: "linear-gradient(90deg, #6AD39C 0%, #10453F 100%)",
        }}
      />

      <Box sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* ── Section label ────────────────────────────────────────────── */}
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 700,
            fontSize: "0.68rem",
            color: "#b0b8c1",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            mb: 1,
          }}
        >
          Coverage Report
        </Typography>

        {/* ── Overall score card ───────────────────────────────────────── */}
        <Box
          sx={{
            borderRadius: "14px",
            bgcolor: scoreBg(overall),
            border: `1px solid ${color}22`,
            p: "10px 12px",
            mb: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          {/* Big number */}
          <Box sx={{ flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.25 }}>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 800,
                  fontSize: "2rem",
                  color,
                  lineHeight: 1,
                }}
              >
                {overall}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color,
                  lineHeight: 1,
                }}
              >
                %
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: "6px",
                bgcolor: `${color}18`,
                display: "inline-block",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 700,
                  fontSize: "0.6rem",
                  color,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {scoreLabel}
              </Typography>
            </Box>
          </Box>

          {/* Progress + meta */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(overall, 100)}
              sx={{
                height: 7,
                borderRadius: 4,
                bgcolor: `${color}18`,
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, #6AD39C, ${color})`,
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontSize: "0.66rem",
                color: "#9ca3af",
                mt: 0.75,
              }}
            >
              {completed} of {areas.length} topics covered
            </Typography>
          </Box>
        </Box>

        {/* ── Topic rows ───────────────────────────────────────────────── */}
        {areas.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {areas.map(([areaName, areaData]: [string, CoverageArea]) => {
              const pct = Math.round(areaData.percentage || 0);
              const c   = scoreColor(pct);
              return (
                <Box key={areaName}>
                  {/* Name row */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 0.375,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.875, minWidth: 0 }}
                    >
                      {/* Color dot */}
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: c,
                          flexShrink: 0,
                          boxShadow: `0 0 0 2px ${c}22`,
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          color: "#374151",
                          lineHeight: 1.3,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {areaData.label || formatAreaLabel(areaName)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: c,
                        flexShrink: 0,
                        ml: 1,
                      }}
                    >
                      {pct}%
                    </Typography>
                  </Box>

                  {/* Progress bar */}
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(pct, 100)}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: "#f3f4f6",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: c,
                        borderRadius: 3,
                        transition: "transform 0.6s ease",
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {areas.length === 0 && (
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "0.75rem",
              color: "#c4c4c4",
              textAlign: "center",
              lineHeight: 1.6,
              py: 2,
            }}
          >
            Topics will appear as the interview progresses
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CoverageDashboard;
