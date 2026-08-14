import { useMemo } from "react";
import { useCombinedQuery } from "../queries";
import type { CombinedData } from "../types";

export function useSubscriptionBanner() {
  const { data, isLoading } = useCombinedQuery();
  const combined = data as CombinedData | undefined;

  const result = useMemo(() => {
    if (!combined?.subscriptions?.length) return null;

    const validSubs = combined.subscriptions.filter((s) => !!s.planName);
    if (!validSubs.length) return null;

    const c           = combined.combined;
    const multiPlan   = validSubs.length > 1;
    const isTrialOnly = !multiPlan && validSubs[0]?.planName === "Trial";
    const planLabel   = c.planNames.filter(Boolean).join(" + ") || validSubs[0]?.planName || "Plan";

    const pct = (used: number, limit: number) =>
      limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    // Severity ladder — mirrors how Vercel/Linear-style usage stats step from
    // neutral -> amber -> red as a limit gets close/exceeded.
    const severity = (usedPct: number, limit: number): "ok" | "warning" | "critical" => {
      if (limit === -1) return "ok";
      if (usedPct >= 100) return "critical";
      if (usedPct >= 80) return "warning";
      return "ok";
    };

    const anyAutoRenewOff = validSubs.some((s) => !s.autoRenew);

    const stats = [
      {
        key:      "posts" as const,
        used:     c.usage.posts.used,
        limit:    c.usage.posts.limit,
        severity: severity(pct(c.usage.posts.used, c.usage.posts.limit), c.usage.posts.limit),
      },
      {
        key:      "interviews" as const,
        used:     c.usage.monthlyInterviews.used,
        limit:    c.usage.monthlyInterviews.limit,
        severity: severity(pct(c.usage.monthlyInterviews.used, c.usage.monthlyInterviews.limit), c.usage.monthlyInterviews.limit),
      },
    ];

    return { c, multiPlan, isTrialOnly, planLabel, stats, anyAutoRenewOff };
  }, [combined]);

  return { isLoading, data: result };
}
