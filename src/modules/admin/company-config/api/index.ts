export { fetchPlanLimits, fetchPlanLimitById, updatePlanLimits } from "@/store/slices/planLimitsSlice";

import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { CompanyOption, AdminSubscription } from "../types";

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
};
