"use client";
import React, { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { cn } from "@/lib/utils";
import WorkOutlineOutlined  from "@mui/icons-material/WorkOutlineOutlined";
import GroupsOutlined       from "@mui/icons-material/GroupsOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ChevronLeftOutlined  from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import { ZoneHeading } from "./KpiAtoms";
import { coverageColor, coverageLabel } from "../utils/kpiTokens";
import type { PostsStatusResult } from "../types";

const SKEL_COLS = [180, 70, 70, 100, 70, 60] as const;
const SKEL_ROWS = [0, 1, 2] as const;

// ─── RowSkeleton ─────────────────────────────────────────────────────────────

const RowSkeleton = memo(() => (
  <tr>
    {SKEL_COLS.map((w, i) => (
      <td key={i} className={cn("py-3 px-3", i === 0 ? "text-left" : "text-center")}>
        <Skeleton className={cn("h-4 rounded-lg", i === 0 ? "" : "mx-auto")} style={{ width: w }} />
      </td>
    ))}
  </tr>
));
RowSkeleton.displayName = "RowSkeleton";

// ─── PageButton ───────────────────────────────────────────────────────────────

const PageButton = memo<{ page: number; active: boolean; onGoTo: (p: number) => void }>(
  ({ page, active, onGoTo }) => (
    <button
      onClick={() => onGoTo(page)}
      className={cn(
        "min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg border text-[12px] font-bold transition-all",
        active
          ? "bg-slate-900 border-slate-900 text-white"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
      )}
    >
      {page}
    </button>
  ),
);
PageButton.displayName = "PageButton";

// ─── KpiPostsOverview ────────────────────────────────────────────────────────

interface KpiPostsOverviewProps {
  data:         PostsStatusResult | undefined;
  loading:      boolean;
  page:         number;
  onPageChange: (page: number) => void;
}

const KpiPostsOverview = memo<KpiPostsOverviewProps>(({ data, loading, page, onPageChange }) => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();

  const rows       = data?.data       ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalCount = data?.pagination?.totalCount ?? 0;

  const goPrev = useCallback(() => onPageChange(page - 1), [onPageChange, page]);
  const goNext = useCallback(() => onPageChange(page + 1), [onPageChange, page]);

  const headers = useMemo(() => [
    t("pages.kpi.col_post"),        t("pages.kpi.col_shortlisted"),
    t("pages.kpi.col_velocity"),    t("pages.kpi.col_coverage"),
    t("pages.kpi.col_status"),      t("pages.kpi.col_deadline"),
  ], [t]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  return (
    <>
      <ZoneHeading icon={WorkOutlineOutlined} label={t("pages.kpi.zone2_title")} color="#0891B2" />
      <Card className="mb-4 overflow-hidden py-0 gap-0">

        {/* Scrollable table — negative margin pulls it flush to card edges */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="bg-slate-50">
                {headers.map((h, idx) => (
                  <th
                    key={h}
                    className={cn(
                      "font-bold text-[11px] text-slate-400 uppercase tracking-wider",
                      "border-b-2 border-slate-200 py-3 px-3 whitespace-nowrap",
                      idx === 0 ? "text-left" : "text-center",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                SKEL_ROWS.map((i) => <RowSkeleton key={i} />)
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[13px] text-slate-400">
                    No open posts
                  </td>
                </tr>
              ) : (
                rows.map((p, idx) => {
                  const sc      = coverageColor(p.coverage, p.deadline ?? 99);
                  const sl      = coverageLabel(p.coverage, p.deadline ?? 99);
                  const isAlert = p.deadline !== null && p.deadline < 14;
                  return (
                    <tr
                      key={`${p.title}-${idx}`}
                      className={cn(
                        "transition-colors hover:bg-teal-50/50",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                      )}
                    >
                      <td className="py-3 px-3 border-b border-slate-100">
                        <div
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => router.push(`/company/posts/${p.id}`)}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sc }} />
                          <span className="font-semibold text-[13px] text-slate-900 group-hover:underline">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 border-b border-slate-100 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ background: "#0D948812" }}>
                          <GroupsOutlined style={{ fontSize: 12, color: "#0D9488" }} />
                          <span className="font-bold text-[12px] text-teal-600">{p.shortlisted}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 border-b border-slate-100 text-center font-semibold text-[13px] text-slate-700">
                        {p.velocity !== null ? `${p.velocity}j` : "—"}
                      </td>
                      <td className="py-3 px-3 border-b border-slate-100 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-14 h-[6px] rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(p.coverage * 100, 100)}%`, background: sc }} />
                          </div>
                          <span className="font-bold text-[12px] min-w-[34px]" style={{ color: sc }}>
                            {Math.round(p.coverage * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 border-b border-slate-100 text-center">
                        <span
                          className="font-bold text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap"
                          style={{ background: `${sc}15`, color: sc, borderColor: `${sc}35` }}
                        >
                          {t(`pages.kpi.status_${sl}`)}
                        </span>
                      </td>
                      <td className="py-3 px-3 border-b border-slate-100 text-center">
                        <div className="inline-flex items-center gap-1">
                          {isAlert && <WarningAmberOutlined style={{ fontSize: 13, color: "#EF4444" }} />}
                          <span className="font-semibold text-[13px]" style={{ color: isAlert ? "#EF4444" : "#1E293B" }}>
                            {p.deadline !== null ? `${p.deadline}j` : "—"}
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

        {/* Pagination — always padded, never clipped */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[12px] text-slate-400 text-center sm:text-left">
              {totalCount} post{totalCount !== 1 ? "s" : ""} &bull; page {page} / {totalPages}
            </span>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <button
                disabled={page <= 1 || loading}
                onClick={goPrev}
                className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center disabled:opacity-35 hover:bg-slate-50 shrink-0 transition-colors"
              >
                <ChevronLeftOutlined style={{ fontSize: 16 }} />
              </button>
              {pageNumbers.map((n) => (
                <PageButton key={n} page={n} active={page === n} onGoTo={onPageChange} />
              ))}
              <button
                disabled={page >= totalPages || loading}
                onClick={goNext}
                className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center disabled:opacity-35 hover:bg-slate-50 shrink-0 transition-colors"
              >
                <ChevronRightOutlined style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
});
KpiPostsOverview.displayName = "KpiPostsOverview";

export default KpiPostsOverview;
