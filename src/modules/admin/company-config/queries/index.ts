export {
  selectPlanLimits,
  selectCurrentPlanLimit,
  selectPlanLimitsLoading,
  selectPlanLimitsError,
  selectPlanLimitsUpdating,
  selectPlanLimitsUpdateError,
} from "@/store/slices/planLimitsSlice";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { adminSubscriptionApi, adminPlanApi, fetchPlanLimits } from "../api";
import { PlanFormValues } from "../types";
import type { AppDispatch } from "@/store/store";

export const useCompanySearchQuery = (search: string) =>
  useQuery({
    queryKey: ["admin", "companies", search],
    queryFn:  () => adminSubscriptionApi.searchCompanies(search),
    enabled:  search.trim().length > 0,
    staleTime: 30_000,
  });

export const useCompanySubscriptionsQuery = (params: { search: string; page: number; limit: number }) =>
  useQuery({
    queryKey: ["admin", "companies-with-status", params],
    queryFn:  () => adminSubscriptionApi.fetchCompaniesWithSubscriptions(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

// Plan limits are Redux-backed (legacy), so a successful create/update
// re-dispatches the Redux thunk to refresh the list — there's no react-query
// cache to invalidate here.
export const useCreatePlanMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: (payload: PlanFormValues) => adminPlanApi.createPlan(payload),
    onSuccess: () => {
      dispatch(fetchPlanLimits());
    },
  });
};

export const useUpdatePlanMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  return useMutation({
    mutationFn: ({ name, updates }: { name: string; updates: Partial<Omit<PlanFormValues, "name">> }) =>
      adminPlanApi.updatePlan(name, updates),
    onSuccess: () => {
      dispatch(fetchPlanLimits());
    },
  });
};
