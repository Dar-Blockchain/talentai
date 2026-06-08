import { useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { useApplicationDetailQuery, APPLICATION_QUERY_KEYS } from "../queries";
import type { ApplicationDetail, CandidateDerived } from "../types";

const BASE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return raw.endsWith("/") ? raw : `${raw}/`;
})();

function getCvUrl(app: ApplicationDetail): string | null {
  if (app.profile?.resume) return `${BASE_URL}resume/${app.profile.resume}`;
  if (app.cvAnalysis?.sourceUrl) {
    const src = app.cvAnalysis.sourceUrl;
    return src.startsWith("http") ? src : `${BASE_URL}${src.replace(/^public\//, "")}`;
  }
  return null;
}

export function useApplicationDetail() {
  const router = useRouter();
  const id     = router.query.id as string | undefined;
  const qc     = useQueryClient();

  const { data: app, isLoading: loading } = useApplicationDetailQuery(id);

  // Optimistic update for recruiter decision (avoids a refetch)
  const patchApp = useCallback((patch: Partial<ApplicationDetail>) => {
    if (!id) return;
    qc.setQueryData(APPLICATION_QUERY_KEYS.detail(id), (prev: ApplicationDetail | undefined) =>
      prev ? { ...prev, ...patch } : prev,
    );
  }, [id, qc]);

  const derived = useMemo<CandidateDerived | null>(() => {
    if (!app) return null;

    const profile   = app.profile  ?? {};
    const cv        = app.cvAnalysis ?? {};
    const interview = app.interviewAssessment ?? null;

    const name     = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || cv.name || "Candidate";
    const email    = (profile.userId as any)?.email || profile.contactInformation?.email || cv.email || "";
    const phone    = profile.phone || cv.phone || "";
    const location = profile.contactInformation?.location || cv.location || "";

    const finalReport   = interview?.interviewData?.finalReport ?? {};
    const coverageAreas = finalReport.coverage?.areas ?? {};

    return {
      name,
      email,
      phone,
      location,
      title:          cv.title || "",
      summary:        cv.summary || "",
      skills:         cv.skills || profile.skills?.map((s) => s.name) || [],
      softSkills:     cv.softSkills || profile.softSkills || [],
      experience:     cv.experience || [],
      education:      cv.education || [],
      certifications: cv.certifications || [],
      projects:       cv.projects || [],
      cvScore:        app.matchScore ?? cv.analysisScore ?? null,
      matchReasoning: app.matchReasoning || "",
      matchLabel:     app.matchRecommendation || "",
      breakdown:      app.matchBreakdown || [],
      postTitle:      app.post?.jobDetails?.title || "—",
      status:         (app.status || "visited").toLowerCase(),
      cvUrl:          getCvUrl(app),
      interviewScore:     interview?.interviewData?.finalReport?.scores?.overall ?? null,
      interviewAnalytics: interview?.interviewData?.analytics ?? {},
      finalReport,
      coverageAreas,
      hasCoverage:    Object.keys(coverageAreas).length > 0,
      hasReport:      !!(finalReport.summary || (finalReport.recommendations ?? []).length > 0),
    };
  }, [app]);

  return { id, app: app as ApplicationDetail | undefined, patchApp, loading, derived };
}
