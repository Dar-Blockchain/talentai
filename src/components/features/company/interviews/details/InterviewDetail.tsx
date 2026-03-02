import React from "react";
import { Box, Typography, Avatar, Chip, Button, LinearProgress } from "@mui/material";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import RadarOutlined from "@mui/icons-material/RadarOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import { InterviewAssessment, getScore, scoreStyle, fmtDate, fmtDuration } from "../list/InterviewCard";

const PURPLE = "#8310FF";

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7",
  "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8",
  "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
];
function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

/* ── same card shell as EmployeeDetail ── */
const ECard: React.FC<{ children: React.ReactNode; c1: string; c2?: string }> = ({ children, c1, c2 }) => (
  <Box sx={{
    bgcolor: "#fff", borderRadius: "16px",
    border: "1px solid #F1F5F9",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    overflow: "hidden",
  }}>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Box>
);

/* ── same StatCard-style info row as EmployeeDetail ── */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}> = ({ icon, iconColor, label, value, valueColor }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1.5,
    px: 2, py: 1.5, borderRadius: "12px",
    border: "1px solid #F1F5F9", bgcolor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}>
    <Box sx={{
      width: 40, height: 40, borderRadius: 2, flexShrink: 0,
      bgcolor: `${iconColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: iconColor, "& svg": { fontSize: 20 },
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 500, lineHeight: 1.2 }}>
        {label}
      </Typography>
      {typeof value === "string" ? (
        <Typography sx={{
          fontSize: "0.875rem", fontWeight: 700,
          color: valueColor ?? "#111827",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {value}
        </Typography>
      ) : value}
    </Box>
  </Box>
);

/* ── score bar (same as card) ── */
const ScoreBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <LinearProgress
      variant="determinate"
      value={Math.min(value, 100)}
      sx={{
        flex: 1, height: 6, borderRadius: 3,
        bgcolor: `${color}20`,
        "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
      }}
    />
    <Typography sx={{ fontSize: "12px", fontWeight: 700, color, minWidth: 34 }}>
      {value.toFixed(0)}%
    </Typography>
  </Box>
);

interface InterviewDetailProps {
  assessment: InterviewAssessment;
  onBack: () => void;
}

const InterviewDetail: React.FC<InterviewDetailProps> = ({ assessment, onBack }) => {
  const score     = getScore(assessment);
  const sc        = scoreStyle(score);
  const name      = assessment.candidate?.username || assessment.candidate?.email || "Unknown";
  const email     = assessment.candidate?.email || "";
  const letter    = name[0]?.toUpperCase() || "?";
  const title     = assessment.post?.jobDetails?.title || "Untitled Position";
  const analytics = assessment.interviewData?.analytics;
  const areas     = assessment.interviewData?.finalReport?.coverage?.areas || {};
  const jd        = assessment.post?.jobDetails;

  return (
    <Box>
      {/* back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={onBack}
          sx={{
            textTransform: "none", fontWeight: 600, color: "#6B7280", fontSize: "0.875rem",
            "&:hover": { bgcolor: "#F3F4F6", color: "#374151" },
            borderRadius: "10px", px: 2,
          }}
        >
          Back to Interviews
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "300px 1fr" }, gap: 2.5, alignItems: "start" }}>

        {/* ── LEFT: candidate profile card ── */}
        <ECard c1={sc.color} c2={PURPLE}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
            <Avatar sx={{
              width: 52, height: 52, fontWeight: 800, fontSize: "1.2rem", color: "#fff",
              background: `linear-gradient(${pickGradient(email || name)})`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)", border: "2px solid #fff",
            }}>
              {letter}
            </Avatar>

            {/* score badge */}
            <Box sx={{
              px: 1.5, py: 0.75, borderRadius: "10px",
              bgcolor: sc.bg, border: `1px solid ${sc.color}30`,
            }}>
              <Typography sx={{ fontSize: "18px", fontWeight: 800, color: sc.color, lineHeight: 1 }}>
                {score.toFixed(0)}%
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827", mb: 0.25 }}>
            {name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
            <EmailOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email}
            </Typography>
          </Box>

          <ScoreBar value={score} color={sc.color} />

          <Box sx={{ height: "1px", bgcolor: "#F1F5F9", my: 2 }} />

          {/* verdict */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Chip label={sc.label} size="small" sx={{
              fontWeight: 700, fontSize: "11px", height: 24,
              color: sc.color, bgcolor: sc.bg,
              border: `1px solid ${sc.color}25`, borderRadius: "6px",
              "& .MuiChip-label": { px: 1 },
            }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: sc.color }} />
              <Typography sx={{ fontSize: "11px", fontWeight: 600, color: sc.color }}>
                {score >= 70 ? "Passed" : score >= 50 ? "Review" : "Failed"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#F1F5F9", my: 2 }} />

          {/* date */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CalendarTodayOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
              {fmtDate(assessment.createdAt)}
            </Typography>
          </Box>
        </ECard>

        {/* ── RIGHT: info cards ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

          {/* Session Stats */}
          <ECard c1={PURPLE} c2="#A855F7">
            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827", mb: 2 }}>
              Session Stats
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InfoRow icon={<WorkOutlined />}                  iconColor={PURPLE}    label="Job Position"    value={title} />
              {jd?.location && (
                <InfoRow icon={<LocationOnOutlined />}          iconColor="#0891B2"   label="Location"        value={jd.location} />
              )}
              {jd?.employmentType && (
                <InfoRow icon={<BadgeOutlined />}               iconColor="#D97706"   label="Employment Type" value={jd.employmentType} />
              )}
              {analytics?.duration !== undefined && (
                <InfoRow icon={<AccessTimeOutlined />}          iconColor="#0891B2"   label="Duration"        value={fmtDuration(analytics.duration)} />
              )}
              {analytics?.messageCount !== undefined && (
                <InfoRow icon={<ChatBubbleOutlineOutlined />}   iconColor="#10B981"   label="Responses"       value={String(analytics.messageCount)} />
              )}
              {analytics?.coveragePercentage !== undefined && (
                <InfoRow icon={<RadarOutlined />}               iconColor={PURPLE}    label="Coverage"        value={`${analytics.coveragePercentage}%`} />
              )}
              {assessment.interviewData?.interviewType && (
                <InfoRow
                  icon={<BadgeOutlined />}
                  iconColor="#8B5CF6"
                  label="Interview Type"
                  value={
                    <Chip
                      label={assessment.interviewData.interviewType.replace(/_/g, " ")}
                      size="small"
                      sx={{
                        mt: 0.25, bgcolor: `${PURPLE}12`, color: PURPLE,
                        fontWeight: 700, fontSize: "11px", height: 22,
                        textTransform: "capitalize", "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  }
                />
              )}
            </Box>
          </ECard>

          {/* Coverage Areas */}
          {Object.keys(areas).length > 0 && (
            <ECard c1="#0891B2" c2="#22D3EE">
              <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827", mb: 2 }}>
                Coverage Areas
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {Object.entries(areas).map(([area, data]: [string, any]) => {
                  const pct = data.percentage ?? 0;
                  const ac  = scoreStyle(pct);
                  return (
                    <Box key={area}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>
                          {area.replace(/_/g, " ")}
                        </Typography>
                        <Chip label={ac.label} size="small" sx={{
                          height: 20, bgcolor: ac.bg, color: ac.color,
                          fontWeight: 700, fontSize: "10px",
                          "& .MuiChip-label": { px: 1 },
                        }} />
                      </Box>
                      <ScoreBar value={pct} color={ac.color} />
                      {data.indicators?.length > 0 && (
                        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {data.indicators.slice(0, 5).map((ind: any) => (
                            <Chip key={ind.name} label={ind.name} size="small" sx={{
                              height: 20, fontSize: "10px", fontWeight: 500,
                              bgcolor: ind.covered ? "#F0FDF4" : "#FEF2F2",
                              color: ind.covered ? "#10B981" : "#EF4444",
                              "& .MuiChip-label": { px: 1 },
                            }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </ECard>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default InterviewDetail;
