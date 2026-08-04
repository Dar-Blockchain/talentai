import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { verdictTheme, scoreTheme, VerdictTheme, ScoreTheme } from "../components/ui";
import { avatarColor } from "@/modules/company/applications/components/ApplicationCard";
import { PostAssessmentData, AssessmentTarget, RawAssessmentDocument, AreaData } from "../types";

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
  name:      string;
  email:     string;
  letter:    string;
  g1:        string;
  g2:        string;
  avatarUrl: string | undefined;
  bgColor:   string;
  jobTitle:      string | null;
  interviewType: string | null;
  createdAt:     string;
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
  assessment: RawAssessmentDocument | undefined,
  target: AssessmentTarget | null,
): AssessmentModalData {
  const { t } = useTranslation("dashboard");

  return useMemo(() => {
    const candidate = typeof assessment?.candidate === "object" ? assessment.candidate : null;
    const candidateProfileInfo = candidate?.profile;
    const fetchedName = candidateProfileInfo
      ? `${candidateProfileInfo.firstName ?? ""} ${candidateProfileInfo.lastName ?? ""}`.trim()
      : candidate?.username;

    const name   = fetchedName || target?.candidateName  || "";
    const email  = candidate?.email ?? target?.candidateEmail ?? "";
    const letter = name[0]?.toUpperCase() || "?";
    const [g1, g2] = pickGradient(email || name);

    const avatarUrl = candidateProfileInfo?.user_image
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}uploads/images/${candidateProfileInfo.user_image}`
      : target?.avatarUrl;
    const bgColor = target?.bgColor || avatarColor(name);

    // The backend stores everything under interviewData.finalReport — flatten it here
    // so the rest of this hook (and every tab component) can keep using the simple
    // top-level shape defined by PostAssessmentData.
    const finalReport = assessment?.interviewData?.finalReport;

    const jobTitle = (typeof assessment?.post === "object" ? assessment.post?.jobDetails?.title : null) ?? null;
    const interviewType = assessment?.interviewData?.interviewType ?? null;
    const createdAt = assessment?.createdAt ?? "";

    const verdict = finalReport
      ? {
          recommendation: finalReport.recommendation ?? null,
          overallScore:   finalReport.scores?.overall ?? null,
          reasoning:      finalReport.reasoning ?? null,
        }
      : undefined;
    const overallScore = verdict?.overallScore ?? 0;

    const vt = verdictTheme(verdict?.recommendation, overallScore);
    const st = scoreTheme(overallScore);

    const verdictLabel = verdict?.recommendation
      ? verdict.recommendation.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
      : overallScore >= 70
        ? t("pages.applications.assessment_modal.verdict_passed")
        : overallScore >= 50
          ? t("pages.applications.assessment_modal.verdict_review")
          : t("pages.applications.assessment_modal.verdict_needs_work");

    const analytics = assessment?.interviewData?.analytics;
    const scores    = finalReport?.scores
      ? {
          overall:       finalReport.scores.overall       ?? null,
          quality:       finalReport.scores.quality       ?? null,
          coverage:      finalReport.scores.coverage      ?? null,
          skills:        finalReport.scores.skills        ?? null,
          depth:         finalReport.scores.depth         ?? null,
          communication: finalReport.scores.communication ?? null,
        }
      : undefined;
    const areas: Record<string, AreaData> = finalReport?.coverage?.areas || {};
    const completedAreaNames = Object.entries(areas).filter(([, a]) => a?.completed).map(([name]) => name);

    const strongestAreas   = Object.entries(areas).filter(([, a]) => (a?.percentage ?? 0) >= 70).map(([name]) => name);
    const weakestAreas     = Object.entries(areas).filter(([, a]) => (a?.percentage ?? 0) < 50).map(([name]) => name);
    const recommendedFocus = Object.entries(areas).filter(([, a]) => !a?.completed && (a?.percentage ?? 0) < 60).map(([name]) => name);

    const coverage = finalReport?.coverage
      ? {
          overall: finalReport.coverage.overall ?? null,
          completedAreas: completedAreaNames,
          nextRecommendedArea: weakestAreas[0] ?? null,
          areas,
        }
      : undefined;

    const aiAssessment = finalReport
      ? {
          summary:            finalReport.summary ?? null,
          strengths:          finalReport.strengths ?? [],
          weaknesses:         finalReport.weaknesses ?? [],
          keyDecisionFactors: finalReport.keyDecisionFactors ?? [],
          hiringRisks:        finalReport.hiringRisks ?? [],
          developmentAreas:   finalReport.developmentAreas ?? [],
          strongestAreas,
          weakestAreas,
          recommendedFocus,
        }
      : undefined;

    const requiredSkills   = finalReport?.requiredSkills ?? null;
    const candidateProfile = finalReport?.candidateProfile ?? null;
    const recruiterReview  = assessment?.recruiterFeedback != null || assessment?.recruiterFeedbackAt != null
      ? {
          reviewed:   !!assessment?.recruiterFeedback,
          feedback:   assessment?.recruiterFeedback ?? null,
          reviewedAt: assessment?.recruiterFeedbackAt ?? null,
        }
      : undefined;
    const conversation = assessment?.interviewData?.conversation ?? [];

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
      name, email, letter, g1, g2, avatarUrl, bgColor,
      jobTitle, interviewType, createdAt,
      verdict, overallScore, vt, st, verdictLabel,
      analytics, scores, coverage, areas,
      aiAssessment, requiredSkills, candidateProfile, recruiterReview, conversation,
      hasAreas, hasAiData, hasTranscript,
      TAB_SCORES, TAB_COVERAGE, TAB_REPORT, TAB_TRANSCRIPT,
    };
  }, [assessment, target, t]);
}
