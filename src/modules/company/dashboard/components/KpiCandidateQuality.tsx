"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Users as PeopleOutlined, Star as StarOutlined } from "lucide-react";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { T } from "../utils/kpiTokens";
import type { KpiSourcingData, SourcingCandidate } from "../types";
import { cn } from "@/lib/utils";

const SKEL_WIDTHS = [22, 120, 110, 40, 70] as const;

const CandidateRow = memo<{ c: SourcingCandidate; shortlistedLabel: string; completedLabel: string }>(
  ({ c, shortlistedLabel, completedLabel }) => {
    const isTop   = c.rank <= 3;
    const isShort = c.status === "shortlisted";
    return (
      <tr className="hover:bg-teal-50 transition-colors">
        <td className="py-2.5 border-b border-slate-100 text-center">
          <div className="w-[22px] h-[22px] rounded-full mx-auto flex items-center justify-center" style={{ background: isTop ? `${T}18` : "#F1F5F9" }}>
            <span className="font-bold text-[0.68rem]" style={{ color: isTop ? T : "#64748B" }}>{c.rank}</span>
          </div>
        </td>
        <td className="py-2.5 border-b border-slate-100 font-semibold text-[0.8rem] text-slate-700">{c.firstName} {c.lastName}</td>
        <td className="py-2.5 border-b border-slate-100 text-[0.8rem] text-slate-400">{c.postTitle}</td>
        <td className="py-2.5 border-b border-slate-100 text-center">
          {c.score !== null ? (
            <span className="inline-flex items-center gap-1">
              <StarOutlined size={13} color="#F59E0B" />
              <span className="font-bold text-[0.82rem] text-teal-600">{c.score}</span>
            </span>
          ) : <span className="text-[0.82rem] text-slate-400">—</span>}
        </td>
        <td className="py-2.5 border-b border-slate-100 text-center">
          <span className="font-semibold text-[0.63rem] px-2 py-0.5 rounded-full" style={isShort ? { background: `${T}12`, color: T } : { background: "#EFF6FF", color: "#2563EB" }}>
            {isShort ? shortlistedLabel : completedLabel}
          </span>
        </td>
      </tr>
    );
  },
);
CandidateRow.displayName = "CandidateRow";

interface Props { data: KpiSourcingData | undefined; loading: boolean }

const KpiCandidateQuality = memo<Props>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const deltaColor    = (data?.avgDelta ?? -1) >= 0 ? "#10B981" : "#EF4444";
  const deltaLabel    = data?.avgDelta != null ? `${data.avgDelta >= 0 ? "↑ +" : "↓ "}${data.avgDelta} vs prev. period` : "—";
  const byPost        = data?.byPost ?? [];
  const top10         = data?.top10  ?? [];
  const shortlisted   = t("pages.kpi.shortlisted_chip");
  const completed     = t("pages.kpi.completed_chip");
  const tableHeaders  = ["#", t("pages.kpi.col_candidate"), t("pages.kpi.col_post"), t("pages.kpi.col_score"), t("pages.kpi.col_statut")];

  return (
    <>
      <ZoneHeading icon={PeopleOutlined} label={t("pages.kpi.zone5_title")} color="#D97706" />
      <div className="grid grid-cols-1 sm:grid-cols-5 md:grid-cols-4 gap-4 sm:gap-6 mb-8">

        <div className="sm:col-span-2 md:col-span-1">
          <KpiCard>
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-[14px] mb-5 text-center">
              <div className="text-[0.68rem] font-bold text-teal-600 uppercase tracking-[0.08em] mb-1">{t("pages.kpi.avg_score_label")}</div>
              {loading
                ? <Skeleton className="h-14 w-16 rounded mx-auto" />
                : <div className="font-extrabold text-[3rem] text-teal-800 leading-none">{data?.avgCurrent ?? "—"}</div>}
              <div className="text-[0.75rem] text-slate-400 mb-2">/100</div>
              {loading
                ? <Skeleton className="h-6 w-36 rounded-full mx-auto" />
                : <span className="inline-block font-semibold text-[0.68rem] px-2 py-0.5 rounded-full border" style={{ color: deltaColor, borderColor: `${deltaColor}30` }}>{deltaLabel}</span>}
            </div>

            <div className="font-bold text-[0.7rem] text-slate-400 uppercase tracking-[0.07em] mb-3">{t("pages.kpi.by_channel")}</div>
            {loading
              ? [0, 1, 2, 3].map((i) => (
                  <div key={i} className="mb-3 space-y-1">
                    <div className="flex justify-between"><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-4 w-6 rounded" /></div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))
              : byPost.length === 0
              ? <p className="text-[0.78rem] text-slate-400">No data yet</p>
              : byPost.map((ch, i) => (
                  <div key={ch.label} className={i < byPost.length - 1 ? "mb-3" : ""}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[0.78rem] text-slate-600 font-medium">{ch.label}</span>
                      <span className="font-bold text-[0.78rem]" style={{ color: ch.color }}>{ch.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full opacity-85" style={{ width: `${ch.score}%`, background: ch.color }} />
                    </div>
                  </div>
                ))}
          </KpiCard>
        </div>

        <div className="sm:col-span-3">
          <KpiCard title={t("pages.kpi.top10_title")} subtitle={t("pages.kpi.top10_subtitle")}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr>
                    {tableHeaders.map((h, idx) => (
                      <th key={h} className={cn("font-bold text-[0.68rem] text-slate-400 uppercase tracking-[0.06em] border-b-2 border-slate-200 py-3 bg-slate-50", idx === 1 || idx === 2 ? "text-left" : "text-center")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [0, 1, 2, 3, 4].map((i) => (
                        <tr key={i}>
                          {SKEL_WIDTHS.map((w, j) => (
                            <td key={j} className={cn("py-2.5 border-b border-slate-100", j === 1 || j === 2 ? "text-left" : "text-center")}>
                              <Skeleton className={cn("h-4 rounded-lg", j === 1 || j === 2 ? "" : "mx-auto")} style={{ width: w }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : top10.length === 0
                    ? <tr><td colSpan={5} className="text-center py-8 text-[0.82rem] text-slate-400">No completed interviews yet</td></tr>
                    : top10.map((c) => <CandidateRow key={c.rank} c={c} shortlistedLabel={shortlisted} completedLabel={completed} />)}
                </tbody>
              </table>
            </div>
          </KpiCard>
        </div>
      </div>
    </>
  );
});
KpiCandidateQuality.displayName = "KpiCandidateQuality";
export default KpiCandidateQuality;
