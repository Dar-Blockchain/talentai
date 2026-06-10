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
      const { data } = await axiosInstance.post("stripe/create-checkout-session", { planId });
      const { url, sessionId, paymentId } = data;
      if (!url) throw new Error("Stripe session URL missing.");
      if (paymentId) localStorage.setItem("pending_payment_id", paymentId);
      window.open(url, "_blank", "noopener,noreferrer");
      return { url, sessionId, paymentId } as { url: string; sessionId: string; paymentId: string };
    }, "Failed to start checkout. Please try again."),
};
