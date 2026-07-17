"use client";
import React, { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { cn } from "@/lib/utils";
import {
  Briefcase as WorkOutlineOutlined,
  Users as GroupsOutlined,
  AlertTriangle as WarningAmberOutlined,
  ChevronLeft as ChevronLeftOutlined,
  ChevronRight as ChevronRightOutlined,
  CheckCircle2 as CheckCircleOutlined,
  XCircle as XCircleOutlined,
  Video as VideoOutlined,
  ArrowUp as ArrowUpOutlined,
  ArrowDown as ArrowDownOutlined,
  ArrowUpDown as ArrowUpDownOutlined,
} from "lucide-react";
import { ZoneHeading } from "./KpiAtoms";
import { coverageColor } from "../utils/kpiTokens";
import { POSTS_PAGE_SIZE } from "../hooks/useDashboard";
import type { PostsStatusResult, PostsSortColumn } from "../types";

const SKEL_COLS = [180, 80, 100, 70, 70, 60] as const;
const SKEL_ROWS = [0, 1, 2, 3] as const;

// Fills out short pages (e.g. the last page) to a constant row count so the
// table's height never changes when paging. Mirrors the tallest real cell's
// markup (Interviews Completed — badge + progress bar stack) at opacity-0 so
// the height matches exactly, instead of guessing a pixel value.
const FillerRow = memo(() => (
  <tr aria-hidden="true" className="pointer-events-none">
    <td colSpan={3} className="py-3 px-4">&nbsp;</td>
    <td className="py-3 px-4 text-center opacity-0">
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full">
          <VideoOutlined size={12} />
          <span className="font-bold text-[12px]">0/0</span>
        </span>
        <div className="flex items-center gap-1.5 w-full max-w-[70px]">
          <div className="flex-1 h-[5px] rounded-full" />
          <span className="text-[10px] font-bold shrink-0">0%</span>
        </div>
      </div>
    </td>
    <td colSpan={2} className="py-3 px-4">&nbsp;</td>
  </tr>
));
FillerRow.displayName = "FillerRow";

// ─── RowSkeleton ─────────────────────────────────────────────────────────────

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

// ─── KpiPostsOverview ────────────────────────────────────────────────────────

interface KpiPostsOverviewProps {
  data:          PostsStatusResult | undefined;
  loading:       boolean;
  page:          number;
  onPageChange:  (page: number) => void;
  sortBy:        PostsSortColumn | "";
  sortDir:       "" | "asc" | "desc";
  onSortChange:  (column: PostsSortColumn) => void;
}

// Column index → sort key, for every header except POST (index 0, not sortable).
const SORT_COLUMNS: Record<number, PostsSortColumn> = {
  1: "jobStatus",
  2: "matched",
  3: "completed",
  4: "decision",
  5: "deadline",
};

const KpiPostsOverview = memo<KpiPostsOverviewProps>(({
  data, loading, page, onPageChange,
  sortBy, sortDir, onSortChange,
}) => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();

  const rows       = data?.data       ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const goPrev = useCallback(() => onPageChange(page - 1), [onPageChange, page]);
  const goNext = useCallback(() => onPageChange(page + 1), [onPageChange, page]);

  const headers = useMemo(() => [
    t("pages.kpi.col_post"),        t("pages.kpi.col_job_status"),
    t("pages.kpi.col_coverage"),    t("pages.kpi.col_completed"),
    t("pages.kpi.col_status"),      t("pages.kpi.col_deadline"),
  ], [t]);

  return (
    <>
      <ZoneHeading icon={WorkOutlineOutlined} label={t("pages.kpi.zone2_title")} color="#0891B2" />
      <Card className="rounded-2xl overflow-hidden py-0 gap-0">

        {/* Scrollable table — negative margin pulls it flush to card edges */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
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
                          onClick={() => onSortChange(column)}
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
                  const isAlert = p.deadline !== null && p.deadline < 14;
                  return (
                    <tr
                      key={`${p.title}-${idx}`}
                      className="bg-white transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3 px-4 border-b border-slate-100">
                        <div
                          className="flex items-center gap-2 cursor-pointer group min-w-0"
                          onClick={() => router.push(`/company/posts/${p.id}`)}
                          title={p.title}
                        >
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sc }} />
                          <span className="font-semibold text-[13px] text-slate-900 group-hover:underline truncate">
                            {p.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <span
                          className="font-bold text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap"
                          style={
                            p.jobStatus === "draft"
                              ? { background: "#F1F5F9", color: "#64748B", borderColor: "#E2E8F0" }
                              : { background: "#10B98115", color: "#10B981", borderColor: "#10B98135" }
                          }
                        >
                          {p.jobStatus === "draft" ? t("pages.kpi.job_status_draft") : t("pages.kpi.job_status_published")}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ background: "#0D948812" }}>
                          <GroupsOutlined size={12} color="#0D9488" />
                          <span className="font-bold text-[12px] text-teal-600">{p.matched}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ background: "#7C3AED15" }}>
                            <VideoOutlined size={12} color="#7C3AED" />
                            <span className="font-bold text-[12px]" style={{ color: "#7C3AED" }}>{p.completedInterviews}/{p.matched}</span>
                          </span>
                          <div className="flex items-center gap-1.5 w-full max-w-[70px]">
                            <div className="flex-1 h-[5px] rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${p.matched > 0 ? Math.min(Math.round((p.completedInterviews / p.matched) * 100), 100) : 0}%`,
                                  background: "#7C3AED",
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold shrink-0" style={{ color: "#7C3AED" }}>
                              {p.matched > 0 ? Math.round((p.completedInterviews / p.matched) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px]" style={{ background: "#10B98115", color: "#10B981" }}>
                            <CheckCircleOutlined size={12} />
                            {p.shortlisted}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px]" style={{ background: "#EF444415", color: "#EF4444" }}>
                            <XCircleOutlined size={12} />
                            {p.rejected}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-slate-100 text-center">
                        <div className="inline-flex items-center gap-1">
                          {isAlert && <WarningAmberOutlined size={13} color="#EF4444" />}
                          <span className="font-semibold text-[13px]" style={{ color: isAlert ? "#EF4444" : "#1E293B" }}>
                            {p.deadline !== null ? `${p.deadline}j` : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && rows.length > 0 && rows.length < POSTS_PAGE_SIZE &&
                Array.from({ length: POSTS_PAGE_SIZE - rows.length }, (_, i) => <FillerRow key={`filler-${i}`} />)}
            </tbody>
          </table>
        </div>

        {/* Pagination — always padded, never clipped */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-slate-500">
              {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                disabled={page <= 1 || loading}
                onClick={goPrev}
                className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center disabled:opacity-35 hover:bg-slate-50 shrink-0 transition-colors"
              >
                <ChevronLeftOutlined size={16} />
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={goNext}
                className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center disabled:opacity-35 hover:bg-slate-50 shrink-0 transition-colors"
              >
                <ChevronRightOutlined size={16} />
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
