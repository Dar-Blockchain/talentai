import { useMemo } from "react";
import { useRouter } from "next/router";
import { useAssessmentDetailQuery } from "../queries";
import type { AssessmentDerived } from "../types";

export function useAssessmentDetail() {
  const router = useRouter();
  const id     = router.isReady ? (router.query.id as string | undefined) : undefined;

  const { data, isLoading: loading, isError } = useAssessmentDetailQuery(id);

  const assessment = data?.assessment ?? null;
  const stepsData  = data?.stepsData  ?? null;

  const derived = useMemo<AssessmentDerived | null>(() => {
    if (!assessment) return null;

    const finalReport = assessment.interviewData?.finalReport ?? {};
    const analytics   = assessment.interviewData?.analytics   ?? {};

    return {
      candidateName:       assessment.candidate?.username || "Unknown Candidate",
      jobTitle:            assessment.post?.jobDetails?.title || "Unknown Job",
      interviewType:       assessment.interviewData?.interviewType || "HR_INTERVIEW",
      coverageScore:       finalReport.coverage?.overall ?? 0,
      coverageAreas:       finalReport.coverage?.areas   ?? {},
      aiAnalysis:          finalReport.aiAnalysis         ?? {},
      summary:             finalReport.summary            ?? "",
      recommendations:     finalReport.recommendations   ?? [],
      requiredSkills:      assessment.post?.skillAnalysis?.requiredSkills ?? [],
      softSkills:          assessment.post?.skillAnalysis?.softSkills     ?? [],
      jobDescription:      assessment.post?.jobDetails?.description       ?? "",
      jobRequirements:     assessment.post?.jobDetails?.requirements,
      jobResponsibilities: assessment.post?.jobDetails?.responsibilities,
      analytics,
      timestamp: assessment.createdAt
        ? new Date(assessment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "—",
    };
  }, [assessment]);

  return { id, assessment, stepsData, loading, isError, derived };
}
