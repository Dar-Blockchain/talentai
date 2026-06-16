import React from "react";
import { PostAssessmentData } from "../types";
import { VerdictTheme, ScoreTheme } from "./ui";
import VerdictCard              from "./scores/VerdictCard";
import ScoreRingsSection        from "./scores/ScoreRingsSection";
import ScoreBreakdownCard       from "./scores/ScoreBreakdownCard";
import RequiredSkillsCard       from "./scores/RequiredSkillsCard";
import StrengthsWeaknessesSection from "./scores/StrengthsWeaknessesSection";

interface Props {
  verdict:             PostAssessmentData["verdict"];
  overallScore:        number;
  vt:                  VerdictTheme;
  st:                  ScoreTheme;
  verdictLabel:        string;
  scores:              PostAssessmentData["scores"] | undefined;
  analytics:           PostAssessmentData["analytics"] | undefined;
  requiredSkills:      PostAssessmentData["requiredSkills"];
  aiAssessment:        PostAssessmentData["aiAssessment"] | undefined;
  scoreOverallLabel:   string;
  scoreCoverageLabel:  string;
  scoreBreakdownLabel: string;
  strengthsLabel:      string;
  weakAreasLabel:      string;
}

const ScoresTab: React.FC<Props> = ({
  verdict, overallScore, vt, st, verdictLabel,
  scores, analytics, requiredSkills, aiAssessment,
  scoreOverallLabel, scoreCoverageLabel, scoreBreakdownLabel, strengthsLabel, weakAreasLabel,
}) => (
  <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
    <div className="flex flex-col gap-5">
      <VerdictCard verdict={verdict} vt={vt} verdictLabel={verdictLabel} />
      <ScoreBreakdownCard scores={scores} scoreBreakdownLabel={scoreBreakdownLabel} />
      <StrengthsWeaknessesSection aiAssessment={aiAssessment} strengthsLabel={strengthsLabel} weakAreasLabel={weakAreasLabel} />
    </div>
    <div className="flex flex-col gap-5">
      <ScoreRingsSection overallScore={overallScore} st={st} analytics={analytics} scoreOverallLabel={scoreOverallLabel} scoreCoverageLabel={scoreCoverageLabel} />
      <RequiredSkillsCard requiredSkills={requiredSkills} />
    </div>
  </div>
);

export default ScoresTab;
