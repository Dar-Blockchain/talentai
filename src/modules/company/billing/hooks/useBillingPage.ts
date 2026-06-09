import { useMemo } from "react";
import { usePaymentHistoryQuery, useCompanySubscriptionsQuery, useCombinedDetailsQuery } from "../queries";

export function useBillingPage() {
  const { data: history = [],  isLoading: historyLoading }       = usePaymentHistoryQuery();
  const { data: subscriptions = [] }                             = useCompanySubscriptionsQuery();
  const { data: combined,      isLoading: combinedLoading }      = useCombinedDetailsQuery();

  const subByPaymentId = useMemo(() => {
    const map: Record<string, { status: string; cancelledAt?: string }> = {};
    subscriptions.forEach((s) => {
      if (s.paymentId) map[String(s.paymentId)] = { status: s.status, cancelledAt: s.cancelledAt };
    });
    return map;
  }, [subscriptions]);

  const completedCount = history.filter((p) => p.status === "completed").length;
  const lastPayment    = history[0];

  return {
    history,
    loading: historyLoading,
    combined,
    combinedLoading,
    subByPaymentId,
    completedCount,
    lastPayment,
  };
}
