import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSkillInterviewApi } from "../api";

const ADMIN_SKILL_INTERVIEW_QUERY_KEY = ["admin", "skill-interview-assessments"] as const;

export const useAdminSkillAssessmentsQuery = (params: { page: number; limit: number; skill?: string }, enabled = true) =>
  useQuery({
    queryKey: [...ADMIN_SKILL_INTERVIEW_QUERY_KEY, params],
    queryFn:  () => adminSkillInterviewApi.fetchAssessments(params),
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useArchiveSkillAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => adminSkillInterviewApi.archiveAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SKILL_INTERVIEW_QUERY_KEY });
    },
  });
};

export const useUnarchiveSkillAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => adminSkillInterviewApi.unarchiveAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SKILL_INTERVIEW_QUERY_KEY });
    },
  });
};

export const useDeleteSkillAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => adminSkillInterviewApi.deleteAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SKILL_INTERVIEW_QUERY_KEY });
    },
  });
};
