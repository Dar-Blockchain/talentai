import React from "react";
import { Box, Typography } from "@mui/material";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";
import Section from "./Section";
import { T, NAVY } from "../utils/constants";

interface CvMatchScoreProps {
  score: number;
  title: string;
  strongLabel: string;
  goodLabel: string;
  lowLabel: string;
  subtitle: (score: number) => string;
}

const CvMatchScore: React.FC<CvMatchScoreProps> = ({ score, title, strongLabel, goodLabel, lowLabel, subtitle }) => {
  const scoreColor = score >= 70 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";
  const r = 34;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(score, 100) / 100) * circ;

  return (
    <Section icon={<BusinessCenterOutlined sx={{ fontSize: 14, color: T }} />} title={title}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box sx={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
          <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={40} cy={40} r={r} fill="none" stroke={`${scoreColor}18`} strokeWidth={7} />
            <circle cx={40} cy={40} r={r} fill="none" stroke={scoreColor} strokeWidth={7}
              strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
          </svg>
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</Typography>
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>
            {score >= 70 ? strongLabel : score >= 50 ? goodLabel : lowLabel}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mt: 0.5 }}>
            {subtitle(score)}
          </Typography>
        </Box>
      </Box>
    </Section>
  );
};

export default CvMatchScore;
