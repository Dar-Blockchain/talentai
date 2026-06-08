import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import type { CandidateDerived } from "../types";
import AppCard from "./AppCard";
import SectionLabel from "./SectionLabel";
import ScoreRing from "./ScoreRing";
import { scoreColor } from "./constants";

interface Props { derived: CandidateDerived }

const OverviewTab: React.FC<Props> = ({ derived }) => {
  const { cvScore, interviewScore, matchLabel, matchReasoning, summary, skills } = derived;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {(cvScore != null || interviewScore != null) && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<TrendingUpOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Scores" />
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {cvScore != null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ScoreRing value={cvScore} size={72} />
                <Box>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>CV Match Score</Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mt: 0.25 }}>
                    {matchLabel || (cvScore >= 70 ? "Strong Candidate" : cvScore >= 50 ? "Moderate Fit" : "Weak Match")}
                  </Typography>
                </Box>
              </Box>
            )}
            {interviewScore != null && (
              <>
                {cvScore != null && <Divider orientation="vertical" flexItem sx={{ borderColor: "#F3F4F6" }} />}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ScoreRing value={interviewScore} size={72} />
                  <Box>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Interview Score</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mt: 0.25 }}>
                      {interviewScore >= 70 ? "Passed" : interviewScore >= 50 ? "In Review" : "Needs Work"}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          {matchReasoning && (
            <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", mt: 2, lineHeight: 1.7, p: 2, bgcolor: "#FAFAFA", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
              {matchReasoning}
            </Typography>
          )}
        </AppCard>
      )}

      {summary && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<PersonOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Professional Summary" />
          <Typography sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8 }}>{summary}</Typography>
        </AppCard>
      )}

      {skills.length > 0 && (
        <AppCard sx={{ p: 3 }}>
          <SectionLabel icon={<CodeOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />} title="Technical Skills" />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {skills.map((s) => (
              <Chip key={s} label={s} size="small"
                sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#374151", borderRadius: "7px" }} />
            ))}
          </Box>
        </AppCard>
      )}
    </Box>
  );
};

export default OverviewTab;
