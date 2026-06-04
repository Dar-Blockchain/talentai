import React from "react";
import { Box, Chip, Divider, Typography } from "@mui/material";
import CancelOutlined          from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlined     from "@mui/icons-material/CheckCircleOutlined";
import EmojiEventsOutlined     from "@mui/icons-material/EmojiEventsOutlined";
import PsychologyOutlined      from "@mui/icons-material/PsychologyOutlined";
import RecordVoiceOverOutlined from "@mui/icons-material/RecordVoiceOverOutlined";
import SpeedOutlined           from "@mui/icons-material/SpeedOutlined";
import { scoreStyle } from "@/components/features/company/interviews/list/InterviewCard";
import { PostAssessmentData } from "../types";
import { Bar, ScoreRing, SectionLabel } from "./assessmentAtoms";

const SCORE_METRICS = [
  { key: "quality"        as const, label: "Response Quality", color: "#3B82F6", icon: <SpeedOutlined sx={{ fontSize: 15 }} /> },
  { key: "skills"         as const, label: "Skills Match",      color: "#8B5CF6", icon: <EmojiEventsOutlined sx={{ fontSize: 15 }} /> },
  { key: "depth"          as const, label: "Answer Depth",      color: "#F59E0B", icon: <PsychologyOutlined sx={{ fontSize: 15 }} /> },
  { key: "communication"  as const, label: "Communication",     color: "#10B981", icon: <RecordVoiceOverOutlined sx={{ fontSize: 15 }} /> },
];

interface Props {
  verdict:            PostAssessmentData["verdict"];
  overallScore:       number;
  scores:             PostAssessmentData["scores"] | undefined;
  analytics:          PostAssessmentData["analytics"] | undefined;
  requiredSkills:     PostAssessmentData["requiredSkills"];
  aiAssessment:       PostAssessmentData["aiAssessment"] | undefined;
  verdictColor:       string;
  verdictBg:          string;
  verdictBorder:      string;
  verdictLabel:       string;
  scoreOverallLabel:    string;
  scoreCoverageLabel:   string;
  scoreBreakdownLabel:  string;
  strengthsLabel:       string;
  weakAreasLabel:       string;
}

const ScoresTab: React.FC<Props> = ({
  verdict, overallScore, scores, analytics, requiredSkills, aiAssessment,
  verdictColor, verdictBg, verdictBorder, verdictLabel,
  scoreOverallLabel, scoreCoverageLabel, scoreBreakdownLabel, strengthsLabel, weakAreasLabel,
}) => {
  const sc = scoreStyle(overallScore);

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>

      {/* Verdict card */}
      {verdict && (
        <Box sx={{ borderRadius: "16px", border: `1.5px solid ${verdictBorder}`, bgcolor: verdictBg, overflow: "hidden" }}>
          <Box sx={{ height: 3, bgcolor: verdictColor }} />
          <Box sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: verdict.reasoning ? 1 : 0 }}>
              <Box sx={{ px: 1.25, py: 0.375, borderRadius: "99px", bgcolor: verdictColor }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>
                  {verdictLabel}
                </Typography>
              </Box>
              {verdict.overallScore != null && (
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: verdictColor }}>
                  {verdict.overallScore.toFixed(0)} / 100
                </Typography>
              )}
            </Box>
            {verdict.reasoning && (
              <Typography sx={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.75 }}>
                {verdict.reasoning}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Score rings */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", py: 2.5, borderRadius: "16px", border: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
          <ScoreRing value={overallScore} color={sc.color} size={92} />
          <Typography sx={{ mt: 1.25, fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {scoreOverallLabel}
          </Typography>
        </Box>
        {analytics?.coveragePercentage !== undefined && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", py: 2.5, borderRadius: "16px", border: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
            <ScoreRing value={analytics.coveragePercentage} color="#0891B2" size={92} />
            <Typography sx={{ mt: 1.25, fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {scoreCoverageLabel}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Score breakdown */}
      {scores && Object.values(scores).some(v => v != null) && (
        <Box sx={{ borderRadius: "16px", border: "1px solid #F3F4F6" }}>
          <Box sx={{ px: 2.5, pt: 2.25, pb: 0.5 }}>
            <SectionLabel>{scoreBreakdownLabel}</SectionLabel>
          </Box>
          <Box sx={{ px: 2.5, pb: 2.5, display: "flex", flexDirection: "column", gap: 1.75 }}>
            {SCORE_METRICS.map(({ key, label, color, icon }) => {
              const val = scores[key];
              if (val == null) return null;
              const pct    = Math.min(Math.round(val), 100);
              const tColor = pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626";
              return (
                <Box key={key}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.875 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Box sx={{ color, display: "flex" }}>{icon}</Box>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{label}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: tColor }}>{pct}%</Typography>
                  </Box>
                  <Bar value={pct} color={color} height={7} />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Required skills */}
      {requiredSkills && requiredSkills.all.length > 0 && (
        <Box sx={{ borderRadius: "16px", border: "1px solid #F3F4F6", px: 2.5, py: 2 }}>
          <SectionLabel>Required Skills</SectionLabel>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {requiredSkills.all.map((skill, i) => {
              const met = requiredSkills.demonstrated.includes(skill);
              return (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.125, py: 0.5, borderRadius: "99px",
                  bgcolor: met ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${met ? "#BBF7D0" : "#FECACA"}` }}>
                  {met
                    ? <CheckCircleOutlined sx={{ fontSize: 12, color: "#10B981" }} />
                    : <CancelOutlined     sx={{ fontSize: 12, color: "#EF4444" }} />}
                  <Typography sx={{ fontSize: "0.73rem", fontWeight: 600, color: met ? "#065F46" : "#991B1B" }}>{skill}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Strongest / weakest areas */}
      {((aiAssessment?.strongestAreas?.length ?? 0) > 0 || (aiAssessment?.weakestAreas?.length ?? 0) > 0) && (
        <>
          <Divider sx={{ borderColor: "#F3F4F6" }} />
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {(aiAssessment?.strongestAreas?.length ?? 0) > 0 && (
              <Box sx={{ flex: 1, bgcolor: "#F0FDF4", borderRadius: "14px", border: "1px solid #BBF7D0", p: 2 }}>
                <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                  {strengthsLabel}
                </Typography>
                {aiAssessment!.strongestAreas.map((a, i) => (
                  <Typography key={i} sx={{ fontSize: "0.8rem", color: "#065F46", textTransform: "capitalize", lineHeight: 1.8 }}>
                    · {a.replace(/_/g, " ")}
                  </Typography>
                ))}
              </Box>
            )}
            {(aiAssessment?.weakestAreas?.length ?? 0) > 0 && (
              <Box sx={{ flex: 1, bgcolor: "#FFF7ED", borderRadius: "14px", border: "1px solid #FED7AA", p: 2 }}>
                <Typography sx={{ fontSize: "0.63rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
                  {weakAreasLabel}
                </Typography>
                {aiAssessment!.weakestAreas.map((a, i) => (
                  <Typography key={i} sx={{ fontSize: "0.8rem", color: "#92400E", textTransform: "capitalize", lineHeight: 1.8 }}>
                    · {a.replace(/_/g, " ")}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ScoresTab;
