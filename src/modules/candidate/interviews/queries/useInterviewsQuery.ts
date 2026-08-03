import { useQuery } from "@tanstack/react-query";
import { fetchJobInterviews, fetchInterviewReport, fetchSkillAssessmentsByType } from "../api/interviews.api";

export const INTERVIEW_KEYS = {
  all:       ()                                                    => ["candidateInterviews"]                        as const,
  jobList:   ()                                                    => ["candidateInterviews", "jobs"]               as const,
  skillType: (t: "technical" | "soft", limit?: number)            => ["candidateInterviews", "skills", t, limit]   as const,
  report:    (id: string)                                          => ["candidateInterviews", "report", id]         as const,
};

export const useJobInterviewsQuery = () =>
  useQuery({
    queryKey:  INTERVIEW_KEYS.jobList(),
    queryFn:   fetchJobInterviews,
    staleTime: 60_000,
  });

export const useSkillAssessmentsQuery = (skillType: "technical" | "soft", limit?: number) =>
  useQuery({
    queryKey:  INTERVIEW_KEYS.skillType(skillType, limit),
    queryFn:   () => fetchSkillAssessmentsByType({ skillType, limit }),
    staleTime: 60_000,
  });

export const useInterviewReportQuery = (id: string) =>
  useQuery({
    queryKey:  INTERVIEW_KEYS.report(id),
    queryFn:   () => fetchInterviewReport(id),
    enabled:   !!id,
    staleTime: 5 * 60_000,
  });
