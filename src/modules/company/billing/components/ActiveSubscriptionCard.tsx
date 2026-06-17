import React, { useMemo } from "react";
import { CheckCircle, Calendar, Loader2, Video, Briefcase } from "lucide-react";
import { useCombinedDetailsQuery } from "../queries";
import { TEAL, PLAN_COLORS } from "../constants";
import UsageBar from "./UsageBar";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const ActiveSubscriptionCard: React.FC = () => {
  const { data: combined, isLoading: loading } = useCombinedDetailsQuery();
  const subscriptions = combined?.subscriptions ?? [];
  const c = combined?.combined;
  const isMulti = subscriptions.length > 1;

  const { postsPct, interviewsPct, periodPct } = useMemo(() => {
    if (!c || subscriptions.length === 0) return { postsPct: 0, interviewsPct: 0, periodPct: 0 };
    const posts      = c.usage.posts.limit > 0
      ? Math.min(100, Math.round((c.usage.posts.used / c.usage.posts.limit) * 100)) : 0;
    const interviews = c.usage.monthlyInterviews.limit > 0
      ? Math.min(100, Math.round((c.usage.monthlyInterviews.used / c.usage.monthlyInterviews.limit) * 100)) : 0;
    const durationDays = Math.max(1, Math.round(
      (new Date(subscriptions[0].endDate).getTime() - new Date(subscriptions[0].startDate).getTime()) / 86400000,
    ));
    const period = Math.min(100, Math.max(0, 100 - Math.round((c.daysRemaining / durationDays) * 100)));
    return { postsPct: posts, interviewsPct: interviews, periodPct: period };
  }, [c, subscriptions]);

  if (loading) return (
    <div className="mb-6 flex justify-center rounded-2xl bg-white p-6">
      <Loader2 size={24} className="animate-spin" style={{ color: TEAL }} />
    </div>
  );
  if (!combined || subscriptions.length === 0 || !c) return null;

  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border-[1.5px] bg-white"
      style={{ borderColor: `${TEAL}25`, boxShadow: `0 4px 20px ${TEAL}18` }}
    >
      {isMulti
        ? <div className="h-1" style={{ background: "linear-gradient(90deg, #0D9488, #7C3AED, #0891B2)" }} />
        : <div className="h-1" style={{ backgroundColor: PLAN_COLORS[subscriptions[0].planName] ?? TEAL }} />
      }

      <div className="p-6">
        {/* Header row */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-lg" style={{ backgroundColor: `${TEAL}14` }}>
              <CheckCircle size={22} style={{ color: TEAL }} />
            </div>
            <div>
              <p className="text-[1rem] font-bold text-gray-900">
                {isMulti ? `${subscriptions.length} Active Plans` : `Active — ${subscriptions[0].planName} Plan`}
              </p>
              <p className="text-[0.78rem] text-gray-500">
                {isMulti
                  ? `Expires soonest: ${fmt(c.soonestExpiry)}`
                  : `${fmt(subscriptions[0].startDate)} → ${fmt(subscriptions[0].endDate)}`
                }
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isMulti && subscriptions.map((s) => (
              <span
                key={s.id}
                className="rounded-full border px-2.5 py-1 text-[0.72rem] font-bold"
                style={{
                  backgroundColor: `${PLAN_COLORS[s.planName] ?? TEAL}18`,
                  color: PLAN_COLORS[s.planName] ?? TEAL,
                  borderColor: `${PLAN_COLORS[s.planName] ?? TEAL}40`,
                }}
              >
                {s.planName}
              </span>
            ))}
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-bold"
              style={{ backgroundColor: `${TEAL}12`, color: TEAL }}
            >
              <Calendar size={13} />
              {c.daysRemaining} day{c.daysRemaining !== 1 ? "s" : ""} left
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Subscription period / active plans list */}
          <div>
            {isMulti ? (
              <div>
                <p className="mb-2 text-[0.78rem] font-semibold text-gray-700">Active Plans</p>
                <div className="flex flex-col gap-2">
                  {subscriptions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: PLAN_COLORS[s.planName] ?? TEAL }} />
                        <span className="text-[0.75rem] font-semibold text-gray-700">{s.planName}</span>
                      </div>
                      <span className="text-[0.72rem] text-gray-400">{fmt(s.endDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-1.5 flex justify-between">
                  <span className="text-[0.78rem] font-semibold text-gray-700">Subscription period</span>
                  <span className="text-[0.75rem] font-bold" style={{ color: TEAL }}>{c.daysRemaining} days left</span>
                </div>
                <div className="h-[7px] w-full overflow-hidden rounded-full" style={{ backgroundColor: `${TEAL}18` }}>
                  <div className="h-full rounded-full" style={{ width: `${periodPct}%`, backgroundColor: TEAL }} />
                </div>
                <p className="mt-1 text-[0.69rem] text-gray-400">
                  expires {fmt(subscriptions[0].endDate)}
                </p>
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
            label={isMulti ? "Interviews (combined)" : "Interviews (this month)"}
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
