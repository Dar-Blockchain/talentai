"use client";
import React, { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import {
  Users as GroupsOutlined,
  AlertTriangle as WarningAmberOutlined,
  ArrowUp as ArrowUpOutlined,
  ArrowDown as ArrowDownOutlined,
  ArrowUpDown as ArrowUpDownOutlined,
} from "lucide-react";
import { KpiCard } from "../KpiAtoms";
import { MODULE_TYPE_META } from "./moduleTypeMeta";
import { useCampaignsTable, type CampaignsTableSortColumn } from "../../hooks/useCampaignsTable";

const WIDGET_LIMIT = 6;
const SKEL_COLS = [220, 90, 90, 110, 70, 70] as const;

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10B981",
  DRAFT: "#94A3B8",
  PAUSED: "#F59E0B",
  CLOSED: "#64748B",
  EXPIRED: "#EF4444",
};

const SORT_COLUMNS: Record<number, CampaignsTableSortColumn> = {
  1: "status",
  2: "participants",
  3: "completion",
  4: "score",
  5: "deadline",
};

const RowSkeleton = memo(() => (
  <tr>
    {SKEL_COLS.map((w, i) => (
      <td key={i} className={cn("py-3 px-4", i === 0 ? "text-left" : "text-center")}>
        <Skeleton className={cn("h-4 rounded-lg", i === 0 ? "" : "mx-auto")} style={{ width: w }} />
      </td>
    ))}
  </tr>
));
RowSkeleton.displayName = "RowSkeleton";

const CampaignsOverviewTable = memo(() => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();

  const [sortBy, setSortBy] = useState<CampaignsTableSortColumn | "">("");
  const [sortDir, setSortDir] = useState<"" | "asc" | "desc">("");

  const { data, isLoading } = useCampaignsTable({ page: 1, limit: WIDGET_LIMIT, sortBy, sortDir });
  const rows = data?.data ?? [];

  const handleSortChange = useCallback((column: CampaignsTableSortColumn) => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy("");
      setSortDir("");
    }
  }, [sortBy, sortDir]);

  const headers = useMemo(() => [
    t("campaigns_dashboard.table.col_campaign", "Campaign"),
    t("campaigns_dashboard.table.col_status", "Status"),
    t("campaigns_dashboard.table.col_participants", "Participants"),
    t("campaigns_dashboard.table.col_completion", "Completion"),
    t("campaigns_dashboard.table.col_score", "Avg. Score"),
    t("campaigns_dashboard.table.col_deadline", "Deadline"),
  ], [t]);

  return (
    <KpiCard
      className="h-full overflow-hidden"
      contentClassName="px-0 pb-0 pt-4"
      title={t("campaigns_dashboard.table.title", "Campaigns Overview")}
      subtitle={t("campaigns_dashboard.table.subtitle", "Your most recent campaigns at a glance")}
      headerFilter={
        <Button
          variant="ghost" size="xs"
          onClick={() => router.push("/company/campaigns")}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
        >
          {t("campaigns_dashboard.table.show_all", "Show all")}
        </Button>
      }
    >
      <div className="overflow-x-auto pb-1">
        <table className="w-full min-w-[680px] table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[13%]" />
              <col className="w-[15%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50/80">
                {headers.map((h, idx) => {
                  const column = SORT_COLUMNS[idx];
                  const active = column && sortBy === column;
                  return (
                    <th
                      key={h}
                      className={cn(
                        "font-bold text-[10.5px] text-slate-400 uppercase tracking-wider",
                        "border-b border-slate-200 py-3.5 px-4 whitespace-nowrap",
                        idx === 0 ? "text-left" : "text-center",
                      )}
                    >
                      {column ? (
                        <button
                          onClick={() => handleSortChange(column)}
                          className={cn(
                            "inline-flex items-center gap-1 hover:text-slate-600 transition-colors",
                            active && "text-teal-600",
                          )}
                          title={t("pages.kpi.filter_sort_hint", "Sort by this column")}
                        >
                          {h}
                          {active && sortDir === "asc" ? <ArrowUpOutlined size={11} /> : active && sortDir === "desc" ? <ArrowDownOutlined size={11} /> : <ArrowUpDownOutlined size={11} className="opacity-40" />}
                        </button>
                      ) : h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: WIDGET_LIMIT }, (_, i) => <RowSkeleton key={i} />)
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[13px] text-slate-400">
                    {t("campaigns_dashboard.table.empty", "No campaigns yet")}
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const meta = c.moduleType ? MODULE_TYPE_META[c.moduleType] : null;
                  const statusColor = STATUS_COLORS[c.status] ?? "#64748B";
                  const isAlert = c.status === "ACTIVE" && c.deadline !== null && c.deadline < 14;
                  return (
                    <tr key={c.id} className="bg-white transition-colors hover:bg-slate-50/80">
                      <td className="py-3 px-4 border-b border-slate-100">
                        <div
                          className="flex items-center gap-2 cursor-pointer group min-w-0"
                          onClick={() => router.push(`/company/campaigns/${c.id}`)}
                          title={c.title}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta?.color ?? "#94A3B8" }} />
                          <span className="font-semibold text-[13px] text-slate-900 group-hover:underline truncate">
                            {c.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <span
                          className="font-bold text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap"
                          style={{ background: `${statusColor}15`, color: statusColor, borderColor: `${statusColor}35` }}
                        >
                          {t(`overview.campaign_activity.status.${c.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ background: "#0D948812" }}>
                          <GroupsOutlined size={12} color="#0D9488" />
                          <span className="font-bold text-[12px] text-teal-600">{c.participants}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-semibold text-slate-500">{c.completed}/{c.participants}</span>
                          <div className="flex items-center gap-1.5 w-full max-w-[80px]">
                            <div className="flex-1 h-[5px] rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${c.completionRate}%`, background: "#7C3AED" }} />
                            </div>
                            <span className="text-[10px] font-bold shrink-0" style={{ color: "#7C3AED" }}>{c.completionRate}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <span className="font-semibold text-[13px]" style={{ color: c.avgScore != null ? "#0D9488" : "#94A3B8" }}>
                          {c.avgScore != null ? `${c.avgScore}%` : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <div className="inline-flex items-center gap-1">
                          {isAlert && <WarningAmberOutlined size={13} color="#EF4444" />}
                          <span className="font-semibold text-[13px]" style={{ color: isAlert ? "#EF4444" : "#1E293B" }}>
                            {c.deadline !== null ? `${c.deadline}j` : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
      </div>
    </KpiCard>
  );
});
CampaignsOverviewTable.displayName = "CampaignsOverviewTable";
export default CampaignsOverviewTable;
