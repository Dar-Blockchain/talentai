import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Briefcase, Search, ChevronLeft, ChevronRight,
  TrendingUp, CalendarCheck, Star, SlidersHorizontal, X, ArrowUpDown,
} from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { cn } from "@/lib/utils";
import type { SortBy } from "@/modules/candidate/applications/types/application.types";
import { buildInterviewUrl } from "@/lib/interviewSession";
import { emitToast } from "@/utils/toastEmitter";
import {
  useApplicationsQuery,
  useApplicationStatsQuery,
  useWithdrawMutation,
  useReactivateMutation,
} from "../queries/useApplicationsQuery";
import ApplicationCard    from "./ApplicationCard";
import ApplicationsEmpty  from "./ApplicationsEmpty";
import WithdrawDialog     from "./WithdrawDialog";
import ReactivateDialog   from "./ReactivateDialog";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "date_desc",  label: "Newest first"       },
  { value: "date_asc",   label: "Oldest first"       },
  { value: "score_desc", label: "Score: high to low" },
  { value: "score_asc",  label: "Score: low to high" },
];

const TYPE_ACTIVE: Record<string, string> = {
  all:                 "bg-primary-dark/10 border-primary-dark/25 text-primary-dark",
  visited:             "bg-gray-50 border-gray-200 text-gray-500",
  interview_completed: "bg-green-50 border-green-200 text-green-700",
  withdrawn:           "bg-gray-100 border-gray-200 text-gray-500",
};

const INACTIVE = "bg-card border-border text-gray-500 hover:border-primary-dark/30 hover:text-primary-dark";

const CardSkeleton = () => (
  <div className="rounded-xl border border-[#E8ECF2] bg-white overflow-hidden shadow-sm">
    <div className="h-0.5 bg-gray-100" />
    <div className="flex items-start gap-3 px-4 py-3">
      <Skeleton className="size-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  </div>
);

