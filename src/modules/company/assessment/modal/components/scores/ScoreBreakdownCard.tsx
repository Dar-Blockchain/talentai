import React from "react";
import { Box, Typography } from "@mui/material";
import EmojiEventsOutlined     from "@mui/icons-material/EmojiEventsOutlined";
import PsychologyOutlined      from "@mui/icons-material/PsychologyOutlined";
import RecordVoiceOverOutlined from "@mui/icons-material/RecordVoiceOverOutlined";
import SpeedOutlined           from "@mui/icons-material/SpeedOutlined";
import { PostAssessmentData } from "../../types";
import { Bar, SectionLabel } from "../assessmentAtoms";

const SCORE_METRICS = [
  { key: "quality"       as const, label: "Response Quality", color: "#3B82F6", icon: <SpeedOutlined sx={{ fontSize: 15 }} /> },
  { key: "skills"        as const, label: "Skills Match",     color: "#8B5CF6", icon: <EmojiEventsOutlined sx={{ fontSize: 15 }} /> },
  { key: "depth"         as const, label: "Answer Depth",     color: "#F59E0B", icon: <PsychologyOutlined sx={{ fontSize: 15 }} /> },
  { key: "communication" as const, label: "Communication",    color: "#10B981", icon: <RecordVoiceOverOutlined sx={{ fontSize: 15 }} /> },
];

interface Props {
  scores:              PostAssessmentData["scores"] | undefined;
  scoreBreakdownLabel: string;
}

const ScoreBreakdownCard: React.FC<Props> = ({ scores, scoreBreakdownLabel }) => {
  if (!scores || !Object.values(scores).some(v => v != null)) return null;
  return (
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
  );
};

export default ScoreBreakdownCard;
