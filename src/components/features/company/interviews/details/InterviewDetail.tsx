import React from "react";
import { Box, Typography, Avatar, Chip, Button, LinearProgress, Divider } from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import { InterviewAssessment, getScore, scoreStyle, fmtDate, fmtDuration } from "../list/InterviewCard";

const PURPLE = "#8310FF";

function pickGradient(str: string) {
  const GRADS = [
    ["#8310FF", "#A855F7"],
    ["#0D9488", "#34D399"],
    ["#0891B2", "#38BDF8"],
    ["#D97706", "#FCD34D"],
    ["#DC2626", "#F87171"],
  ];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return GRADS[Math.abs(h) % GRADS.length];
}

/* Circular score ring */
const ScoreRing: React.FC<{ value: number; color: string; size?: number }> = ({ value, color, size = 96 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(value, 100) / 100) * circ;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <Box sx={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <Typography sx={{ fontSize: size > 80 ? "1.4rem" : "1rem", fontWeight: 800, color, lineHeight: 1 }}>
          {value.toFixed(0)}%
        </Typography>
      </Box>
    </Box>
  );
};

/* Thin progress bar */
const Bar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <LinearProgress
    variant="determinate"
    value={Math.min(value, 100)}
    sx={{
      height: 7, borderRadius: 4,
      bgcolor: `${color}18`,
      "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 },
    }}
  />
);

/* Section header */
const SectionTitle: React.FC<{ icon: React.ReactNode; label: string; color: string }> = ({ icon, label, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: "10px",
      bgcolor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center",
      color, "& svg": { fontSize: 17 },
    }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>{label}</Typography>
  </Box>
);

/* White card */
const Card: React.FC<{ children: React.ReactNode; sx?: object }> = ({ children, sx }) => (
  <Box sx={{
    bgcolor: "#fff", borderRadius: "18px",
    border: "1px solid #F0F0F7",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    p: 2.5,
    ...sx,
  }}>
    {children}
  </Box>
);

/* Stat pill */
const StatPill: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1.5,
    p: 1.5, borderRadius: "12px", bgcolor: "#FAFAFA",
    border: "1px solid #F0F0F7",
  }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
      bgcolor: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center",
      color, "& svg": { fontSize: 18 },
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{value}</Typography>
    </Box>
  </Box>
);

interface InterviewDetailProps {
  assessment: InterviewAssessment;
  onBack: () => void;
}

