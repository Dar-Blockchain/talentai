export type { PlanLimit } from "@/store/slices/planLimitsSlice";

export interface PlanFormValues {
  name: string;
  postsLimit: number;
  monthlyInterviewLimit: number;
  durationDays: number;
  priceUsd: number;
  description?: string;
  isActive: boolean;
}

export interface CompanyOption {
  profileId: string;
  name: string;
  email: string;
}

export interface AdminSubscription {
  _id: string;
  companyProfileId: string;
  planId: { _id: string; name: string; postsLimit: number; monthlyInterviewLimit: number };
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled" | "suspended";
  autoRenew: boolean;
  notes?: string;
}

export interface CompanySubscriptionSummary {
  id: string;
  planName: string;
  status: "active" | "expired" | "cancelled" | "suspended";
  isActive: boolean;
  startDate: string;
  endDate: string;
  postsUsed: number;
  postsLimit: number | null;
  monthlyInterviewsUsed: number;
  monthlyInterviewLimit: number | null;
  autoRenew: boolean;
}

export interface CompanyWithSubscription {
  profileId: string;
  name: string;
  email: string;
  subscription: CompanySubscriptionSummary;
}

export interface CompanySubscriptionsPage {
  data: CompanyWithSubscription[];
  total: number;
  page: number;
  limit: number;
}
