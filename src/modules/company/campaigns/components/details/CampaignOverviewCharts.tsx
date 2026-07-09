import React, { memo, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users, CheckCircle2, Clock4, TrendingUp, Trophy, History } from "lucide-react";
import { Campaign, CampaignSession } from "@/modules/company/campaigns/types/campaign";
import { ChartConfig } from "@/modules/shared/ui/shadcn/chart";
import { useTranslation } from "react-i18next";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { scoreColor } from "../list/CampaignCard/constants";
import { useCampaignSessionsQuery } from "../../queries";
import ParticipantResultsDialog from "./ParticipantResultsDialog";
import type { TFunction } from "i18next";

// ─── Status colours ───────────────────────────────────────────────────────────

const STATUS_COLOR = {
  completed:  "#22c55e",
  inProgress: "#f59e0b",
  invited:    "#8310FF",
  dropped:    "#ef4444",
};

const CHART_CONFIG: ChartConfig = {
  completed:  { label: "Completed",  color: STATUS_COLOR.completed  },
  inProgress: { label: "In Progress", color: STATUS_COLOR.inProgress },
  invited:    { label: "Invited",    color: STATUS_COLOR.invited    },
  dropped:    { label: "Dropped",    color: STATUS_COLOR.dropped    },
};

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: React.ElementType; color: string; title: string }> = ({ icon: Icon, color, title }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="flex items-center justify-center size-8 rounded-[10px] shrink-0" style={{ background: `${color}14`, border: `1px solid ${color}28` }}>
      <Icon className="!size-4" style={{ color }} />
    </div>
    <p className="text-[13.5px] font-bold text-foreground">{title}</p>
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconColor, iconBg, label, value }) => (
  <div className="group flex items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3 py-2.5 transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
    <div
      className="size-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
      style={{ background: iconBg }}
    >
      <Icon className="size-[15px]" style={{ color: iconColor }} />
    </div>
    <div className="min-w-0">
      <p className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-[16px] font-extrabold text-foreground leading-tight tabular-nums mt-0.5">{value}</p>
    </div>
  </div>
);

// ─── Legend dot ───────────────────────────────────────────────────────────────

const LegendItem: React.FC<{ color: string; label: string; count: number; total: number }> = ({ color, label, count, total }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <div className="flex items-center gap-2">
      <div className="size-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[12.5px] text-foreground/85 font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-foreground tabular-nums">{count}</span>
      <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">
        {total > 0 ? `${Math.round((count / total) * 100)}%` : "—"}
      </span>
    </div>
  </div>
);

// ─── Custom centre label ──────────────────────────────────────────────────────

const DonutCenter: React.FC<{ pct: number; total: number; totalLabel: string }> = ({ pct, total, totalLabel }) => (
  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
    <tspan x="50%" dy="-10" style={{ fontSize: 22, fontWeight: 800, fill: "#0f172a" }}>
      {pct}%
    </tspan>
    <tspan x="50%" dy="22" style={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}>
      {total} {totalLabel}
    </tspan>
  </text>
);

// ─── Session helpers (top performers / recent activity) ────────────────────────

const SP = "pages.campaigns.detail.sessions";
const DU = "pages.campaigns.detail";

