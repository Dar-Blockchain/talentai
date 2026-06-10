import React from "react";
import { Box } from "@mui/material";
import { PostAssessmentData } from "../types";
import VerdictCard              from "./scores/VerdictCard";
import ScoreRingsSection        from "./scores/ScoreRingsSection";
import ScoreBreakdownCard       from "./scores/ScoreBreakdownCard";
import RequiredSkillsCard       from "./scores/RequiredSkillsCard";
import StrengthsWeaknessesSection from "./scores/StrengthsWeaknessesSection";

interface Props {
  verdict:             PostAssessmentData["verdict"];
  overallScore:        number;
  scores:              PostAssessmentData["scores"] | undefined;
  analytics:           PostAssessmentData["analytics"] | undefined;
  requiredSkills:      PostAssessmentData["requiredSkills"];
  aiAssessment:        PostAssessmentData["aiAssessment"] | undefined;
  verdictColor:        string;
  verdictBg:           string;
  verdictBorder:       string;
  verdictLabel:        string;
  scoreOverallLabel:   string;
  scoreCoverageLabel:  string;
  scoreBreakdownLabel: string;
  strengthsLabel:      string;
  weakAreasLabel:      string;
}

const ScoresTab: React.FC<Props> = ({
  verdict, overallScore, scores, analytics, requiredSkills, aiAssessment,
  verdictColor, verdictBg, verdictBorder, verdictLabel,
  scoreOverallLabel, scoreCoverageLabel, scoreBreakdownLabel, strengthsLabel, weakAreasLabel,
}) => (
  <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
    <VerdictCard verdict={verdict} verdictColor={verdictColor} verdictBg={verdictBg} verdictBorder={verdictBorder} verdictLabel={verdictLabel} />
    <ScoreRingsSection overallScore={overallScore} analytics={analytics ?? undefined} scoreOverallLabel={scoreOverallLabel} scoreCoverageLabel={scoreCoverageLabel} />
    <ScoreBreakdownCard scores={scores} scoreBreakdownLabel={scoreBreakdownLabel} />
    <RequiredSkillsCard requiredSkills={requiredSkills} />
    <StrengthsWeaknessesSection aiAssessment={aiAssessment} strengthsLabel={strengthsLabel} weakAreasLabel={weakAreasLabel} />
  </Box>
);

export default ScoresTab;
