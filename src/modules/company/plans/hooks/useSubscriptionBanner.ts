import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCombinedQuery } from "../queries";
import { PLAN_CONFIG } from "../constants";
import type { CombinedData } from "../types";

export function useSubscriptionBanner() {
  const { i18n } = useTranslation("dashboard");
  const { data, isLoading } = useCombinedQuery();
  const combined = data as CombinedData | undefined;

  const result = useMemo(() => {
    if (!combined?.subscriptions?.length) return null;

    const validSubs = combined.subscriptions.filter((s) => !!s.planName);
    if (!validSubs.length) return null;

    const c            = combined.combined;
    const multiPlan    = validSubs.length > 1;
    const primaryColor = PLAN_CONFIG[c.planNames[0]]?.color ?? "#0D9488";
    const dateLocale   = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";

    const fmt = (d: string) =>
      new Date(d).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" });

    const pct = (used: number, limit: number) =>
      limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    const postsPct = pct(c.usage.posts.used, c.usage.posts.limit);
    const intPct   = pct(c.usage.monthlyInterviews.used, c.usage.monthlyInterviews.limit);

    const gradientBar = multiPlan
      ? `linear-gradient(90deg, ${c.planNames.map((n, i) => {
          const col  = PLAN_CONFIG[n]?.color ?? "#0D9488";
          const from = Math.round(i * 100 / c.planNames.length);
          const to   = Math.round((i + 1) * 100 / c.planNames.length);
          return `${col} ${from}%, ${col} ${to}%`;
        }).join(", ")})`
      : primaryColor;

    const bars = [
      {
        key:          "posts",
        pct:          postsPct,
        limit:        c.usage.posts.limit,
        used:         c.usage.posts.used,
        remaining:    c.usage.posts.remaining,
        labelKey:     "pages.subscription.banner.job_posts_used",
        unlimitedKey: "pages.subscription.banner.posts_footer_unlimited",
        remainingKey: "pages.subscription.banner.posts_remaining",
      },
      {
        key:          "interviews",
        pct:          intPct,
        limit:        c.usage.monthlyInterviews.limit,
        used:         c.usage.monthlyInterviews.used,
        remaining:    c.usage.monthlyInterviews.remaining,
        labelKey:     "pages.subscription.banner.interviews_month",
        unlimitedKey: "pages.subscription.banner.interviews_footer_unlimited",
        remainingKey: "pages.subscription.banner.interviews_remaining",
      },
    ];

    return { validSubs, c, multiPlan, primaryColor, gradientBar, bars, fmt };
  }, [combined, i18n.language]);

  return { isLoading, data: result };
}