function resolveSessionName(s: CampaignSession, t: TFunction) {
  const p = s.participant;
  if (s.isAnonymous) return p?.firstName ?? t(`${SP}.anonymous`);
  return p
    ? ((p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || p.username || t(`${DU}.unknown_user`))
    : t(`${DU}.unknown_user`);
}

const fmtShortDate = (d: string | undefined, locale: string) =>
  d
    ? new Date(d).toLocaleDateString(locale.startsWith("fr") ? "fr-FR" : "en-US", { month: "short", day: "numeric" })
    : "—";

const SessionRow: React.FC<{
  session: CampaignSession;
  t: TFunction;
  locale: string;
  rank?: number;
  showDate?: boolean;
  onClick: () => void;
}> = ({ session, t, locale, rank, showDate, onClick }) => {
  const name = resolveSessionName(session, t);
  const isAnon = session.isAnonymous;
  const letter = name[0]?.toUpperCase() || "?";
  const hasScore = session.score != null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 py-2 px-1.5 -mx-1.5 rounded-lg text-left transition-colors hover:bg-muted/40"
    >
      {rank !== undefined && (
        <span className="w-4 shrink-0 text-[11px] font-bold text-muted-foreground/60 tabular-nums">{rank}</span>
      )}
      <Avatar className="size-7 shrink-0">
        <AvatarFallback
          className="text-white font-bold text-[10.5px]"
          style={{ background: isAnon ? "linear-gradient(135deg, #94A3B8, #CBD5E1)" : "linear-gradient(135deg, #8310FF, #A855F7)" }}
        >
          {isAnon ? "?" : letter}
        </AvatarFallback>
      </Avatar>
      <span className="flex-1 min-w-0 text-[12.5px] font-semibold text-foreground truncate">{name}</span>
      {showDate ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">{fmtShortDate(session.completedAt, locale)}</span>
      ) : hasScore ? (
        <span
          className="shrink-0 px-2 py-0.5 rounded-md text-[11.5px] font-bold"
          style={{ background: `${scoreColor(session.score!)}18`, color: scoreColor(session.score!) }}
        >
          {session.score}%
        </span>
      ) : null}
    </button>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
  moduleColor: string;
}

