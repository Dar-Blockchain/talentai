import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Briefcase, Search, ChevronLeft, ChevronRight, SlidersHorizontal, X,
} from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
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

const FilterRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
    {children}
  </div>
);

const CardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
    <div className="flex items-start gap-3 px-4 py-3.5">
      <Skeleton className="size-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
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
  const [dateFrom,     setDateFrom]     = useState("");

  // Only status, sort and the applied-within window are filterable now
  // (match-score / exact date-range were dropped as over-complex for a
  // candidate reviewing their own applications).
  const hasActiveFilters =
    activeFilter !== "all" || sortBy !== "date_desc" || dateFrom !== "";

  const clearFilters = () => {
    setActiveFilter("all"); setSortBy("date_desc"); setDateFrom("");
  };

  const DATE_PRESETS = [
    { label: "Any time",     days: 0  },
    { label: "Last 7 days",  days: 7  },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];
  const applyDatePreset = (days: number) => {
    if (days === 0) { setDateFrom(""); return; }
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().slice(0, 10));
  };
  const activePresetDays = (() => {
    if (!dateFrom) return 0;
    const diff = Math.round((Date.now() - new Date(dateFrom).getTime()) / 86_400_000);
    return DATE_PRESETS.find(p => p.days > 0 && Math.abs(p.days - diff) <= 1)?.days ?? null;
  })();

  // Pick up an initial status filter from the URL (e.g. the dashboard's
  // "Pending Interviews" card links here with ?status=visited) so a deep
  // link actually lands pre-filtered instead of showing "all" -- and open
  // the panel so the applied filter is visible rather than hidden.
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.status;
    if (typeof q === "string" && q) { setActiveFilter(q); setShowFilters(true); }
  }, [router.isReady, router.query.status]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 on any filter/search change
  useEffect(() => { setPage(1); }, [activeFilter, debounced, sortBy, dateFrom]);

  const params = {
    page,
    limit:    PAGE_SIZE,
    status:   activeFilter !== "all" ? activeFilter : undefined,
    search:   debounced || undefined,
    sortBy,
    dateFrom: dateFrom || undefined,
  };

  const { data, isLoading }   = useApplicationsQuery(params);
  const { data: stats }       = useApplicationStatsQuery();
  const { mutateAsync: withdraw,   isPending: withdrawing   } = useWithdrawMutation();
  const { mutateAsync: reactivate, isPending: reactivating  } = useReactivateMutation();

  const applications = data?.data ?? [];
  const totalPages   = data?.pagination?.totalPages  ?? 1;
  const statsTotal   = stats
    ? Object.values(stats.statusCounts ?? {}).reduce((a, n) => a + n, 0)
    : 0;
  const totalCount   = data?.pagination?.totalCount ?? statsTotal;

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
    { key: "all", label: s("status.all"), count: statsTotal || totalCount },
    ...(stats
      ? Object.entries(stats.statusCounts).map(([key, count]) => ({
          key, label: statusLabelOf(key), count,
        }))
      : []),
  ];

  const subtitle = totalCount === 1 ? "1 application" : `${totalCount} applications`;

  return (
    <>
      <Card className="gap-0 py-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <div className="size-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
            <Briefcase className="size-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[0.95rem] font-extrabold text-gray-900 leading-tight">
              {s("title")}
            </h2>
            <p className="text-[0.72rem] text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* ── Toolbar: search · filters toggle ── */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={s("search_placeholder")}
              className="pl-8 h-8 text-[0.78rem] border-gray-200 focus-visible:ring-gray-300/50 focus-visible:border-gray-400 rounded-lg"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border text-[0.7rem] font-semibold transition-colors duration-150",
              showFilters || hasActiveFilters
                ? "bg-gray-900 border-gray-900 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            <SlidersHorizontal className="size-3" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && <span className="size-1.5 rounded-full bg-current" />}
          </button>
        </div>

        {/* ── Filter panel: status · sort · applied-within ── */}
        {showFilters && (
          <div
            className="border-b border-gray-100 bg-gray-50/70 px-4 py-4 space-y-4"
            style={{ animation: "filter-reveal 0.18s ease-out" }}
          >
            <FilterRow label="Status">
              <div className="flex gap-1.5 flex-wrap">
                {filterOptions.filter(({ key, count }) => key === "all" || count > 0).map(({ key, label, count }) => {
                  const isActive = activeFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveFilter(key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.7rem] font-semibold whitespace-nowrap transition-colors duration-150",
                        isActive
                          ? "bg-gray-900 border-gray-900 text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      )}
                    >
                      {label}
                      {count > 0 && (
                        <span className={cn(
                          "text-[0.62rem] font-bold tabular-nums",
                          isActive ? "text-white/70" : "text-gray-400",
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </FilterRow>

            <FilterRow label="Sort by">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="h-8 w-full max-w-[220px] text-[0.72rem] bg-white border-gray-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-[0.75rem]">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterRow>

            <FilterRow label="Applied">
              <div className="flex gap-1.5 flex-wrap">
                {DATE_PRESETS.map(p => {
                  const isActive = activePresetDays === p.days;
                  return (
                    <button
                      key={p.days}
                      onClick={() => applyDatePreset(p.days)}
                      className={cn(
                        "px-2.5 py-1 rounded-full border text-[0.7rem] font-semibold transition-colors duration-150",
                        isActive
                          ? "bg-gray-900 border-gray-900 text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </FilterRow>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-gray-400 hover:text-gray-800 cursor-pointer pt-0.5"
              >
                <X className="size-3" /> Clear all
              </button>
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
                      p === page && "bg-gray-900 border-gray-900 text-white hover:bg-gray-800",
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
