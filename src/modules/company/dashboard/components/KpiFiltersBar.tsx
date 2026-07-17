"use client";
import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/modules/shared/ui/shadcn/select";
import { cn } from "@/lib/utils";
import { Calendar as CalendarTodayOutlined, Briefcase as WorkOutlined, SlidersHorizontal as SlidersOutlined } from "lucide-react";
import type { KpiPostOption } from "../types";

const PERIODS = [
  { label: "7d",  days: 7    },
  { label: "30d", days: 30   },
  { label: "90d", days: 90   },
  { label: "All", days: null },
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

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-teal-100 bg-white shadow-sm px-4 py-2.5">
      <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-100">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0D948814" }}>
          <SlidersOutlined size={12} color="#0D9488" />
        </div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide hidden sm:inline">
          {t("pages.kpi.filters", "Filters")}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <CalendarTodayOutlined size={13} color="#94A3B8" />
        <div className="flex items-center gap-0.5 ml-1">
          {PERIODS.map((p) => {
            const isActive = p.days === activeDays;
            return (
              <Button
                key={p.label}
                size="xs"
                variant={isActive ? "default" : "ghost"}
                onClick={() => onPeriodChange(p.days)}
                className={cn(
                  "rounded-full h-6 px-2.5 text-[11px] font-semibold transition-all duration-150",
                  !isActive && "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                )}
              >
                {p.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="w-px h-5 bg-slate-200 shrink-0" />

      <div className="flex items-center gap-1.5 min-w-0">
        <WorkOutlined size={13} color="#94A3B8" className="shrink-0" />
        <Select value={postId || "__all__"} onValueChange={handlePost}>
          <SelectTrigger size="sm" className="h-7 min-w-40 max-w-60 rounded-lg border-slate-200 bg-slate-50 hover:bg-white transition-colors text-[12px]">
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
  );
});
KpiFiltersBar.displayName = "KpiFiltersBar";
export default KpiFiltersBar;
