"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { History as HistoryOutlined, ChevronRight as ChevronRightOutlined } from "lucide-react";
import { ZoneHeading } from "./KpiAtoms";
import ApplicationHistoryRows, { RowSkeleton } from "./ApplicationHistoryRows";
import type { ApplicationHistoryData } from "../types";

interface Props { data: ApplicationHistoryData | undefined; loading: boolean }

const KpiApplicationHistory = memo<Props>(({ data, loading }) => {
  const { t }    = useTranslation("dashboard");
  const router   = useRouter();
  const items    = data ?? [];

  return (
    <>
      <ZoneHeading icon={HistoryOutlined} label={t("pages.kpi.zone1_title", "Recent Activity")} color="#7C3AED" />
      <Card className="flex-1 rounded-2xl overflow-hidden py-0 gap-0">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-slate-400">
            {t("pages.kpi.history_empty", "No recent activity yet")}
          </div>
        ) : (
          <div className="relative flex flex-col h-full">
            <ApplicationHistoryRows items={items} />
          </div>
        )}
        {!loading && items.length > 0 && (
          <button
            onClick={() => router.push("/company/dashboard/activity")}
            className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-slate-100 text-[12px] font-semibold text-violet-600 hover:bg-slate-50/80 transition-colors"
          >
            {t("pages.kpi.history_show_more", "Show more")}
            <ChevronRightOutlined size={14} />
          </button>
        )}
      </Card>
    </>
  );
});
KpiApplicationHistory.displayName = "KpiApplicationHistory";
export default KpiApplicationHistory;