const CampaignOverviewCharts: React.FC<Props> = memo(({ campaign, moduleColor }) => {
  const { t, i18n } = useTranslation("dashboard");
  const op = "pages.campaigns.detail.overview";
  const [selectedParticipant, setSelectedParticipant] = useState<{ id: string; name: string } | null>(null);

  const breakdown   = campaign.statusBreakdown;
  const total       = campaign.participantCount ?? 0;
  const completed   = campaign.sessionCount ?? 0;
  const pct         = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isLinkBased = campaign.accessMethod === "LINK";

  const { data: topScoresData } = useCampaignSessionsQuery({
    campaignId: completed > 0 ? campaign._id : "",
    sortBy: "score", order: "desc", limit: 3, page: 1,
  });
  const { data: recentActivityData } = useCampaignSessionsQuery({
    campaignId: completed > 0 ? campaign._id : "",
    sortBy: "completedAt", order: "desc", limit: 3, page: 1,
  });
  const topScores      = topScoresData?.data ?? [];
  const recentActivity = recentActivityData?.data ?? [];
  const hasScores       = topScores.some((s) => s.score != null);

  const donutData = useMemo(() => {
    if (!breakdown) {
      if (total === 0) return [];
      return [
        { name: "completed",  value: completed,         color: STATUS_COLOR.completed  },
        { name: "inProgress", value: total - completed, color: STATUS_COLOR.invited    },
      ];
    }
    return [
      { name: "completed",  value: breakdown.completed,  color: STATUS_COLOR.completed  },
      { name: "inProgress", value: breakdown.inProgress, color: STATUS_COLOR.inProgress },
      ...(isLinkBased ? [] : [{ name: "invited", value: breakdown.invited, color: STATUS_COLOR.invited }]),
      { name: "dropped",    value: breakdown.dropped,    color: STATUS_COLOR.dropped    },
    ].filter((d) => d.value > 0);
  }, [breakdown, total, completed, isLinkBased]);

  const hasParticipants = total > 0;

  return (
    <div className="flex flex-col gap-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* ── Donut chart card ────────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <SectionHeader icon={Users} color={moduleColor} title={t(`${op}.participant_status_title`)} />

        {!hasParticipants ? (
          <div className="flex flex-col items-center justify-center h-44 gap-3">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-muted">
              <Users className="size-5 text-muted-foreground/50" />
            </div>
            <p className="text-[12.5px] text-muted-foreground">{t(`${op}.no_participants`)}</p>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            {/* Donut */}
            <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={64}
                    paddingAngle={donutData.length > 1 ? 2 : 0}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                    <DonutCenter pct={pct} total={total} totalLabel={t(`${op}.total_label`)} />
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full" style={{ background: payload[0].payload.color }} />
                            <span className="text-muted-foreground">{CHART_CONFIG[payload[0].name as string]?.label ?? payload[0].name}</span>
                            <span className="ml-2 font-bold">{payload[0].value}</span>
                          </div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 divide-y divide-border/40">
              {breakdown ? (
                <>
                  <LegendItem color={STATUS_COLOR.completed}  label={t(`${op}.status.completed`)}   count={breakdown.completed}  total={total} />
                  <LegendItem color={STATUS_COLOR.inProgress} label={t(`${op}.status.in_progress`)} count={breakdown.inProgress} total={total} />
                  {!isLinkBased && (
                    <LegendItem color={STATUS_COLOR.invited} label={t(`${op}.status.invited`)} count={breakdown.invited} total={total} />
                  )}
                  {breakdown.dropped > 0 && (
                    <LegendItem color={STATUS_COLOR.dropped} label={t(`${op}.status.dropped`)} count={breakdown.dropped} total={total} />
                  )}
                </>
              ) : (
                <>
                  <LegendItem color={STATUS_COLOR.completed} label={t(`${op}.status.completed`)}     count={completed}         total={total} />
                  <LegendItem color={STATUS_COLOR.invited}   label={t(`${op}.status.not_completed`)} count={total - completed} total={total} />
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ── Key metrics ──────────────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <SectionHeader icon={TrendingUp} color={moduleColor} title={t(`${op}.key_metrics_title`)} />

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={Users}
            iconColor={moduleColor}
            iconBg={`${moduleColor}14`}
            label={t(`${op}.stat_participants`)}
            value={total}
          />
          <StatCard
            icon={CheckCircle2}
            iconColor="#22c55e"
            iconBg="#dcfce7"
            label={t(`${op}.stat_completed`)}
            value={completed}
          />
          <StatCard
            icon={TrendingUp}
            iconColor={hasParticipants ? scoreColor(pct) : "#94a3b8"}
            iconBg={hasParticipants ? `${scoreColor(pct)}18` : "#f1f5f9"}
            label={t(`${op}.stat_completion_rate`)}
            value={`${pct}%`}
          />
          <StatCard
            icon={Clock4}
            iconColor={breakdown?.inProgress ? "#f59e0b" : "#94a3b8"}
            iconBg={breakdown?.inProgress ? "#fffbeb" : "#f1f5f9"}
            label={t(`${op}.stat_in_progress`)}
            value={breakdown?.inProgress ?? "—"}
          />
        </div>
      </Card>
    </div>

    {completed > 0 && (hasScores || recentActivity.length > 0) && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasScores && (
          <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <SectionHeader icon={Trophy} color="#D97706" title={t(`${op}.top_performers_title`)} />
            <div className="divide-y divide-border/40">
              {topScores.map((s, i) => (
                <SessionRow
                  key={s._id}
                  session={s}
                  t={t}
                  locale={i18n.language}
                  rank={i + 1}
                  onClick={() => setSelectedParticipant({ id: s._id, name: resolveSessionName(s, t) })}
                />
              ))}
            </div>
          </Card>
        )}
        {recentActivity.length > 0 && (
          <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <SectionHeader icon={History} color="#0891b2" title={t(`${op}.recent_activity_title`)} />
            <div className="divide-y divide-border/40">
              {recentActivity.map((s) => (
                <SessionRow
                  key={s._id}
                  session={s}
                  t={t}
                  locale={i18n.language}
                  showDate
                  onClick={() => setSelectedParticipant({ id: s._id, name: resolveSessionName(s, t) })}
                />
              ))}
            </div>
          </Card>
        )}
      </div>
    )}

    <ParticipantResultsDialog
      open={!!selectedParticipant}
      campaignId={campaign._id}
      participantId={selectedParticipant?.id ?? null}
      participantName={selectedParticipant?.name ?? ""}
      onClose={() => setSelectedParticipant(null)}
    />
    </div>
  );
});

CampaignOverviewCharts.displayName = "CampaignOverviewCharts";
export default CampaignOverviewCharts;
