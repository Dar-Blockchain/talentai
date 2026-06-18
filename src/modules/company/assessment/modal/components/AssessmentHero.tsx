import React from "react";
import { PostAssessmentData } from "../types";
import { VerdictTheme } from "./ui";
import CandidateInfoSection from "./hero/CandidateInfoSection";
import ScoreVerdictBadge    from "./hero/ScoreVerdictBadge";
import AnalyticsStrip       from "./hero/AnalyticsStrip";
import RecruiterReviewCard  from "./hero/RecruiterReviewCard";

interface Props {
  g1:           string;
  g2:           string;
  letter:       string;
  name:         string;
  email:        string;
  avatarUrl?:   string;
  bgColor:      string;
  assessment:   PostAssessmentData;
  overallScore: number;
  vt:           VerdictTheme;
  verdictLabel: string;
}

const AssessmentHero: React.FC<Props> = ({
  g1, g2, letter, name, email, avatarUrl, bgColor,
  assessment, overallScore, vt, verdictLabel,
}) => (
  <div>
    <div className="h-1" style={{ background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

    <div className="px-7 py-5 flex items-center justify-between gap-4">
      <CandidateInfoSection
        letter={letter} name={name} email={email}
        avatarUrl={avatarUrl} bgColor={bgColor} assessment={assessment}
      />
      <ScoreVerdictBadge overallScore={overallScore} vt={vt} verdictLabel={verdictLabel} />
    </div>

    <AnalyticsStrip analytics={assessment.analytics} />
    <RecruiterReviewCard recruiterReview={assessment.recruiterReview} />
  </div>
);

export default AssessmentHero;
