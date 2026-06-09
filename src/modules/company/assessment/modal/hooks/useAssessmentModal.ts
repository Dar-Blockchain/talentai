import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { scoreStyle, verdictStyle, TEAL, TEAL_BG } from "@/modules/company/assessment/detail/components/constants";
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

export function useAssessmentModal(
  assessment: PostAssessmentData | undefined,
  target: AssessmentTarget | null,
) {
  const { t } = useTranslation("dashboard");

  return useMemo(() => {
    const name   = target?.candidateName  ?? "";
    const email  = target?.candidateEmail ?? "";
    const letter = name[0]?.toUpperCase() || "?";
    const [g1, g2] = pickGradient(email || name);

    const verdict      = assessment?.verdict;
    const overallScore = verdict?.overallScore ?? assessment?.scores?.overall ?? 0;
    const sc           = scoreStyle(overallScore);
    const vs           = verdictStyle(verdict?.recommendation);

    const verdictColor = vs.label ? vs.color : overallScore >= 70 ? TEAL : overallScore >= 50 ? "#D97706" : "#DC2626";
    const verdictBg    = vs.label ? vs.bg    : overallScore >= 70 ? TEAL_BG : overallScore >= 50 ? "#FFFBEB" : "#FEF2F2";
    const verdictBorder = vs.border || verdictColor + "40";
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

    const hasAreas = Object.keys(areas).length > 0;
    const hasAiData = !!(
      aiAssessment?.summary ||
      aiAssessment?.strengths?.length ||
      aiAssessment?.weaknesses?.length ||
      aiAssessment?.keyDecisionFactors?.length ||
      aiAssessment?.hiringRisks?.length ||
      aiAssessment?.developmentAreas?.length ||
      candidateProfile ||
      aiAssessment?.recommendedFocus?.length
    );
    const hasTranscript = conversation.length > 0;

    let idx = 0;
    const TAB_SCORES     = idx++;
    const TAB_COVERAGE   = hasAreas      ? idx++ : -1;
    const TAB_REPORT     = hasAiData     ? idx++ : -1;
    const TAB_TRANSCRIPT = hasTranscript ? idx++ : -1;

    return {
      // candidate identity
      name, email, letter, g1, g2,
      // verdict
      verdict, overallScore,
      verdictColor, verdictBg, verdictBorder, verdictLabel,
      // data sections
      analytics, scores, coverage, areas,
      aiAssessment, requiredSkills, candidateProfile, recruiterReview, conversation,
      // visibility flags
      hasAreas, hasAiData, hasTranscript,
      // tab indices
      TAB_SCORES, TAB_COVERAGE, TAB_REPORT, TAB_TRANSCRIPT,
    };
  }, [assessment, target, t]);
}
