export { fetchPlanLimits, fetchPlanLimitById, updatePlanLimits } from "@/store/slices/planLimitsSlice";

import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import { CompanyOption, AdminSubscription, CompanySubscriptionsPage, PlanFormValues } from "../types";

export const adminSubscriptionApi = {
  searchCompanies: (search: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/subscriptions/companies", { params: { search } });
        return (data?.data ?? []) as CompanyOption[];
      },
      "Failed to search companies.",
    ),

  create: (payload: { companyProfileId: string; planId: string; startDate?: string; notes?: string }) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.post("dashboard/subscriptions", payload);
        return data?.data as AdminSubscription;
      },
      "Failed to create subscription.",
    ),

  fetchCompaniesWithSubscriptions: (params: { search?: string; page?: number; limit?: number }) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/subscriptions/companies-with-status", { params });
        return {
          data: data?.data ?? [],
          total: data?.total ?? 0,
          page: data?.page ?? 1,
          limit: data?.limit ?? 20,
        } as CompanySubscriptionsPage;
      },
      "Failed to load companies.",
    ),
};

export const adminPlanApi = {
  createPlan: (payload: PlanFormValues) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.post("dashboard/plans", payload);
        return data?.data as PlanLimit;
      },
      "Failed to create plan.",
    ),

  // Backend updates by plan name, not _id — name itself is immutable once created.
  updatePlan: (name: string, updates: Partial<Omit<PlanFormValues, "name">>) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.put("dashboard/plans", { name, ...updates });
        return data?.data as PlanLimit;
      },
      "Failed to update plan.",
    ),
};
