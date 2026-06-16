import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { verdictTheme, scoreTheme, VerdictTheme, ScoreTheme } from "../components/ui";
import { PostAssessmentData, AssessmentTarget } from "../types";

function pickGradient(str: string): [string, string] {
  const GRADS: [string, string][] = [
    ["#8310FF", "#A855F7"],
    ["#0D9488", "#34D399"],
    ["#0891B2", "#38BDF8"],
    ["#D97706", "#FCD34D"],
    ["#DC2626", "#F87171"],
  ];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return GRADS[Math.abs(h) % GRADS.length];
}

export type AssessmentModalData = {
  name:   string;
  email:  string;
  letter: string;
  g1:     string;
  g2:     string;
  verdict:      PostAssessmentData["verdict"];
  overallScore: number;
  vt:           VerdictTheme;
  st:           ScoreTheme;
  verdictLabel: string;
  analytics:        PostAssessmentData["analytics"];
  scores:           PostAssessmentData["scores"];
  coverage:         PostAssessmentData["coverage"];
  areas:            Record<string, unknown>;
  aiAssessment:     PostAssessmentData["aiAssessment"];
  requiredSkills:   PostAssessmentData["requiredSkills"];
  candidateProfile: PostAssessmentData["candidateProfile"];
  recruiterReview:  PostAssessmentData["recruiterReview"];
  conversation:     PostAssessmentData["conversation"];
  hasAreas:     boolean;
  hasAiData:    boolean;
  hasTranscript: boolean;
  TAB_SCORES:     number;
  TAB_COVERAGE:   number;
  TAB_REPORT:     number;
  TAB_TRANSCRIPT: number;
};

export function useAssessmentModal(
  assessment: PostAssessmentData | undefined,
  target: AssessmentTarget | null,
): AssessmentModalData {
  const { t } = useTranslation("dashboard");

  return useMemo(() => {
    const name   = target?.candidateName  ?? "";
    const email  = target?.candidateEmail ?? "";
    const letter = name[0]?.toUpperCase() || "?";
    const [g1, g2] = pickGradient(email || name);

    const verdict      = assessment?.verdict;
    const overallScore = verdict?.overallScore ?? assessment?.scores?.overall ?? 0;

    const vt = verdictTheme(verdict?.recommendation, overallScore);
    const st = scoreTheme(overallScore);

    const verdictLabel = verdict?.recommendation
      ? verdict.recommendation.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
      : overallScore >= 70
        ? t("pages.applications.assessment_modal.verdict_passed")
        : overallScore >= 50
          ? t("pages.applications.assessment_modal.verdict_review")
          : t("pages.applications.assessment_modal.verdict_needs_work");

    const analytics        = assessment?.analytics;
    const scores           = assessment?.scores;
    const coverage         = assessment?.coverage;
    const areas            = coverage?.areas || {};
    const aiAssessment     = assessment?.aiAssessment;
    const requiredSkills   = assessment?.requiredSkills;
    const candidateProfile = assessment?.candidateProfile;
    const recruiterReview  = assessment?.recruiterReview;
    const conversation     = assessment?.conversation ?? [];

    const hasAreas     = Object.keys(areas).length > 0;
    const hasAiData    = !!(
      aiAssessment?.summary || aiAssessment?.strengths?.length ||
      aiAssessment?.weaknesses?.length || aiAssessment?.keyDecisionFactors?.length ||
      aiAssessment?.hiringRisks?.length || aiAssessment?.developmentAreas?.length ||
      candidateProfile || aiAssessment?.recommendedFocus?.length
    );
    const hasTranscript = conversation.length > 0;

    let idx = 0;
    const TAB_SCORES     = idx++;
    const TAB_COVERAGE   = hasAreas      ? idx++ : -1;
    const TAB_REPORT     = hasAiData     ? idx++ : -1;
    const TAB_TRANSCRIPT = hasTranscript ? idx++ : -1;

    return {
      name, email, letter, g1, g2,
      verdict, overallScore, vt, st, verdictLabel,
      analytics, scores, coverage, areas,
      aiAssessment, requiredSkills, candidateProfile, recruiterReview, conversation,
      hasAreas, hasAiData, hasTranscript,
      TAB_SCORES, TAB_COVERAGE, TAB_REPORT, TAB_TRANSCRIPT,
    };
  }, [assessment, target, t]);
}
