"use client";

import React, { memo, useState, useRef, useCallback, useMemo } from "react";
import { ClipboardList, CircleCheck, Circle, Clock, Ban, Eye, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { useCampaignSessionsQuery } from "../../queries";
import { CampaignSession, SessionStatus } from "@/modules/company/campaigns/types/campaign";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import CampaignsFilterBar from "../list/CampaignsFilterBar";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import ParticipantResultsDialog from "./ParticipantResultsDialog";

const PAGE_SIZE = 9;
const SP = "pages.campaigns.detail.sessions";
const DU = "pages.campaigns.detail";
const CP = "pages.campaigns.toolbar";

const PERIOD_VALUES = ["", "7d", "30d", "3m", "6m", "1y"] as const;

type SortValue = "date_desc" | "score_desc" | "score_asc";
const SORT_TO_PARAMS: Record<SortValue, { sortBy: "date" | "score"; order: "asc" | "desc" }> = {
  date_desc:  { sortBy: "date",  order: "desc" },
  score_desc: { sortBy: "score", order: "desc" },
  score_asc:  { sortBy: "score", order: "asc"  },
};

function resolveSessionName(s: CampaignSession, t: TFunction) {
  const p = s.participant;
  if (s.isAnonymous) return p?.firstName ?? t(`${SP}.anonymous`);
  return p ? ((p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || p.username || t(`${DU}.unknown_user`)) : t(`${DU}.unknown_user`);
}

const SKELETON_CARDS = Array.from({ length: 6 });

const fmtDate = (d: string | undefined, locale: string) =>
  d
    ? new Date(d).toLocaleDateString(locale.startsWith("fr") ? "fr-FR" : "en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
    : "—";

function scoreColor(s: number) { return s >= 70 ? "#16A34A" : s >= 40 ? "#D97706" : "#DC2626"; }
function scoreBg  (s: number) { return s >= 70 ? "#F0FDF4" : s >= 40 ? "#FFFBEB" : "#FEF2F2"; }

const SESSION_STATUS_META: Record<SessionStatus, { color: string; bg: string; icon: React.ElementType }> = {
  PENDING:     { color: "#6B7280", bg: "#F3F4F6", icon: Circle },
  IN_PROGRESS: { color: "#D97706", bg: "#FFFBEB", icon: Clock },
  COMPLETED:   { color: "#16A34A", bg: "#F0FDF4", icon: CircleCheck },
  EXPIRED:     { color: "#DC2626", bg: "#FEF2F2", icon: Ban },
};

// ─── Card skeleton ────────────────────────────────────────────────────────────

const CardSkeleton = memo(() => (
  <div className="bg-background border border-border rounded-2xl p-4 flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <Skeleton className="size-[38px] rounded-full shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-[15px] w-[70%]" />
        <Skeleton className="h-[13px] w-[85%] mt-1.5" />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-[22px] w-24 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-8 w-full rounded-lg" />
  </div>
));
CardSkeleton.displayName = "SessionCardSkeleton";

// ─── Session card ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: CampaignSession;
  onShowResults: () => void;
}

const SessionCard = memo<SessionCardProps>(({ session: s, onShowResults }) => {
  const { t, i18n } = useTranslation("dashboard");
  const sp = SP;

  const p          = s.participant;
  const isAnon     = s.isAnonymous;
  const name       = resolveSessionName(s, t);
  const email      = isAnon ? null : (p?.email ?? "");
  const letter     = name[0]?.toUpperCase() || "?";
  const statusCfg  = SESSION_STATUS_META[s.status] ?? SESSION_STATUS_META.PENDING;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="bg-background border border-border rounded-2xl p-4 flex flex-col gap-3.5 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="shrink-0">
            <AvatarFallback
              className="text-white font-bold text-[0.85rem]"
              style={{ background: isAnon ? "linear-gradient(135deg, #94A3B8, #CBD5E1)" : "linear-gradient(135deg, #8310FF, #A855F7)" }}
            >
              {isAnon ? "?" : letter}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">{name}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {isAnon ? t(`${sp}.identity_hidden`) : (email || "—")}
            </p>
          </div>
        </div>

        {s.score !== undefined && (
          <span
            className="inline-flex shrink-0 px-2 py-0.5 rounded-md border text-[13px] font-bold"
            style={{ background: scoreBg(s.score), borderColor: `${scoreColor(s.score)}28`, color: scoreColor(s.score) }}
          >
            {s.score}%
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
          style={{ background: statusCfg.bg, borderColor: `${statusCfg.color}25` }}
        >
          <StatusIcon className="size-[11px]" style={{ color: statusCfg.color }} />
          <span className="text-[11px] font-bold" style={{ color: statusCfg.color }}>
            {t(`${sp}.session_status.${s.status}`)}
          </span>
        </span>
        <span className="text-xs text-muted-foreground shrink-0">{fmtDate(s.completedAt || s.startedAt, i18n.language)}</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onShowResults}
        className="w-full justify-center"
      >
        <Eye className="size-3.5" />
        {t(`${sp}.show_results_button`)}
      </Button>
    </div>
  );
});
SessionCard.displayName = "SessionCard";

// ─── Sessions view ────────────────────────────────────────────────────────────

const SessionsView = memo<{ campaignId: string; isAnonymous?: boolean }>(({ campaignId, isAnonymous }) => {
  const { t } = useTranslation("dashboard");
  const sp = SP;

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [period,          setPeriod]          = useState("");
  const [sortValue,       setSortValue]       = useState<SortValue>("date_desc");
  const [page,            setPage]            = useState(1);
  const [selected,        setSelected]        = useState<{ id: string; name: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sortBy, order } = SORT_TO_PARAMS[sortValue];
  const { data, isLoading: loading, error: queryError } = useCampaignSessionsQuery({
    campaignId, search: debouncedSearch || undefined, period: period || undefined, sortBy, order, page, limit: PAGE_SIZE,
  });
  const sessions = data?.data  ?? [];
  const total    = data?.total ?? 0;
  const error    = queryError ? String(queryError) : null;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const handlePeriodChange = useCallback((value: string) => { setPeriod(value); setPage(1); }, []);
  const handleSortChange   = useCallback((value: string) => { setSortValue(value as SortValue); setPage(1); }, []);

  const hasActiveFilters = !!((!isAnonymous && debouncedSearch) || period || sortValue !== "date_desc");
  const clearFilters = useCallback(() => {
    handleSearchChange("");
    setPeriod("");
    setSortValue("date_desc");
    setPage(1);
  }, [handleSearchChange]);

  const periodOptions = useMemo(() => PERIOD_VALUES.map((value) => ({
    value,
    label: value === "" ? t(`${CP}.period.all`) : t(`${CP}.period.${value}`),
  })), [t]);

  const sortOptions = useMemo(() => ([
    { value: "date_desc",  label: t(`${sp}.sort.newest`) },
    { value: "score_desc", label: t(`${sp}.sort.highest_score`) },
    { value: "score_asc",  label: t(`${sp}.sort.lowest_score`) },
  ]), [t, sp]);

  return (
    <div>
      <div className="mb-3">
        <CampaignsFilterBar
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder={t(`${sp}.search_placeholder`)}
          showSearch={!isAnonymous}
          period={period}
          onPeriodChange={handlePeriodChange}
          periodOptions={periodOptions}
          periodPlaceholder={t(`${CP}.period_placeholder`)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          clearLabel={t(`${CP}.clear_filters`)}
          extraFilters={
            <Select value={sortValue} onValueChange={handleSortChange}>
              <SelectTrigger className="w-44 bg-card h-9 text-sm">
                <span className="flex items-center gap-1.5">
                  <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {SKELETON_CARDS.map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-background border border-border rounded-2xl text-center py-16">
          <ClipboardList className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            {hasActiveFilters ? t(`${sp}.empty_search_title`) : t(`${sp}.empty_title`)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasActiveFilters ? t(`${sp}.empty_search_hint`) : t(`${sp}.empty_hint`)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {sessions.map((s) => (
            <SessionCard
              key={s._id}
              session={s}
              onShowResults={() => setSelected({ id: s._id, name: resolveSessionName(s, t) })}
            />
          ))}
        </div>
      )}

      {!loading && total > PAGE_SIZE && (
        <div className="mt-3">
          <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}

      <ParticipantResultsDialog
        open={!!selected}
        campaignId={campaignId}
        participantId={selected?.id ?? null}
        participantName={selected?.name ?? ""}
        onClose={() => setSelected(null)}
      />
    </div>
  );
});
SessionsView.displayName = "SessionsView";

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  campaignId: string;
  anonymityMode?: string;
}

const CampaignSessionsTab = memo<Props>(({ campaignId, anonymityMode }) => (
  <SessionsView campaignId={campaignId} isAnonymous={anonymityMode === "ANONYMOUS"} />
));
CampaignSessionsTab.displayName = "CampaignSessionsTab";

export default CampaignSessionsTab;
