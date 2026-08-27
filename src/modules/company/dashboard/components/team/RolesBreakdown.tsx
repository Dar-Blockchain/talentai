"use client";
import React, { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { KpiCard } from "../KpiAtoms";
import { getRoleLabel } from "@/modules/company/employees/utils/employeeRoleI18n";

const STALE = 60_000;
const INITIAL_COUNT = 5;
const sel = (r: any) => r.data?.data ?? r.data;
const fetchRoleStats = () => axiosInstance.get("company-memberships/memberships/roles-stats").then(sel);

// One soft accent throughout, fading slightly by rank — bar length already
// encodes share of the team, color doesn't need to distinguish each role too.
const ACCENT = "#34D399";

const RolesBreakdown = memo(() => {
  const { t } = useTranslation("dashboard");
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["teamDashboard", "roleStats"], queryFn: fetchRoleStats, staleTime: STALE });

  const byRole: Array<{ role: string; count: number }> = data?.byRole ?? [];
  const total = useMemo(() => byRole.reduce((s, r) => s + r.count, 0), [byRole]);
  const isEmpty = !isLoading && byRole.length === 0;

  const rows = useMemo(
    () => byRole.map((r, i) => ({
      key: r.role,
      label: r.role === "Other" ? t("team.roles_breakdown.other", "Other") : getRoleLabel(r.role, t),
      count: r.count,
      pct: total > 0 ? Math.round((r.count / total) * 100) : 0,
      opacity: Math.max(1 - i * 0.09, 0.45),
    })),
    [byRole, total, t],
  );

  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_COUNT);
  const hiddenCount = rows.length - INITIAL_COUNT;

  return (
    <KpiCard
      title={t("team.roles_breakdown.title", "Roles Breakdown")}
      subtitle={t("team.roles_breakdown.subtitle", "Team members by role")}
      headerFilter={!isEmpty && hiddenCount > 0 && (
        <Button
          variant="ghost" size="xs"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-600"
        >
          {expanded
            ? t("team.roles_breakdown.show_less", "Show less")
            : t("team.roles_breakdown.show_more", "+{{count}} more roles", { count: hiddenCount })}
        </Button>
      )}
    >
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((k) => <Skeleton key={k} className="h-8 w-full rounded-lg" />)}
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] flex items-center justify-center rounded-2xl border border-slate-100 bg-white">
          <span className="text-[0.82rem] text-slate-400">{t("team.roles_breakdown.empty", "No members yet")}</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleRows.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[12.5px] font-medium text-slate-600 truncate">{row.label}</span>
                <span className="text-[12.5px] font-bold text-slate-700 shrink-0">{row.count}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${row.pct}%`, background: ACCENT, opacity: row.opacity }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </KpiCard>
  );
});
RolesBreakdown.displayName = "RolesBreakdown";
export default RolesBreakdown;
