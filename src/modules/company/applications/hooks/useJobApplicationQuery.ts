import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "../api";

export function useJobApplicationQuery(applicationId: string | null) {
  return useQuery({
    queryKey: ["jobApplication", applicationId],
    queryFn:  () => applicationsApi.getById(applicationId!),
    enabled:  !!applicationId,
    staleTime: 5 * 60 * 1000,
  });
}
