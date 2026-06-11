import React from "react";
import { Box } from "@mui/material";
import { PostAssessmentData } from "../types";
import CandidateInfoSection from "./hero/CandidateInfoSection";
import ScoreVerdictBadge    from "./hero/ScoreVerdictBadge";
import AnalyticsStrip       from "./hero/AnalyticsStrip";
import RecruiterReviewCard  from "./hero/RecruiterReviewCard";

interface Props {
  g1:            string;
  g2:            string;
  letter:        string;
  name:          string;
  email:         string;
  avatarUrl?:    string;
  bgColor:       string;
  assessment:    PostAssessmentData;
  overallScore:  number;
  verdictColor:  string;
  verdictBg:     string;
  verdictBorder: string;
  verdictLabel:  string;
}

const AssessmentHero: React.FC<Props> = ({
  g1, g2, letter, name, email, avatarUrl, bgColor,
  assessment, overallScore, verdictColor, verdictBg, verdictBorder, verdictLabel,
}) => (
  <Box>
    <Box sx={{ height: 4, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

    <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <CandidateInfoSection
          g1={g1} g2={g2} letter={letter} name={name} email={email}
          avatarUrl={avatarUrl} bgColor={bgColor} assessment={assessment}
        />
        <ScoreVerdictBadge
          overallScore={overallScore}
          verdictColor={verdictColor} verdictBg={verdictBg}
          verdictBorder={verdictBorder} verdictLabel={verdictLabel}
        />
      </Box>
    </Box>

    <AnalyticsStrip analytics={assessment.analytics} />
    <RecruiterReviewCard recruiterReview={assessment.recruiterReview} />

    <Box sx={{ height: "1px", bgcolor: "#F3F4F6" }} />
  </Box>
);

export default AssessmentHero;
