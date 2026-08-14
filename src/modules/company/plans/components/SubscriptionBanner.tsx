import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { ACCENT_DARK } from "../constants";
import { useSubscriptionBanner } from "../hooks/useSubscriptionBanner";

const SEVERITY_TEXT: Record<"ok" | "warning" | "critical", string> = {
  ok:       "text-gray-700",
  warning:  "text-amber-600",
  critical: "text-red-600",
};

const Dot: React.FC = () => <span className="text-gray-300">·</span>;

const SubscriptionBanner: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const { isLoading, data } = useSubscriptionBanner();

  if (isLoading) return <div className="mb-5 h-[42px] w-full animate-pulse rounded-full bg-gray-100" />;
  if (!data) return null;

  const { c, multiPlan, isTrialOnly, planLabel, stats, anyAutoRenewOff } = data;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[0.82rem]">
      <CheckCircle size={16} style={{ color: ACCENT_DARK }} className="flex-shrink-0" />
      <span className="font-bold text-gray-900">
        {t(multiPlan ? "pages.subscription.banner.strip_plans" : "pages.subscription.banner.strip_plan", { name: planLabel })}
      </span>

      {isTrialOnly ? (
        <>
          <Dot />
          <span className="text-gray-500">{t("pages.subscription.banner.strip_trial")}</span>
        </>
      ) : (
        <>
          {stats.map((s) => (
            <React.Fragment key={s.key}>
              <Dot />
              <span className={`font-semibold ${SEVERITY_TEXT[s.severity]}`}>
                {s.limit === -1
                  ? t(`pages.subscription.banner.strip_${s.key}_unlimited`, { used: s.used })
                  : t(`pages.subscription.banner.strip_${s.key}`, { used: s.used, limit: s.limit })}
              </span>
            </React.Fragment>
          ))}
          <Dot />
          <span className={`font-semibold ${anyAutoRenewOff ? "text-amber-600" : "text-gray-500"}`}>
            {t(
              anyAutoRenewOff ? "pages.subscription.banner.expires_in" : "pages.subscription.banner.renews_in",
              { count: Math.max(0, c.daysRemaining) },
            )}
          </span>
        </>
      )}
    </div>
  );
};

export default SubscriptionBanner;
