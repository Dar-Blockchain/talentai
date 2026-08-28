"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { KpiCard } from "../KpiAtoms";
import { useCampaignsAnalytics } from "../../hooks/useCampaignsAnalytics";
import { MODULE_TYPE_META, type ModuleType } from "./moduleTypeMeta";

const MODULE_TYPE_KEYS = ["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST", "TRAINING_PATH"] as const;

const DonutCenter: React.FC<{ total: number; label: string }> = ({ total, label }) => (
  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
    <tspan x="50%" dy="-6" style={{ fontSize: 22, fontWeight: 800, fill: "#0f172a" }}>
      {total}
    </tspan>
    <tspan x="50%" dy="20" style={{ fontSize: 10.5, fontWeight: 600, fill: "#94a3b8" }}>
      {label}
    </tspan>
  </text>
);

const LegendItem: React.FC<{ color: string; label: string; count: number; total: number }> = ({ color, label, count, total }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <div className="flex items-center gap-2 min-w-0">
      <div className="size-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[12.5px] text-slate-600 font-medium truncate">{label}</span>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[13px] font-bold text-slate-800 tabular-nums">{count}</span>
      <span className="text-[11px] text-slate-400 tabular-nums w-8 text-right">
        {total > 0 ? `${Math.round((count / total) * 100)}%` : "—"}
      </span>
    </div>
  </div>
);

const CampaignModuleTypeBreakdown = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useCampaignsAnalytics();

  const rows = useMemo(
    () => MODULE_TYPE_KEYS
      .map((key) => ({
        key,
        name: t(`campaigns_dashboard.module_types.types.${key}`),
        count: data?.moduleTypes[key] ?? 0,
        color: MODULE_TYPE_META[key as ModuleType].color,
      }))
      .filter((row) => row.count > 0),
    [data, t],
  );
  const total = useMemo(() => rows.reduce((sum, r) => sum + r.count, 0), [rows]);
  const isEmpty = rows.length === 0;

  return (
    <KpiCard
      title={t("campaigns_dashboard.module_types.title", "Campaigns by Module Type")}
      subtitle={t("campaigns_dashboard.module_types.subtitle", "Distribution of module types across campaigns")}
      headerFilter={!isEmpty && (
        <Badge variant="outline" className="text-[11px] font-bold text-slate-500 border-slate-200 bg-slate-50">
          {total}
        </Badge>
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-5">
          <Skeleton className="size-[140px] rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full rounded-lg" />)}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] flex items-center justify-center rounded-2xl border border-slate-100 bg-white">
          <span className="text-[0.82rem] text-slate-400">{t("campaigns_dashboard.module_types.empty", "No campaigns yet")}</span>
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={64}
                  paddingAngle={rows.length > 1 ? 2 : 0}
                  dataKey="count"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {rows.map((row) => <Cell key={row.key} fill={row.color} />)}
                  <DonutCenter total={total} label={t("campaigns_dashboard.module_types.campaigns", "Campaigns")} />
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-xl">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full" style={{ background: payload[0].payload.color }} />
                          <span className="text-slate-500">{payload[0].name}</span>
                          <span className="ml-2 font-bold text-slate-800">{payload[0].value}</span>
                        </div>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 divide-y divide-slate-100 min-w-0">
            {rows.map((row) => (
              <LegendItem key={row.key} color={row.color} label={row.name} count={row.count} total={total} />
            ))}
          </div>
        </div>
      )}
    </KpiCard>
  );
});
CampaignModuleTypeBreakdown.displayName = "CampaignModuleTypeBreakdown";
export default CampaignModuleTypeBreakdown;