const CandidateApplicationsList: React.FC = () => {
  const { t }  = useTranslation("dashboard");
  const s      = (k: string, opts?: any) => t(`candidate.my_applications.${k}`, opts) as string;
  const router = useRouter();

  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState("");
  const [debounced,    setDebounced]    = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [withdrawId,   setWithdrawId]   = useState<string | null>(null);
  const [reactivateId, setReactivateId] = useState<string | null>(null);
  const [showFilters,  setShowFilters]  = useState(false);
  const [sortBy,       setSortBy]       = useState<SortBy>("date_desc");
  const [scoreMin,     setScoreMin]     = useState("");
  const [scoreMax,     setScoreMax]     = useState("");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");

  const hasActiveFilters =
    sortBy !== "date_desc" || scoreMin !== "" || scoreMax !== "" || dateFrom !== "" || dateTo !== "";

  const clearFilters = () => {
    setSortBy("date_desc"); setScoreMin(""); setScoreMax(""); setDateFrom(""); setDateTo("");
  };

  // Pick up an initial status filter from the URL (e.g. the dashboard's
  // "Pending Interviews" card links here with ?status=visited) so a deep
  // link actually lands pre-filtered instead of showing "all".
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.status;
    if (typeof q === "string" && q) setActiveFilter(q);
  }, [router.isReady, router.query.status]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 on any filter/search change
  useEffect(() => { setPage(1); }, [activeFilter, debounced, sortBy, scoreMin, scoreMax, dateFrom, dateTo]);

  const params = {
    page,
    limit:    PAGE_SIZE,
    status:   activeFilter !== "all" ? activeFilter : undefined,
    search:   debounced || undefined,
    sortBy,
    scoreMin: scoreMin !== "" ? Number(scoreMin) : undefined,
    scoreMax: scoreMax !== "" ? Number(scoreMax) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo:   dateTo   || undefined,
  };

  const { data, isLoading }   = useApplicationsQuery(params);
  const { data: stats }       = useApplicationStatsQuery();
  const { mutateAsync: withdraw,   isPending: withdrawing   } = useWithdrawMutation();
  const { mutateAsync: reactivate, isPending: reactivating  } = useReactivateMutation();

  const applications = data?.data ?? [];
  const totalPages   = data?.pagination?.totalPages  ?? 1;
  const totalCount   = data?.pagination?.totalCount  ?? stats
    ? Object.values(stats?.statusCounts ?? {}).reduce((a, n) => a + n, 0)
    : 0;

  const handleWithdrawConfirm = async () => {
    if (!withdrawId) return;
    try {
      await withdraw(withdrawId);
      emitToast({ message: "Application withdrawn successfully.", severity: "success" });
    } catch {
      emitToast({ message: "Failed to withdraw application.", severity: "error" });
    } finally {
      setWithdrawId(null);
    }
  };

  const handleReactivateConfirm = async () => {
    if (!reactivateId) return;
    try {
      await reactivate(reactivateId);
      emitToast({ message: "Application reactivated successfully.", severity: "success" });
    } catch (err: any) {
      const isNoCv = err?.response?.status === 422;
      emitToast({
        message: isNoCv
          ? "Upload a CV in Settings → Resume before reactivating."
          : err?.response?.data?.error || "Failed to reactivate application.",
        severity: "error",
      });
    } finally {
      setReactivateId(null);
    }
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

  const filterOptions = [
    { key: "all", label: s("status.all"),
      count: stats ? Object.values(stats.statusCounts).reduce((a, n) => a + n, 0) : totalCount },
    ...(stats
      ? Object.entries(stats.statusCounts).map(([key, count]) => ({
          key, label: statusLabelOf(key), count,
        }))
      : []),
  ];

  const activeCount = stats
    ? (stats.statusCounts["visited"] ?? 0)
    : 0;
  const interviewCount = stats
    ? (stats.statusCounts["interview_completed"] ?? 0)
    : 0;
  const shortlistedCount = 0; // not tracked by current backend statuses

  return (
    <>
      <Card className="gap-0 py-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="relative overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-dark/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-secondary-light border border-secondary-border flex items-center justify-center shrink-0 shadow-sm">
                  <Briefcase className="size-5 text-secondary-dark" />
                </div>
                <div>
                  <h2 className="text-[1rem] font-extrabold text-gray-900 leading-tight">
                    {s("title")}
                  </h2>
                  <p className="text-[0.72rem] text-gray-400 mt-0.5">
                    Track and manage all your job applications
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[0.75rem] font-extrabold text-secondary-dark bg-secondary-light border border-secondary-border px-2.5 py-1 rounded-full mt-0.5">
                {totalCount}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-info/8 border border-info/15 rounded-lg px-3 py-1.5">
                <TrendingUp className="size-3 text-info" />
                <span className="text-[0.68rem] font-bold text-info">{activeCount}</span>
                <span className="text-[0.65rem] text-info/70 font-medium">Active</span>
              </div>
              <div className="flex items-center gap-1.5 bg-secondary-light border border-secondary-border rounded-lg px-3 py-1.5">
                <CalendarCheck className="size-3 text-secondary-dark" />
                <span className="text-[0.68rem] font-bold text-secondary-dark">{interviewCount}</span>
                <span className="text-[0.65rem] text-secondary-dark/70 font-medium">Interviews</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                <Star className="size-3 text-green-600" />
                <span className="text-[0.68rem] font-bold text-green-700">{shortlistedCount}</span>
                <span className="text-[0.65rem] text-green-600/80 font-medium">Shortlisted</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search + Filters button ── */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={s("search_placeholder")}
              className="pl-8 h-8 text-[0.78rem] border-gray-200 focus-visible:ring-secondary-dark/20 focus-visible:border-secondary-dark/50 rounded-lg"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-[0.65rem] font-semibold transition-all duration-150",
              showFilters || hasActiveFilters
                ? "bg-primary-dark/10 border-primary-dark/25 text-primary-dark"
                : "bg-card border-border text-gray-500 hover:border-primary-dark/30 hover:text-primary-dark",
            )}
          >
            <SlidersHorizontal className="size-3" />
            Filters
            {hasActiveFilters && (
              <span className="size-4 rounded-full bg-primary-dark text-white text-[0.55rem] font-bold flex items-center justify-center leading-none">
                !
              </span>
            )}
          </button>
        </div>

        {/* ── Status pills ── */}
        <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar border-b border-gray-100">
          {filterOptions.filter(({ key, count }) => key === "all" || count > 0).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[0.65rem] font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                activeFilter === key ? (TYPE_ACTIVE[key] ?? TYPE_ACTIVE.all) : INACTIVE,
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn("text-[0.6rem] font-bold", activeFilter === key ? "opacity-100" : "opacity-60")}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Advanced filter panel ── */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 space-y-3">
            <div>
              <p className="text-[0.63rem] font-bold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <ArrowUpDown className="size-3" /> Sort by
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg border text-[0.65rem] font-semibold transition-all duration-150",
                      sortBy === opt.value
                        ? "bg-primary-dark/10 border-primary-dark/25 text-primary-dark"
                        : "bg-card border-border text-gray-500 hover:border-gray-300",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.63rem] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                Match Score range (0–100)
              </p>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} max={100} value={scoreMin}
                  onChange={e => setScoreMin(e.target.value)} placeholder="Min"
                  className="h-7 text-[0.75rem] w-20 border-gray-200 focus-visible:ring-primary-dark/20"
                />
                <span className="text-gray-300 text-sm">—</span>
                <Input type="number" min={0} max={100} value={scoreMax}
                  onChange={e => setScoreMax(e.target.value)} placeholder="Max"
                  className="h-7 text-[0.75rem] w-20 border-gray-200 focus-visible:ring-primary-dark/20"
                />
              </div>
            </div>

            <div>
              <p className="text-[0.63rem] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                Applied date range
              </p>
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="h-7 text-[0.75rem] w-36 border-gray-200 focus-visible:ring-primary-dark/20"
                />
                <span className="text-gray-300 text-sm">—</span>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="h-7 text-[0.75rem] w-36 border-gray-200 focus-visible:ring-primary-dark/20"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="p-0 h-auto text-[0.65rem] font-semibold text-danger hover:bg-transparent hover:text-danger/80"
              >
                <X className="size-3" /> Clear filters
              </Button>
            )}
          </div>
        )}

        {/* ── List ── */}
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : applications.length === 0 ? (
          <ApplicationsEmpty title={s("empty_title")} subtitle={s("empty_subtitle")} />
        ) : (
          <div className="flex flex-col gap-2 p-3">
            {applications.map((app: any, i: number) => (
              <ApplicationCard
                key={app._id || i}
                app={app}
                statusLabel={statusLabelOf(app.status || "visited")}
                onClick={() => handleCardClick(app)}
                onWithdraw={setWithdrawId}
                onReactivate={setReactivateId}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
            <span className="text-[0.7rem] text-gray-400">
              {s("page_of", { current: page, total: totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="icon"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="size-7 rounded-md border-gray-200"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5
                  ? i + 1
                  : page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setPage(p)}
                    className={cn(
                      "size-7 rounded-md text-[0.72rem] font-bold border-gray-200",
                      p === page && "bg-secondary-dark border-secondary-dark text-white hover:bg-secondary-dark/90",
                    )}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline" size="icon"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
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
      <ReactivateDialog
        open={!!reactivateId}
        loading={reactivating}
        onClose={() => setReactivateId(null)}
        onConfirm={handleReactivateConfirm}
      />
    </>
  );
};

export default CandidateApplicationsList;
