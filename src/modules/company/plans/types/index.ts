import { PlanLimit } from "@/store/slices/planLimitsSlice";

export interface ActiveSubEntry {
  id: string;
  autoRenew: boolean;
}

export type ActiveSubMap = Record<string, ActiveSubEntry>;

export interface DowngradePlan {
  plan: PlanLimit;
  currentSubId: string;
}

export type Snack = (message: string, severity: "success" | "error") => void;

// ─── API response shapes ──────────────────────────────────

export interface SubscriptionItem {
  id: string;
  planName: string;
  autoRenew: boolean;
  startDate: string;
  endDate: string;
}

export interface UsageStat {
  used: number;
  limit: number;
  remaining: number;
}

export interface CombinedUsage {
  posts: UsageStat;
  monthlyInterviews: UsageStat;
}

export interface CombinedMeta {
  planNames: string[];
  daysRemaining: number;
  soonestExpiry: string;
  usage: CombinedUsage;
}

export interface CombinedData {
  subscriptions: SubscriptionItem[];
  combined: CombinedMeta;
}
