import { useQuery } from "@tanstack/react-query";
import { adminPostInterviewApi } from "../api";

export const useAdminPostAssessmentsQuery = (params: { page?: number; limit?: number; company?: string }, enabled = true) =>
  useQuery({
    queryKey: ["admin", "post-interview-assessments", params],
    queryFn:  () => adminPostInterviewApi.fetchAssessments(params),
    enabled,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
