import axiosInstance from "@/utils/axiosInstance";
import { Payment, CombinedSubscriptionDetails, CompanySubscription } from "@/store/slices/paymentSlice";

export async function fetchPaymentHistory(): Promise<Payment[]> {
  const res = await axiosInstance.get("payments/user/history");
  return res.data.data || res.data;
}

export async function fetchCompanySubscriptions(): Promise<CompanySubscription[]> {
  const res = await axiosInstance.get("subscriptions/");
  return res.data.data || [];
}

export async function fetchCombinedDetails(): Promise<CombinedSubscriptionDetails> {
  const res = await axiosInstance.get("subscriptions/combined");
  return res.data.data;
}
