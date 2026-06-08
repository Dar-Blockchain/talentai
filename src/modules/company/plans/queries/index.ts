import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "../api";

export const QUERY_KEYS = {
  plans:    ["plans"] as const,
  combined: ["plans", "combined"] as const,
};

// ─── Queries ──────────────────────────────────────────────

export const usePlansQuery = () =>
  useQuery({
    queryKey:  QUERY_KEYS.plans,
    queryFn:   plansApi.fetchPlans,
    staleTime: 5 * 60 * 1000,
  });

export const useCombinedQuery = () =>
  useQuery({
    queryKey:  QUERY_KEYS.combined,
    queryFn:   plansApi.fetchCombined,
    staleTime: 60 * 1000,
  });

// ─── Mutations ────────────────────────────────────────────
// Callbacks are NOT passed as constructor args (stale closure risk).
// Call mutateAsync at the call site and handle success/error there.

export const useVerifyPaymentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => plansApi.verifyPayment(sessionId),
    onSuccess: () => {
      localStorage.removeItem("pending_payment_id");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.combined });
    },
  });
};

export const useCancelSubscriptionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, reason }: { subscriptionId: string; reason?: string }) =>
      plansApi.cancelSubscription(subscriptionId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.combined }),
  });
};

export const useEnableAutoRenewMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => plansApi.enableAutoRenew(subscriptionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.combined }),
  });
};

export const useCheckoutMutation = () =>
  useMutation({ mutationFn: (planId: string) => plansApi.createCheckoutSession(planId) });
