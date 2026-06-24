import { useQuery } from "@tanstack/react-query";
import { adminSkillInterviewApi } from "../api";

export const useAdminSkillAssessmentsQuery = (params: { page: number; limit: number; skill?: string }, enabled = true) =>
  useQuery({
    queryKey: ["admin", "skill-interview-assessments", params],
    queryFn:  () => adminSkillInterviewApi.fetchAssessments(params),
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
