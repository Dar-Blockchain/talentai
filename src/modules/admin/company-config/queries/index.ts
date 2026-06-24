export {
  selectPlanLimits,
  selectCurrentPlanLimit,
  selectPlanLimitsLoading,
  selectPlanLimitsError,
  selectPlanLimitsUpdating,
  selectPlanLimitsUpdateError,
} from "@/store/slices/planLimitsSlice";

import { useQuery } from "@tanstack/react-query";
import { adminSubscriptionApi } from "../api";

export const useCompanySearchQuery = (search: string) =>
  useQuery({
    queryKey: ["admin", "companies", search],
    queryFn:  () => adminSubscriptionApi.searchCompanies(search),
    enabled:  search.trim().length > 0,
    staleTime: 30_000,
  });
