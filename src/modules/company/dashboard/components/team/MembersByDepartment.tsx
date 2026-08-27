"use client";
import React, { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { KpiCard } from "../KpiAtoms";

const STALE = 60_000;
const INITIAL_COUNT = 5;
const sel = (r: any) => r.data?.data ?? r.data;
const fetchDepartmentStats = () => axiosInstance.get("departments/stats").then(sel);

// One accent color throughout — bar length already encodes the ranking, so
// color doesn't need to as well. Opacity fades slightly by rank for a touch
// of depth without turning this into a rainbow.
const ACCENT = "#818CF8";

const MembersByDepartment = memo(() => {
  const { t } = useTranslation("dashboard");
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["teamDashboard", "departmentStats"], queryFn: fetchDepartmentStats, staleTime: STALE });

  const byDepartment: Array<{ name: string; members: number }> = data?.byDepartment ?? [];
  const isEmpty = !isLoading && byDepartment.length === 0;

  const rows = useMemo(() => {
    const max = Math.max(...byDepartment.map((d) => d.members), 1);
    return byDepartment.map((d, i) => ({
      key: `${d.name}-${i}`,
      name: d.name,
      members: d.members,
      pct: Math.round((d.members / max) * 100),
      opacity: Math.max(1 - i * 0.1, 0.5),
    }));
  }, [byDepartment]);

  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_COUNT);
  const hiddenCount = rows.length - INITIAL_COUNT;

  return (
    <KpiCard
      title={t("team.by_department.title", "Members per Department")}
      subtitle={t("team.by_department.subtitle", "Headcount distribution across departments")}
      headerFilter={!isEmpty && hiddenCount > 0 && (
        <Button
          variant="ghost" size="xs"
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600"
        >
          {expanded
            ? t("team.by_department.show_less", "Show less")
            : t("team.by_department.show_all", "Show all ({{count}})", { count: rows.length })}
        </Button>
      )}
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((k) => <Skeleton key={k} className="h-9 w-full rounded-lg" />)}
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] flex items-center justify-center rounded-2xl border border-slate-100 bg-white">
          <span className="text-[0.82rem] text-slate-400">{t("team.by_department.empty", "No departments yet")}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRows.map((row) => (
            <div key={row.key} className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                style={{ background: ACCENT, opacity: row.opacity }}
              >
                {row.name[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[12.5px] font-medium text-slate-600 truncate" title={row.name}>{row.name}</span>
                  <span className="text-[12.5px] font-bold text-slate-700 shrink-0">
                    {row.members}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${row.pct}%`, background: ACCENT, opacity: row.opacity }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </KpiCard>
  );
});
MembersByDepartment.displayName = "MembersByDepartment";
export default MembersByDepartment;
