export { fetchPlanLimits, fetchPlanLimitById, updatePlanLimits } from "@/store/slices/planLimitsSlice";

import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { CompanyOption, AdminSubscription, CompanySubscriptionsPage } from "../types";

export const adminSubscriptionApi = {
  searchCompanies: (search: string) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("subscriptions/admin/companies", { params: { search } });
        return (data?.data ?? []) as CompanyOption[];
      },
      "Failed to search companies.",
    ),

  create: (payload: { companyProfileId: string; planId: string; startDate?: string; notes?: string }) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.post("subscriptions/admin", payload);
        return data?.data as AdminSubscription;
      },
      "Failed to create subscription.",
    ),

  fetchCompaniesWithSubscriptions: (params: { search?: string; page?: number; limit?: number }) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("subscriptions/admin/companies-with-status", { params });
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
