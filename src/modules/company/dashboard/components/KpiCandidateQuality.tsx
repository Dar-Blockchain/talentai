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

const CandidateRow = memo<{ c: SourcingCandidate; shortlistedLabel: string; completedLabel: string; cvMatchLabel: string }>(
  ({ c, shortlistedLabel, completedLabel, cvMatchLabel }) => {
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
          ) : c.matchScore !== null ? (
            <span className="inline-flex flex-col items-center leading-tight" title={cvMatchLabel}>
              <span className="font-bold text-[0.82rem] text-slate-500">{c.matchScore}%</span>
              <span className="text-[0.58rem] text-slate-400">{cvMatchLabel}</span>
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

  const top10         = data?.top10  ?? [];
  const shortlisted   = t("pages.kpi.shortlisted_chip");
  const completed     = t("pages.kpi.completed_chip");
  const cvMatch       = t("pages.kpi.cv_match");
  const tableHeaders  = ["#", t("pages.kpi.col_candidate"), t("pages.kpi.col_post"), t("pages.kpi.col_score"), t("pages.kpi.col_statut")];

  return (
    <>
      <ZoneHeading icon={PeopleOutlined} label={t("pages.kpi.zone5_title")} color="#D97706" />
      <div className="mb-8">
        <div>
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
                    : top10.map((c) => <CandidateRow key={c.rank} c={c} shortlistedLabel={shortlisted} completedLabel={completed} cvMatchLabel={cvMatch} />)}
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
