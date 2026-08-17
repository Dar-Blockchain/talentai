import axiosInstance from "@/utils/axiosInstance";
import axios, { type AxiosError } from "axios";
import type { CombinedData, SubscriptionItem } from "../types";
import type { PlanLimit } from "@/store/slices/planLimitsSlice";

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = (err as AxiosError<{ message?: string; error?: string }>).response?.data;
    return d?.message ?? d?.error ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

async function call<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new Error(extractMessage(err, fallback));
  }
}

export const plansApi = {
  fetchPlans: () =>
    call(async () => {
      const { data } = await axiosInstance.get("plan-limits");
      return (data.data ?? []) as PlanLimit[];
    }, "Failed to load plans."),

  fetchCombined: () =>
    call(async () => {
      const { data } = await axiosInstance.get("subscriptions/combined");
      return data.data as CombinedData;
    }, "Failed to load subscription details."),

  verifyPayment: (sessionId: string) =>
    call(async () => {
      const { data } = await axiosInstance.post("payments/verify", { sessionId });
      return data.data as SubscriptionItem;
    }, "Payment verification failed."),

  cancelSubscription: (subscriptionId: string, reason = "") =>
    call(
      () => axiosInstance.post(`subscriptions/${subscriptionId}/cancel`, { reason }),
      "Failed to cancel subscription.",
    ),

  enableAutoRenew: (subscriptionId: string) =>
    call(
      () => axiosInstance.post(`subscriptions/${subscriptionId}/enable-auto-renew`),
      "Failed to re-enable auto-renewal.",
    ),

  contactEnterprise: (form: { name: string; email: string; company: string; message: string }) =>
    call(
      () => axiosInstance.post("contact", { ...form, plan: "Unlimited" }),
      "Failed to send message.",
    ),

  createCheckoutSession: (planId: string) =>
    call(async () => {
      // window.open must fire synchronously inside the click handler to
      // count as a trusted user gesture — opening it here (before the
      // await) and redirecting it once the URL is known avoids the popup
      // blocker that kicks in when window.open runs after a network call.
      // NOTE: "noopener"/"noreferrer" here would make window.open() return
      // null (no reference to redirect later), which defeats the whole
      // point — omit them on this call specifically.
      const checkoutWindow = window.open("", "_blank");
      try {
        const { data } = await axiosInstance.post("stripe/create-checkout-session", { planId });
        const { url, sessionId, paymentId } = data;
        if (!url) throw new Error("Stripe session URL missing.");
        if (paymentId) localStorage.setItem("pending_payment_id", paymentId);
        if (checkoutWindow && !checkoutWindow.closed) {
          checkoutWindow.opener = null; // sever the opener link before navigating away, same mitigation noopener would've given
          checkoutWindow.location.href = url;
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
        return { url, sessionId, paymentId } as { url: string; sessionId: string; paymentId: string };
      } catch (err) {
        checkoutWindow?.close();
        throw err;
      }
    }, "Failed to start checkout. Please try again."),
};
