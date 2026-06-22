"use client";
import React, { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/modules/shared/ui/shadcn/select";
import { cn } from "@/lib/utils";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import type { KpiPostOption } from "../types";

const PERIODS = [
  { label: "7d",  days: 7   },
  { label: "30d", days: 30  },
  { label: "90d", days: 90  },
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
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
              <FilterListOutlined style={{ fontSize: 15, color: "#0D9488" }} />
            </div>
            <span className="font-semibold text-[13px] text-slate-700">{t("pages.kpi.filters", "Filters")}</span>
          </div>

          <div className="hidden sm:block w-px h-5 bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1.5 flex-wrap">
            {PERIODS.map((p) => {
              const isActive = p.days === null ? activeDays === null : activeDays === p.days;
              return (
                <Button
                  key={p.label}
                  size="xs"
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onPeriodChange(p.days)}
                  className={cn("rounded-full h-7 px-3 text-[12px] font-semibold", !isActive && "text-slate-500 hover:text-slate-700 hover:bg-slate-100")}
                >
                  {p.label}
                </Button>
              );
            })}
          </div>

          <div className="sm:ml-auto w-full sm:w-auto">
            <Select value={postId || "__all__"} onValueChange={handlePost}>
              <SelectTrigger size="sm" className="w-full sm:w-[220px]">
                <SelectValue placeholder={t("pages.kpi.all_posts", "All posts")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("pages.kpi.all_posts", "All posts")}</SelectItem>
                {availablePosts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
KpiFiltersBar.displayName = "KpiFiltersBar";
export default KpiFiltersBar;
