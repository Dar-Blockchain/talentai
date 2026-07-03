"use client";

import React, { memo, useState, useRef, useCallback, useMemo } from "react";
import { Search, X, ClipboardList, CircleCheck, Circle, Clock, Ban, Eye } from "lucide-react";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/modules/shared/ui/shadcn/tooltip";
import { useCampaignSessionsQuery } from "../../queries";
import { SessionStatus } from "@/modules/company/campaigns/types/campaign";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { useTranslation } from "react-i18next";
import ParticipantResultsDialog from "./ParticipantResultsDialog";

const PAGE_SIZE = 10;

const SKELETON_ROWS_6 = Array.from({ length: 6 });

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

const GRID_COLS = "1fr 130px 90px 80px 110px 90px";

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const RowSkeleton = memo(() => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border/60">
    <Skeleton className="size-[38px] rounded-full shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-[15px] w-[30%]" />
      <Skeleton className="h-[13px] w-[45%] mt-1" />
    </div>
    <Skeleton className="h-[22px] w-20 rounded-full shrink-0" />
    <Skeleton className="h-4 w-10 shrink-0" />
    <Skeleton className="h-4 w-20 shrink-0" />
    <Skeleton className="size-7 rounded-full shrink-0" />
  </div>
));
RowSkeleton.displayName = "SessionRowSkeleton";

// ─── Sessions view ────────────────────────────────────────────────────────────

const SessionsView = memo<{ campaignId: string }>(({ campaignId }) => {
  const { t, i18n } = useTranslation("dashboard");
  const sp = "pages.campaigns.detail.sessions";
  const du = "pages.campaigns.detail";

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const [selected,        setSelected]        = useState<{ id: string; name: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, isLoading: loading, error: queryError } = useCampaignSessionsQuery({
    campaignId, search: debouncedSearch || undefined, page, limit: PAGE_SIZE,
  });
  const sessions = data?.data  ?? [];
  const total    = data?.total ?? 0;
  const error    = queryError ? String(queryError) : null;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const clearSearch  = useCallback(() => handleSearchChange(""), [handleSearchChange]);

  const headerCols = useMemo(() => [
    t(`${sp}.col_participant`),
    t(`${sp}.col_status`),
    t(`${sp}.col_score`),
    t(`${sp}.col_duration`),
    t(`${sp}.col_completed`),
    t(`${sp}.col_actions`),
  ], [t, sp]);

  return (
    <TooltipProvider delayDuration={200}>
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[13px] text-muted-foreground">
            {!loading && (debouncedSearch
              ? t(`${sp}.matches_search`, { count: total })
              : t(`${sp}.total_sessions`, { count: total }))}
          </p>
          <div className="flex items-center bg-background border border-border rounded-xl px-3 py-1.5 min-w-[220px] shadow-sm">
            <Search className="size-[15px] text-muted-foreground shrink-0 mr-2" />
            <input
              type="text"
              placeholder={t(`${sp}.search_placeholder`)}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border-none outline-none bg-transparent text-[13px] text-foreground w-full font-[inherit] py-0.5"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-background border border-border rounded-2xl overflow-hidden mt-3">
          <div
            className="grid items-center gap-4 px-5 py-3 bg-muted/40 border-b border-border"
            style={{ gridTemplateColumns: GRID_COLS }}
          >
            {headerCols.map((h) => (
              <p key={h} className="text-[11px] font-bold text-muted-foreground tracking-wide">{h}</p>
            ))}
          </div>

          {error ? (
            <div className="m-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          ) : loading ? (
            <div>{SKELETON_ROWS_6.map((_, i) => <RowSkeleton key={i} />)}</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                {debouncedSearch ? t(`${sp}.empty_search_title`) : t(`${sp}.empty_title`)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {debouncedSearch ? t(`${sp}.empty_search_hint`) : t(`${sp}.empty_hint`)}
              </p>
            </div>
          ) : (
            sessions.map((s, i) => {
              const p          = s.participant;
              const isAnon     = s.isAnonymous;
              const name       = isAnon
                ? (p?.firstName ?? t(`${sp}.anonymous`))
                : (p ? ((p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || p.username || t(`${du}.unknown_user`)) : t(`${du}.unknown_user`));
              const email      = isAnon ? null : (p?.email ?? "");
              const letter     = name[0]?.toUpperCase() || "?";
              const statusCfg  = SESSION_STATUS_META[s.status] ?? SESSION_STATUS_META.PENDING;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={s._id}
                  className={`grid items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors ${i < sessions.length - 1 ? "border-b border-border/60" : ""}`}
                  style={{ gridTemplateColumns: GRID_COLS }}
                >
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

                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
                      style={{ background: statusCfg.bg, borderColor: `${statusCfg.color}25` }}
                    >
                      <StatusIcon className="size-[11px]" style={{ color: statusCfg.color }} />
                      <span className="text-[11px] font-bold" style={{ color: statusCfg.color }}>
                        {t(`${sp}.session_status.${s.status}`)}
                      </span>
                    </span>
                  </div>

                  <div>
                    {s.score !== undefined ? (
                      <span
                        className="inline-flex px-2 py-0.5 rounded-md border text-[13px] font-bold"
                        style={{ background: scoreBg(s.score), borderColor: `${scoreColor(s.score)}28`, color: scoreColor(s.score) }}
                      >
                        {s.score}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">{fmtDate(s.completedAt || s.startedAt, i18n.language)}</p>

                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setSelected({ id: s._id, name: isAnon ? t(`${sp}.anonymous`) : name })}
                          className="text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t(`${sp}.results`)}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })
          )}
        </div>

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
    </TooltipProvider>
  );
});
SessionsView.displayName = "SessionsView";

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  campaignId: string;
  anonymityMode?: string;
}

const CampaignSessionsTab = memo<Props>(({ campaignId }) => (
  <SessionsView campaignId={campaignId} />
));
CampaignSessionsTab.displayName = "CampaignSessionsTab";

export default CampaignSessionsTab;