const InterviewDetail: React.FC<InterviewDetailProps> = ({ assessment, onBack }) => {
  const score           = getScore(assessment);
  const sc              = scoreStyle(score);
  const name            = assessment.candidate?.username || assessment.candidate?.email || "Unknown";
  const email           = assessment.candidate?.email || "";
  const letter          = name[0]?.toUpperCase() || "?";
  const title           = assessment.post?.jobDetails?.title || "Untitled Position";
  const analytics       = assessment.interviewData?.analytics;
  const areas           = assessment.interviewData?.finalReport?.coverage?.areas || {};
  const jd              = assessment.post?.jobDetails;
  const finalReport     = assessment.interviewData?.finalReport;
  const summary         = finalReport?.summary;
  const recommendations = finalReport?.recommendations || [];
  const overallScore    = finalReport?.scores?.overall ?? score;
  const requiredSkills  = assessment.post?.skillAnalysis?.requiredSkills || [];
  const softSkills      = assessment.post?.skillAnalysis?.softSkills || [];
  const [g1, g2]        = pickGradient(email || name);

  return (
    <Box sx={{ pb: 4 }}>

      {/* ── Back ── */}
      <Button
        startIcon={<ArrowBackOutlined />}
        onClick={onBack}
        sx={{
          textTransform: "none", fontWeight: 600, color: "#6B7280",
          fontSize: "0.875rem", borderRadius: "10px", px: 2, mb: 3,
          "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
        }}
      >
        Back to Interviews
      </Button>

      {/* ── HERO BANNER ── */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          <Avatar sx={{
            width: 64, height: 64, fontWeight: 800, fontSize: "1.4rem",
            background: `linear-gradient(135deg, ${g1}, ${g2})`,
            color: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          }}>
            {letter}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#111827", mb: 0.25 }}>
              {name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <EmailOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
              <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>{email}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Chip label={title} size="small" icon={<WorkOutlined style={{ fontSize: 12 }} />}
                sx={{ bgcolor: `${PURPLE}10`, color: PURPLE, fontWeight: 600, fontSize: "11px", height: 24, "& .MuiChip-label": { px: 1 } }} />
              {jd?.location && (
                <Chip label={jd.location} size="small" icon={<LocationOnOutlined style={{ fontSize: 12 }} />}
                  sx={{ bgcolor: "#F1F5F9", color: "#374151", fontWeight: 600, fontSize: "11px", height: 24, "& .MuiChip-label": { px: 1 } }} />
              )}
              <Chip label={fmtDate(assessment.createdAt)} size="small" icon={<CalendarTodayOutlined style={{ fontSize: 12 }} />}
                sx={{ bgcolor: "#F1F5F9", color: "#374151", fontWeight: 600, fontSize: "11px", height: 24, "& .MuiChip-label": { px: 1 } }} />
            </Box>
          </Box>

          {/* Score ring */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
            <ScoreRing value={overallScore} color={sc.color} size={88} />
            <Chip
              label={overallScore >= 70 ? "Passed" : overallScore >= 50 ? "In Review" : "Needs Work"}
              size="small"
              sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 700, fontSize: "11px", height: 22, "& .MuiChip-label": { px: 1.5 } }}
            />
          </Box>
        </Box>
      </Card>

      {/* ── MAIN GRID ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5 }}>

        {/* ── SCORES ── */}
        <Card>
          <SectionTitle icon={<TrendingUpOutlined />} label="Interview Scores" color={PURPLE} />
          <Box sx={{ display: "flex", gap: 3, mb: 2.5, justifyContent: "center" }}>
            <Box sx={{ textAlign: "center" }}>
              <ScoreRing value={overallScore} color={scoreStyle(overallScore).color} size={80} />
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500, mt: 0.75 }}>Overall</Typography>
            </Box>
            {analytics?.coveragePercentage !== undefined && (
              <Box sx={{ textAlign: "center" }}>
                <ScoreRing value={analytics.coveragePercentage} color="#0891B2" size={80} />
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500, mt: 0.75 }}>Coverage</Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Session stats pills */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            {analytics?.duration !== undefined && (
              <StatPill icon={<AccessTimeOutlined />} label="Duration" value={fmtDuration(analytics.duration)} color="#0891B2" />
            )}
            {analytics?.messageCount !== undefined && (
              <StatPill icon={<ChatBubbleOutlineOutlined />} label="Responses" value={String(analytics.messageCount)} color="#10B981" />
            )}
            {jd?.employmentType && (
              <StatPill icon={<WorkOutlined />} label="Employment" value={jd.employmentType} color="#D97706" />
            )}
            {assessment.interviewData?.interviewType && (
              <StatPill
                icon={<PersonOutlined />}
                label="Type"
                value={assessment.interviewData.interviewType.replace(/_/g, " ")}
                color={PURPLE}
              />
            )}
          </Box>
        </Card>

        {/* ── COVERAGE AREAS ── */}
        {Object.keys(areas).length > 0 && (
          <Card>
            <SectionTitle icon={<TrendingUpOutlined />} label="Coverage Areas" color="#0891B2" />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(areas).map(([area, data]: [string, any]) => {
                const pct = data.percentage ?? 0;
                const ac  = scoreStyle(pct);
                return (
                  <Box key={area}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                        {area.replace(/_/g, " ")}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: ac.color }}>{pct}%</Typography>
                        <Chip label={ac.label} size="small" sx={{
                          height: 18, bgcolor: ac.bg, color: ac.color,
                          fontWeight: 700, fontSize: "10px",
                          "& .MuiChip-label": { px: 1 },
                        }} />
                      </Box>
                    </Box>
                    <Bar value={pct} color={ac.color} />
                    {data.indicators?.length > 0 && (
                      <Box sx={{ mt: 1, pl: 0.5 }}>
                        {data.indicators.slice(0, 3).map((ind: any) => (
                          <Box key={ind.name} sx={{ display: "flex", alignItems: "center", gap: 0.75, py: 0.25 }}>
                            <Box sx={{
                              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                              bgcolor: ind.covered ? "#10B981" : "#EF4444",
                            }} />
                            <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                              {ind.evidence?.[0] || ind.name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Card>
        )}

        {/* ── AI SUMMARY ── */}
        {summary && (
          <Card sx={{ gridColumn: { xs: "1", lg: "1 / -1" } }}>
            <SectionTitle icon={<PersonOutlined />} label="AI Assessment Summary" color="#10B981" />
            <Box sx={{
              p: 2, borderRadius: "12px",
              bgcolor: "#F0FDF4", border: "1px solid #D1FAE5",
            }}>
              <Typography sx={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.8 }}>
                {summary}
              </Typography>
            </Box>
          </Card>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {recommendations.length > 0 && (
          <Card>
            <SectionTitle icon={<LightbulbOutlined />} label="Recommendations" color="#F59E0B" />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {recommendations.map((rec: string, i: number) => (
                <Box key={i} sx={{
                  display: "flex", alignItems: "flex-start", gap: 1.5,
                  p: 1.5, borderRadius: "10px", bgcolor: "#FFFBEB",
                  border: "1px solid #FDE68A",
                }}>
                  <CheckCircleOutlined sx={{ color: "#F59E0B", fontSize: 16, mt: 0.15, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "13px", color: "#92400E", lineHeight: 1.6, textTransform: "capitalize" }}>
                    {rec}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        )}

        {/* ── REQUIRED SKILLS ── */}
        {(requiredSkills.length > 0 || softSkills.length > 0) && (
          <Card>
            <SectionTitle icon={<WorkOutlined />} label="Job Required Skills" color="#8B5CF6" />
            {requiredSkills.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: softSkills.length ? 2 : 0 }}>
                {requiredSkills.map((sk: any) => (
                  <Box key={sk._id}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{sk.name}</Typography>
                      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#8B5CF6" }}>{sk.percentage ?? 0}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={sk.percentage ?? 0}
                      sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: "#8B5CF615",
                        "& .MuiLinearProgress-bar": { bgcolor: "#8B5CF6", borderRadius: 3 },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
            {softSkills.length > 0 && (
              <>
                {requiredSkills.length > 0 && <Divider sx={{ mb: 1.5 }} />}
                <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", mb: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Soft Skills
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {softSkills.map((sk: any) => (
                    <Chip key={sk._id} label={sk.name} size="small" sx={{
                      height: 26, bgcolor: "#F5F3FF", color: "#6D28D9",
                      fontWeight: 600, fontSize: "12px", borderRadius: "8px",
                      border: "1px solid #DDD6FE",
                      "& .MuiChip-label": { px: 1.5 },
                    }} />
                  ))}
                </Box>
              </>
            )}
          </Card>
        )}

      </Box>
    </Box>
  );
};

export default InterviewDetail;
