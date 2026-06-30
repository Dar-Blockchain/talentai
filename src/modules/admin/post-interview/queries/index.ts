import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPostInterviewApi } from "../api";

const ADMIN_POST_INTERVIEW_QUERY_KEY = ["admin", "post-interview-assessments"] as const;

export const useAdminPostAssessmentsQuery = (params: { page?: number; limit?: number; company?: string }, enabled = true) =>
  useQuery({
    queryKey: [...ADMIN_POST_INTERVIEW_QUERY_KEY, params],
    queryFn:  () => adminPostInterviewApi.fetchAssessments(params),
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useArchivePostAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => adminPostInterviewApi.archiveAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_POST_INTERVIEW_QUERY_KEY });
    },
  });
};

export const useUnarchivePostAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => adminPostInterviewApi.unarchiveAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_POST_INTERVIEW_QUERY_KEY });
    },
  });
};

export const useDeletePostAssessmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assessmentId: string) => adminPostInterviewApi.deleteAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_POST_INTERVIEW_QUERY_KEY });
    },
  });
};
