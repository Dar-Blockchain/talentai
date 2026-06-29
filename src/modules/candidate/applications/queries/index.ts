import { useQuery } from "@tanstack/react-query";
import { candidateApplicationsApi } from "../api";

export const APPLICATION_DETAIL_QUERY_KEYS = {
  detail: (id: string) => ["candidate-application", id] as const,
};

export const useApplicationDetailQuery = (id: string | undefined) =>
  useQuery({
    queryKey: APPLICATION_DETAIL_QUERY_KEYS.detail(id ?? ""),
    queryFn:  () => candidateApplicationsApi.getById(id as string),
    enabled:  !!id,
  });
