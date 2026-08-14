import React, { useMemo } from "react";
import { CheckCircle, Calendar, Loader2, Video, Briefcase, Sparkles } from "lucide-react";
import { useCombinedDetailsQuery } from "../queries";
import { ACCENT, ACCENT_DARK } from "../constants";
import UsageBar from "./UsageBar";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const ActiveSubscriptionCard: React.FC = () => {
  const { data: combined, isLoading: loading } = useCombinedDetailsQuery();
  const subscriptions = combined?.subscriptions ?? [];
  const c = combined?.combined;
  const isMulti = subscriptions.length > 1;
  // Trial subscriptions get a 100-year endDate under the hood so they never
  // block posts/interviews — real to the backend, meaningless to show a user.
  const isTrialOnly = !isMulti && subscriptions[0]?.planName === "Trial";

  const { postsPct, generationsPct, interviewsPct, periodPct, periodStart, anyAutoRenewOff } = useMemo(() => {
    if (!c || subscriptions.length === 0) {
      return {
        postsPct: 0, generationsPct: 0, interviewsPct: 0, periodPct: 0,
        periodStart: null as string | null, anyAutoRenewOff: false,
      };
    }
    const posts       = c.usage.posts.limit > 0
      ? Math.min(100, Math.round((c.usage.posts.used / c.usage.posts.limit) * 100)) : 0;
    const generations = c.usage.postGenerations.limit > 0
      ? Math.min(100, Math.round((c.usage.postGenerations.used / c.usage.postGenerations.limit) * 100)) : 0;
    const interviews  = c.usage.monthlyInterviews.limit > 0
      ? Math.min(100, Math.round((c.usage.monthlyInterviews.used / c.usage.monthlyInterviews.limit) * 100)) : 0;

    // Earliest start across active subs — pairs with c.soonestExpiry to give
    // one clear "Started X — Renews Y" range even for legacy stacked plans.
    const start = subscriptions.reduce(
      (min, s) => (!min || new Date(s.startDate) < new Date(min) ? s.startDate : min),
      null as string | null,
    );
    const durationDays = start
      ? Math.max(1, Math.round((new Date(c.soonestExpiry).getTime() - new Date(start).getTime()) / 86400000))
      : 1;
    const period = Math.min(100, Math.max(0, 100 - Math.round((c.daysRemaining / durationDays) * 100)));

    return {
      postsPct: posts,
      generationsPct: generations,
      interviewsPct: interviews,
      periodPct: period,
      periodStart: start,
      anyAutoRenewOff: subscriptions.some((s) => !s.autoRenew),
    };
  }, [c, subscriptions]);

  if (loading) return (
    <div className="mb-6 flex justify-center rounded-2xl border border-gray-200 bg-white p-6">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  );
  if (!combined || subscriptions.length === 0 || !c || !periodStart) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        {/* Header row */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg" style={{ backgroundColor: `${ACCENT}1f` }}>
              <CheckCircle size={22} style={{ color: ACCENT_DARK }} />
            </div>
            <div>
              <p className="text-[1rem] font-bold text-gray-900">
                {isMulti ? `${subscriptions.length} Active Plans` : `${subscriptions[0].planName} Plan`}
              </p>
              <p className="text-[0.78rem] text-gray-500">
                {isTrialOnly
                  ? "Free plan · no expiration"
                  : `Started ${fmt(periodStart)} · ${anyAutoRenewOff ? "Won't renew · expires" : "Renews"} ${fmt(c.soonestExpiry)}`}
              </p>
            </div>
          </div>

          {!isTrialOnly && (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-bold ${
                anyAutoRenewOff ? "bg-amber-50 text-amber-700" : "text-gray-700"
              }`}
              style={anyAutoRenewOff ? undefined : { backgroundColor: `${ACCENT}1f` }}
            >
              <Calendar size={13} />
              {c.daysRemaining} day{c.daysRemaining !== 1 ? "s" : ""} left
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Subscription period / active plans list */}
          <div>
            {isTrialOnly ? (
              <div>
                <p className="mb-1.5 text-[0.78rem] font-semibold text-gray-700">Subscription period</p>
                <p className="text-[0.75rem] text-gray-500">Free trial — no expiration. Upgrade anytime.</p>
              </div>
            ) : isMulti ? (
              <div>
                <p className="mb-2 text-[0.78rem] font-semibold text-gray-700">Active Plans</p>
                <div className="flex flex-col gap-1.5">
                  {subscriptions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-[7px] w-[7px] flex-shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
                        <span className="text-[0.75rem] font-semibold text-gray-700">{s.planName}</span>
                      </div>
                      <span className="text-[0.68rem] text-gray-400">{fmt(s.startDate)} – {fmt(s.endDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-1.5 flex justify-between">
                  <span className="text-[0.78rem] font-semibold text-gray-700">Subscription period</span>
                  <span className="text-[0.75rem] font-bold text-gray-700">{c.daysRemaining} days left</span>
                </div>
                <div className="h-[7px] w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${periodPct}%`, backgroundColor: ACCENT }} />
                </div>
                <div className="mt-1 flex justify-between text-[0.68rem] text-gray-400">
                  <span>{fmt(subscriptions[0].startDate)}</span>
                  <span>{fmt(subscriptions[0].endDate)}</span>
                </div>
              </div>
            )}
          </div>

          <UsageBar
            label={isMulti ? "Job Posts (combined)" : "Job Posts"}
            used={c.usage.posts.used} limit={c.usage.posts.limit}
            remaining={c.usage.posts.remaining} pct={postsPct}
            icon={<Briefcase size={15} />}
          />

          <UsageBar
            label={isMulti ? "AI Generations (combined)" : "AI Generations"}
            used={c.usage.postGenerations.used} limit={c.usage.postGenerations.limit}
            remaining={c.usage.postGenerations.remaining} pct={generationsPct}
            icon={<Sparkles size={15} />}
          />

          <UsageBar
            label={isMulti ? "Interviews (combined)" : "Interviews"}
            used={c.usage.monthlyInterviews.used} limit={c.usage.monthlyInterviews.limit}
            remaining={c.usage.monthlyInterviews.remaining} pct={interviewsPct}
            icon={<Video size={15} />}
          />
        </div>
      </div>
    </div>
  );
};

export default ActiveSubscriptionCard;
