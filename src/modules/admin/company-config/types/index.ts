export type { PlanLimit } from "@/store/slices/planLimitsSlice";

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
