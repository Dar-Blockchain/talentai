import { useQuery } from "@tanstack/react-query";
import { fetchPaymentHistory, fetchCompanySubscriptions, fetchCombinedDetails } from "../api";

export const BILLING_KEYS = {
  history:       ["billing", "history"]       as const,
  subscriptions: ["billing", "subscriptions"] as const,
  combined:      ["billing", "combined"]      as const,
};

export function usePaymentHistoryQuery() {
  return useQuery({
    queryKey: BILLING_KEYS.history,
    queryFn:  fetchPaymentHistory,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCompanySubscriptionsQuery() {
  return useQuery({
    queryKey: BILLING_KEYS.subscriptions,
    queryFn:  fetchCompanySubscriptions,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCombinedDetailsQuery() {
  return useQuery({
    queryKey: BILLING_KEYS.combined,
    queryFn:  fetchCombinedDetails,
    staleTime: 2 * 60 * 1000,
  });
}
