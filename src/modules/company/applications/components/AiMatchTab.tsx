import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import type { CandidateDerived } from "../types";
import AppCard from "./AppCard";
import SectionLabel from "./SectionLabel";
import ScoreRing from "./ScoreRing";
import BarRow from "./BarRow";
import { scoreColor } from "./constants";

interface Props { derived: CandidateDerived; requiredSkills?: { name: string }[] }

const AiMatchTab: React.FC<Props> = ({ derived, requiredSkills = [] }) => {
  const { cvScore, matchLabel, matchReasoning, breakdown, skills } = derived;
  if (cvScore == null) return null;

  const required      = requiredSkills.map((s) => s.name.toLowerCase());
  const candidateNorm = skills.map((s) => s.toLowerCase());
  const matched = required.filter((r) => candidateNorm.some((c) => c.includes(r) || r.includes(c)));
  const missing = required.filter((r) => !matched.includes(r));
  const showSkills = required.length > 0 && skills.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <AppCard sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <ScoreRing value={cvScore} size={96} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: scoreColor(cvScore), mb: 0.4 }}>
              {matchLabel || (cvScore >= 70 ? "Strong Candidate" : cvScore >= 50 ? "Moderate Fit" : "Weak Match")}
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.7 }}>
              {matchReasoning || (cvScore >= 70
                ? "This candidate's profile aligns well with the job requirements."
                : cvScore >= 50
                ? "This candidate partially meets the role's requirements."
                : "This candidate's profile has limited alignment with the job requirements.")}
            </Typography>
          </Box>
        </Box>
      </AppCard>

      {breakdown.length > 0 && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<TrendingUpOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Score Breakdown" />
          {breakdown.map((c) => (
            <BarRow key={c.key} label={c.label} score={c.score} maxScore={c.maxScore} note={c.note} />
          ))}
          <Box sx={{ pt: 1.5, mt: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Total</Typography>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 900, color: scoreColor(cvScore) }}>
              {breakdown.reduce((a, c) => a + c.score, 0)} / {breakdown.reduce((a, c) => a + c.maxScore, 0)}
            </Typography>
          </Box>
        </AppCard>
      )}

      {showSkills && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<CodeOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Skills Match" />
          {matched.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.75 }}>
                Matched ({matched.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                {matched.map((s) => (
                  <Chip key={s} label={s} size="small"
                    sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600, bgcolor: "#F0FDF4", color: "#16A34A", borderRadius: "6px", border: "1px solid #BBF7D0" }} />
                ))}
              </Box>
            </Box>
          )}
          {missing.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.75 }}>
                Missing ({missing.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                {missing.map((s) => (
                  <Chip key={s} label={s} size="small"
                    sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600, bgcolor: "#FEF2F2", color: "#DC2626", borderRadius: "6px", border: "1px solid #FECACA" }} />
                ))}
              </Box>
            </Box>
          )}
        </AppCard>
      )}
    </Box>
  );
};

export default AiMatchTab;
