import React, { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users, CheckCircle2, Clock4, XCircle, TrendingUp } from "lucide-react";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/modules/shared/ui/shadcn/chart";
import { useTranslation } from "react-i18next";
import { Card } from "@/modules/shared/ui/shadcn/card";

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

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconColor, iconBg, label, value, sub }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
    <div className="size-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
      <Icon className="size-4" style={{ color: iconColor }} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-[18px] font-extrabold text-foreground leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Legend dot ───────────────────────────────────────────────────────────────

const LegendItem: React.FC<{ color: string; label: string; count: number; total: number }> = ({ color, label, count, total }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <div className="flex items-center gap-2">
      <div className="size-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[12.5px] text-foreground/70 font-medium">{label}</span>
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

const DonutCenter: React.FC<{ pct: number; total: number }> = ({ pct, total }) => (
  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
    <tspan x="50%" dy="-10" style={{ fontSize: 22, fontWeight: 800, fill: "#0f172a" }}>
      {pct}%
    </tspan>
    <tspan x="50%" dy="22" style={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}>
      {total} total
    </tspan>
  </text>
);

// ─── Module config display ────────────────────────────────────────────────────

const ModuleConfigPanel: React.FC<{ campaign: Campaign; moduleColor: string }> = ({ campaign, moduleColor }) => {
  const mod = campaign.module;
  if (!mod?.config) return null;

  if (mod.type === "QUESTIONNAIRE") {
    const questions = mod.config.questions ?? [];
    const typeColors: Record<string, { bg: string; text: string }> = {
      TEXT:            { bg: "#EFF6FF", text: "#1D4ED8" },
      SINGLE_CHOICE:   { bg: "#F0FDF4", text: "#16A34A" },
      MULTIPLE_CHOICE: { bg: "#FFF7ED", text: "#D97706" },
      RATING:          { bg: "#F5F3FF", text: "#7C3AED" },
    };
    return (
      <div className="space-y-2 mt-1">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {questions.length} Question{questions.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {questions.map((q, i) => {
            const tc = typeColors[q.type] ?? { bg: "#F3F4F6", text: "#374151" };
            return (
              <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                <span className="mt-0.5 shrink-0 text-[11px] font-bold tabular-nums" style={{ color: moduleColor }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-[12.5px] font-medium text-foreground/85 leading-snug">{q.question}</span>
                <span
                  className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: tc.bg, color: tc.text }}
                >
                  {q.type.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mod.type === "AI_INTERVIEW" && mod.config.agentPrompt) {
    return (
      <div className="mt-1 space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Agent Prompt</p>
        <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <p className="text-[12.5px] text-foreground/80 leading-relaxed line-clamp-6 whitespace-pre-wrap font-mono">
            {mod.config.agentPrompt}
          </p>
        </div>
      </div>
    );
  }

  if (mod.type === "SKILL_TEST" && mod.config.skill) {
    return (
      <div className="mt-1 space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Skill Assessed</p>
        <div
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-[13px]"
          style={{ background: `${moduleColor}14`, color: moduleColor, border: `1px solid ${moduleColor}30` }}
        >
          {mod.config.skill}
        </div>
      </div>
    );
  }

  if (mod.type === "TRAINING_PATH" && mod.config.resources?.length) {
    const typeIcon: Record<string, string> = { LINK: "🔗", DOCUMENT: "📄", COURSE: "🎓", VIDEO: "▶️" };
    return (
      <div className="mt-1 space-y-2">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {mod.config.resources.length} Resource{mod.config.resources.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {mod.config.resources.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
              <span className="text-base">{typeIcon[r.type] ?? "📎"}</span>
              <span className="flex-1 text-[12.5px] font-medium text-foreground/85 truncate">{r.title}</span>
              {r.estimatedTime && (
                <span className="shrink-0 text-[11px] text-muted-foreground">{r.estimatedTime}min</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
  moduleColor: string;
}

const CampaignOverviewCharts: React.FC<Props> = memo(({ campaign, moduleColor }) => {
  const { t } = useTranslation("dashboard");

  const breakdown = campaign.statusBreakdown;
  const total     = campaign.participantCount ?? 0;
  const completed = campaign.sessionCount ?? 0;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

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
      { name: "invited",    value: breakdown.invited,    color: STATUS_COLOR.invited    },
      { name: "dropped",    value: breakdown.dropped,    color: STATUS_COLOR.dropped    },
    ].filter((d) => d.value > 0);
  }, [breakdown, total, completed]);

  const hasParticipants = total > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* ── Donut chart card ────────────────────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <p className="text-[13px] font-bold text-foreground mb-4">Participant Status</p>

        {!hasParticipants ? (
          <div className="flex flex-col items-center justify-center h-44 gap-2">
            <Users className="size-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">No participants yet</p>
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
                    <DonutCenter pct={pct} total={total} />
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
                  <LegendItem color={STATUS_COLOR.completed}  label="Completed"   count={breakdown.completed}  total={total} />
                  <LegendItem color={STATUS_COLOR.inProgress} label="In Progress" count={breakdown.inProgress} total={total} />
                  <LegendItem color={STATUS_COLOR.invited}    label="Invited"     count={breakdown.invited}    total={total} />
                  {breakdown.dropped > 0 && (
                    <LegendItem color={STATUS_COLOR.dropped} label="Dropped" count={breakdown.dropped} total={total} />
                  )}
                </>
              ) : (
                <>
                  <LegendItem color={STATUS_COLOR.completed} label="Completed"     count={completed}         total={total} />
                  <LegendItem color={STATUS_COLOR.invited}   label="Not completed" count={total - completed} total={total} />
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ── Key metrics + module config ──────────────────────────────────────── */}
      <Card className="flex flex-col gap-3">
        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            icon={Users}
            iconColor={moduleColor}
            iconBg={`${moduleColor}14`}
            label="Participants"
            value={total}
          />
          <StatCard
            icon={CheckCircle2}
            iconColor="#22c55e"
            iconBg="#dcfce7"
            label="Completed"
            value={completed}
          />
          <StatCard
            icon={TrendingUp}
            iconColor="#0891b2"
            iconBg="#e0f2fe"
            label="Completion Rate"
            value={`${pct}%`}
          />
          <StatCard
            icon={Clock4}
            iconColor={breakdown?.inProgress ? "#f59e0b" : "#94a3b8"}
            iconBg={breakdown?.inProgress ? "#fffbeb" : "#f1f5f9"}
            label="In Progress"
            value={breakdown?.inProgress ?? "—"}
          />
        </div>

        {/* Module config inline */}
        {campaign.module?.config && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex-1">
            <p className="text-[13px] font-bold text-foreground mb-1">Module Configuration</p>
            <ModuleConfigPanel campaign={campaign} moduleColor={moduleColor} />
          </div>
        )}
      </Card>
    </div>
  );
});

CampaignOverviewCharts.displayName = "CampaignOverviewCharts";
export default CampaignOverviewCharts;
