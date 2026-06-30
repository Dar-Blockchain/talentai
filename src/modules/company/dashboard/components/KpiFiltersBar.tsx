"use client";
import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/modules/shared/ui/shadcn/select";
import { cn } from "@/lib/utils";
import FilterListOutlined  from "@mui/icons-material/FilterListOutlined";
import WorkOutlined        from "@mui/icons-material/WorkOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import type { KpiPostOption } from "../types";

const PERIODS = [
  { label: "7d",  days: 7,    hint: "Last 7 days"  },
  { label: "30d", days: 30,   hint: "Last 30 days" },
  { label: "90d", days: 90,   hint: "Last 90 days" },
  { label: "All", days: null, hint: "All time"     },
] as const;

interface Props {
  postId:         string;
  activeDays:     number | null;
  availablePosts: KpiPostOption[];
  onPostChange:   (id: string) => void;
  onPeriodChange: (days: number | null) => void;
}

const KpiFiltersBar = memo<Props>(({ postId, activeDays, availablePosts, onPostChange, onPeriodChange }) => {
  const { t } = useTranslation("dashboard");

  const handlePost = useCallback(
    (val: string) => onPostChange(val === "__all__" ? "" : val),
    [onPostChange],
  );

  const activePeriod = PERIODS.find(p => p.days === activeDays) ?? PERIODS[3];
  const activePost   = availablePosts.find(p => p.id === postId);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm mb-6 overflow-hidden">

      {/* header strip */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
          <FilterListOutlined style={{ fontSize: 15, color: "#0D9488" }} />
        </div>
        <span className="font-bold text-[13px] text-slate-700 tracking-wide uppercase">
          {t("pages.kpi.filters", "Dashboard Filters")}
        </span>
        <span className="ml-auto text-[11px] text-slate-400 font-medium">
          Showing: <span className="text-slate-600 font-semibold">{activePost?.title ?? "All Jobs"}</span>
          {" · "}
          <span className="text-slate-600 font-semibold">{activePeriod.hint}</span>
        </span>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center px-5 py-4">

        {/* period label + buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 shrink-0">
            <CalendarTodayOutlined style={{ fontSize: 14, color: "#94A3B8" }} />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Time Period</span>
          </div>
          <div className="flex items-center gap-1">
            {PERIODS.map((p) => {
              const isActive = p.days === activeDays;
              return (
                <Button
                  key={p.label}
                  size="xs"
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onPeriodChange(p.days)}
                  className={cn(
                    "rounded-full h-7 px-3.5 text-[12px] font-semibold transition-all duration-150",
                    !isActive && "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {p.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200 shrink-0 mx-1" />

        {/* job post selector */}
        <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <WorkOutlined style={{ fontSize: 14, color: "#94A3B8" }} />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Job Post</span>
          </div>
          <Select value={postId || "__all__"} onValueChange={handlePost}>
            <SelectTrigger size="sm" className="w-full sm:w-57.5 rounded-xl border-slate-200 bg-slate-50 hover:bg-white transition-colors">
              <SelectValue placeholder={t("pages.kpi.all_posts", "All job posts")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                <span className="font-medium">All job posts</span>
              </SelectItem>
              {availablePosts.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
});
KpiFiltersBar.displayName = "KpiFiltersBar";
export default KpiFiltersBar;
