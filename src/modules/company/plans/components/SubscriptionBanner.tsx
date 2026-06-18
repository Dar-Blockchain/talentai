import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Calendar, Loader2 } from "lucide-react";
import { PLAN_CONFIG } from "../constants";
import { useSubscriptionBanner } from "../hooks/useSubscriptionBanner";
import type { SubscriptionItem } from "../types";

const SubscriptionBanner: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const { isLoading, data } = useSubscriptionBanner();

  if (isLoading) return (
    <div className="mb-6 flex justify-center rounded-2xl border border-gray-100 bg-white p-6">
      <Loader2 size={20} className="animate-spin text-gray-400" />
    </div>
  );
  if (!data) return null;

  const { validSubs, c, multiPlan, primaryColor, gradientBar, bars, fmt } = data;

  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border-[1.5px] bg-white"
      style={{ borderColor: `${primaryColor}30`, boxShadow: `0 4px 20px ${primaryColor}18` }}
    >
      <div className="h-1" style={{ background: gradientBar }} />
      <div className="p-6">

        {/* Header row */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle size={20} style={{ color: primaryColor }} />
              <span className="text-[1rem] font-bold text-gray-900">
                {multiPlan
                  ? t("pages.subscription.banner.active_plans", { count: validSubs.length })
                  : t("pages.subscription.banner.active_single", {
                      name: c.planNames.filter(Boolean)[0] ?? validSubs[0]?.planName ?? t("pages.subscription.banner.plan_fallback"),
                    })}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {validSubs.map((s: SubscriptionItem) => {
                const col = PLAN_CONFIG[s.planName]?.color ?? "#6b7280";
                return (
                  <span
                    key={s.id}
                    className="rounded-full px-2.5 py-1 text-[0.72rem] font-semibold"
                    style={{ backgroundColor: `${col}12`, color: col }}
                  >
                    {s.planName} · {t("pages.subscription.banner.expires", { date: fmt(s.endDate) })}
                  </span>
                );
              })}
            </div>
          </div>
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
            style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
          >
            <Calendar size={13} />
            {t("pages.subscription.banner.days_remaining", { count: Math.max(0, c.daysRemaining) })}
          </span>
        </div>

        {/* Usage bars */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {bars.map(({ key, pct, limit, used, remaining, labelKey, unlimitedKey, remainingKey }) => (
            <div key={key}>
              <div className="mb-1 flex justify-between">
                <span className="text-[0.75rem] font-medium text-gray-500">
                  {t(labelKey)}
                  {multiPlan && <span className="text-gray-400"> {t("pages.subscription.banner.combined")}</span>}
                </span>
                <span
                  className="text-[0.75rem] font-bold"
                  style={{ color: pct >= 90 ? "#ef4444" : primaryColor }}
                >
                  {limit === -1 ? "∞" : `${pct}%`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${limit === -1 ? 0 : pct}%`,
                    backgroundColor: pct >= 90 ? "#ef4444" : primaryColor,
                  }}
                />
              </div>
              <p className="mt-1 text-[0.7rem] text-gray-400">
                {limit === -1 ? t(unlimitedKey, { used }) : t(remainingKey, { used, limit, remaining })}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SubscriptionBanner;
