import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Briefcase, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/store/store";
import {
  fetchCandidateApplications,
  fetchCandidateStats,
  selectCandidateApplications,
  selectCandidateApplicationsLoading,
  selectCandidateApplicationsPagination,
  selectCandidateStats,
  withdrawApplication,
  updateLocalWithdraw,
} from "@/store/slices/jobApplicationSlice";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { emitToast } from "@/utils/toastEmitter";
import ApplicationCard from "./ApplicationCard";
import ApplicationsEmpty from "./ApplicationsEmpty";
import WithdrawDialog from "./WithdrawDialog";

const PAGE_SIZE = 12;

// ─── Filter pill types ────────────────────────────────────────────────────────

const TYPE_ACTIVE: Record<string, string> = {
  all:                 "bg-primary-dark/10 border-primary-dark/25 text-primary-dark",
  applied:             "bg-info/10 border-info/20 text-info",
  pending:             "bg-warning/10 border-warning/20 text-warning",
  shortlisted:         "bg-green-50 border-green-200 text-green-700",
  accepted:            "bg-primary-light border-primary-border text-primary-dark",
  rejected:            "bg-danger/10 border-danger/20 text-danger",
  withdrawn:           "bg-gray-100 border-gray-200 text-gray-500",
  interview_scheduled: "bg-secondary-light border-secondary-border text-secondary-dark",
  interview_completed: "bg-green-50 border-green-200 text-green-700",
  viewed:              "bg-gray-50 border-gray-200 text-gray-500",
  visited:             "bg-gray-50 border-gray-200 text-gray-500",
};

const INACTIVE = "bg-card border-border text-gray-500 hover:border-primary-dark/30 hover:text-primary-dark";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
    <Skeleton className="size-11 rounded-xl shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const CandidateApplicationsList: React.FC = () => {
  const { t }    = useTranslation("dashboard");
  const s        = (k: string, opts?: any) => t(`candidate.my_applications.${k}`, opts) as string;
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();

  const applications  = useSelector(selectCandidateApplications);
  const loading       = useSelector(selectCandidateApplicationsLoading);
  const { currentPage, totalPages, totalCount } = useSelector(selectCandidateApplicationsPagination);
  const stats         = useSelector(selectCandidateStats);

  const [search,        setSearch]        = useState("");
  const [debounced,     setDebounced]     = useState("");
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [withdrawId,    setWithdrawId]    = useState<string | null>(null);
  const [withdrawing,   setWithdrawing]   = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch on filter/search change
  useEffect(() => {
    dispatch(fetchCandidateApplications({
      page:   1,
      limit:  PAGE_SIZE,
      status: activeFilter !== "all" ? activeFilter : undefined,
      search: debounced || undefined,
    }));
  }, [activeFilter, debounced, dispatch]);

  useEffect(() => { dispatch(fetchCandidateStats()); }, [dispatch]);

  const goToPage = (p: number) =>
    dispatch(fetchCandidateApplications({
      page:   p,
      limit:  PAGE_SIZE,
      status: activeFilter !== "all" ? activeFilter : undefined,
      search: debounced || undefined,
    }));

  const handleWithdrawConfirm = async () => {
    if (!withdrawId) return;
    setWithdrawing(true);
    const result = await dispatch(withdrawApplication(withdrawId));
    if (withdrawApplication.fulfilled.match(result)) {
      dispatch(updateLocalWithdraw(withdrawId));
      dispatch(fetchCandidateStats());
      emitToast({ message: "Application withdrawn successfully.", severity: "success" });
    } else {
      emitToast({ message: (result.payload as string) || "Failed to withdraw application.", severity: "error" });
    }
    setWithdrawing(false);
    setWithdrawId(null);
  };

  const handleCardClick = (app: any) => {
    const status = (app.status || "").toLowerCase();
    if (status === "visited" && app.post?._id)
      router.push(buildInterviewUrl({ type: "post", jobId: app.post._id }));
    else
      router.push(`/candidate/applications/${app._id}`);
  };

  const statusLabelOf = (st: string) => {
    const key = `candidate.my_applications.status.${st}`;
    const res = t(key) as string;
    return res === key ? st : res;
  };

  // Build filter options from stats
  const filterOptions = [
    { key: "all", label: s("status.all"), count: stats
        ? Object.values(stats.statusCounts).reduce((a, n) => a + n, 0)
        : totalCount },
    ...(stats
      ? Object.entries(stats.statusCounts).map(([key, count]) => ({
          key, label: statusLabelOf(key), count,
        }))
      : []),
  ];

  return (
    <>
      <Card className="gap-0 py-0 overflow-hidden">

        {/* ── Header ── */}
        <CardHeader className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="size-8 rounded-lg bg-secondary-light border border-secondary-border flex items-center justify-center shrink-0">
            <Briefcase className="size-4 text-secondary-dark" />
          </div>
          <CardTitle className="text-[0.95rem] font-bold text-gray-900 flex-1">
            {s("title")}
          </CardTitle>
          <span className="text-[0.72rem] font-bold text-secondary-dark bg-secondary-light border border-secondary-border px-2 py-0.5 rounded-full">
            {totalCount}
          </span>
        </CardHeader>

        {/* ── Search ── */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={s("search_placeholder")}
              className="pl-8 h-8 text-[0.78rem] border-gray-200 focus-visible:ring-secondary-dark/20 focus-visible:border-secondary-dark/50 rounded-lg"
            />
          </div>
        </div>

        {/* ── Status filters ── */}
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar border-b border-gray-100">
          {filterOptions.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[0.65rem] font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                activeFilter === key ? TYPE_ACTIVE[key] ?? TYPE_ACTIVE.all : INACTIVE,
              )}
            >
              {label}
              <span className={cn(
                "text-[0.6rem] font-bold",
                activeFilter === key ? "opacity-100" : "opacity-60",
              )}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : applications.length === 0 ? (
          <ApplicationsEmpty title={s("empty_title")} subtitle={s("empty_subtitle")} />
        ) : (
          <div>
            {applications.map((app: any, i: number) => (
              <ApplicationCard
                key={app._id || i}
                app={app}
                statusLabel={statusLabelOf(app.status || "applied")}
                isLast={i === applications.length - 1}
                onClick={() => handleCardClick(app)}
                onWithdraw={setWithdrawId}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
            <span className="text-[0.7rem] text-gray-400">
              {s("page_of", { current: currentPage, total: totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className="size-7 rounded-md border-gray-200"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5
                  ? i + 1
                  : currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
                return (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon"
                    onClick={() => goToPage(p)}
                    className={cn(
                      "size-7 rounded-md text-[0.72rem] font-bold border-gray-200",
                      p === currentPage && "bg-secondary-dark border-secondary-dark text-white hover:bg-secondary-dark/90",
                    )}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="size-7 rounded-md border-gray-200"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <WithdrawDialog
        open={!!withdrawId}
        loading={withdrawing}
        onClose={() => setWithdrawId(null)}
        onConfirm={handleWithdrawConfirm}
      />
    </>
  );
};

export default CandidateApplicationsList;
