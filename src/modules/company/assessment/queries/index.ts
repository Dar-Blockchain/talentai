import { useQuery } from "@tanstack/react-query";
import { assessmentApi } from "../api";

export const ASSESSMENT_QUERY_KEYS = {
  detail: (id: string) => ["company-assessment", "detail", id] as const,
};

export const useAssessmentDetailQuery = (id: string | undefined) =>
  useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.detail(id ?? ""),
    queryFn:  () => assessmentApi.fetchDetail(id!),
    enabled:   !!id,
    staleTime: 60 * 1000,
  });
