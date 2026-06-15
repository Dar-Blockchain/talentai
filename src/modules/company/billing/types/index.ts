export type { Payment, CombinedSubscriptionDetails } from "@/store/slices/paymentSlice";

export interface CompanySubscriptionSummary {
  id: string;
  paymentId?: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  cancelledAt?: string;
}
