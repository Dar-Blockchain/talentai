import React, { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users, CheckCircle2, Clock4, TrendingUp, ListChecks } from "lucide-react";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import { ChartConfig } from "@/modules/shared/ui/shadcn/chart";
import { useTranslation } from "react-i18next";
import { Card } from "@/modules/shared/ui/shadcn/card";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/modules/shared/ui/shadcn/accordion";
import { MODULE_CONFIG } from "@/modules/shared/constants/campaign";
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
  <div className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
    <div
      className="size-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
      style={{ background: iconBg }}
    >
      <Icon className="size-[18px]" style={{ color: iconColor }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</p>
      <p className="text-[19px] font-extrabold text-foreground leading-tight tabular-nums mt-0.5">{value}</p>
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

// ─── Module config summary (collapsed state) ───────────────────────────────────

function moduleConfigSummary(campaign: Campaign, t: TFunction): string | null {
  const op = "pages.campaigns.detail.overview";
  const mod = campaign.module;
  if (!mod?.config) return null;

  if (mod.type === "QUESTIONNAIRE") {
    return t(`${op}.questions_count`, { count: mod.config.questions?.length ?? 0 });
  }
  if (mod.type === "AI_INTERVIEW" && mod.config.agentPrompt) {
    return t(`${op}.agent_prompt_configured`);
  }
  if (mod.type === "SKILL_TEST" && mod.config.skill) {
    return t(`${op}.skill_summary`, { skill: mod.config.skill });
  }
  if (mod.type === "TRAINING_PATH" && mod.config.resources?.length) {
    return t(`${op}.resources_count`, { count: mod.config.resources.length });
  }
  return null;
}

// ─── Module config display ────────────────────────────────────────────────────

const ModuleConfigPanel: React.FC<{ campaign: Campaign; moduleColor: string }> = ({ campaign, moduleColor }) => {
  const { t } = useTranslation("dashboard");
  const op = "pages.campaigns.detail.overview";
  const mod = campaign.module;
  if (!mod?.config) return null;

  if (mod.type === "QUESTIONNAIRE") {
    const questions = mod.config.questions ?? [];
    const typeColor: Record<string, string> = {
      TEXT:            "#1D4ED8",
      SINGLE_CHOICE:   "#16A34A",
      MULTIPLE_CHOICE: "#D97706",
      RATING:          "#7C3AED",
    };
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
          {t(`${op}.questions_count`, { count: questions.length })}
        </p>
        <div className="divide-y divide-border/50 max-h-52 overflow-y-auto pr-1">
          {questions.map((q, i) => {
            const hasOptions = (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && (q.options?.length ?? 0) > 0;
            return (
              <div key={i} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground/50 w-4">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[12.5px] text-foreground/85 leading-snug">{q.question}</span>
                  <span
                    className="shrink-0 text-[10.5px] font-semibold capitalize"
                    style={{ color: typeColor[q.type] ?? "#6B7280" }}
                  >
                    {q.type.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                {hasOptions && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5 pl-[26px]">
                    {q.options!.map((opt, oi) => (
                      <span key={oi} className="text-[11px] text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mod.type === "AI_INTERVIEW" && mod.config.agentPrompt) {
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{t(`${op}.agent_prompt_label`)}</p>
        <p
          className="text-[12.5px] text-foreground/75 leading-relaxed line-clamp-6 whitespace-pre-wrap border-l-2 pl-3"
          style={{ borderColor: `${moduleColor}40` }}
        >
          {mod.config.agentPrompt}
        </p>
      </div>
    );
  }

  if (mod.type === "SKILL_TEST" && mod.config.skill) {
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{t(`${op}.skill_assessed_label`)}</p>
        <p className="text-[14px] font-bold" style={{ color: moduleColor }}>{mod.config.skill}</p>
      </div>
    );
  }

  if (mod.type === "TRAINING_PATH" && mod.config.resources?.length) {
    const typeIcon: Record<string, string> = { LINK: "🔗", DOCUMENT: "📄", COURSE: "🎓", VIDEO: "▶️" };
    return (
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
          {t(`${op}.resources_count`, { count: mod.config.resources.length })}
        </p>
        <div className="divide-y divide-border/50 max-h-52 overflow-y-auto pr-1">
          {mod.config.resources.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
              <span className="text-base shrink-0">{typeIcon[r.type] ?? "📎"}</span>
              <span className="flex-1 text-[12.5px] text-foreground/85 truncate">{r.title}</span>
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
  const op = "pages.campaigns.detail.overview";

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
  const ModuleIcon = campaign.module?.type ? MODULE_CONFIG[campaign.module.type]?.icon : null;
  const configSummary = moduleConfigSummary(campaign, t);

  return (
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
                  <LegendItem color={STATUS_COLOR.invited}    label={t(`${op}.status.invited`)}     count={breakdown.invited}    total={total} />
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

      {/* ── Key metrics + module config ──────────────────────────────────────── */}
      <Card className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm flex flex-col gap-4">
        <SectionHeader icon={TrendingUp} color={moduleColor} title={t(`${op}.key_metrics_title`)} />

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-2.5">
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
            iconColor="#0891b2"
            iconBg="#e0f2fe"
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

        {/* Module config — collapsible */}
        {campaign.module?.config && (
          <Accordion type="single" collapsible className="rounded-2xl border border-border/60 bg-muted/20 flex-1">
            <AccordionItem value="module-config" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&>svg]:text-muted-foreground/60">
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="flex items-center justify-center size-6 rounded-md shrink-0"
                    style={{ background: `${moduleColor}14` }}
                  >
                    {ModuleIcon ? <ModuleIcon className="!size-3.5" style={{ color: moduleColor }} /> : <ListChecks className="size-3.5" style={{ color: moduleColor }} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-foreground">{t(`${op}.module_configuration_title`)}</span>
                    {configSummary && (
                      <span className="block text-[11.5px] text-muted-foreground truncate">{configSummary}</span>
                    )}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <ModuleConfigPanel campaign={campaign} moduleColor={moduleColor} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </Card>
    </div>
  );
});

CampaignOverviewCharts.displayName = "CampaignOverviewCharts";
export default CampaignOverviewCharts;
