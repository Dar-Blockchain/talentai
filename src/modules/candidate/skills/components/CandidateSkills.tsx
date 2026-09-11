import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Code2, MessageCircle, Brain, Layers, Plus, SlidersHorizontal, X, Zap } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { cn } from "@/lib/utils";
import dayjs from "@/lib/dayjs";
import { AppDispatch, RootState } from "@/store/store";
import { getMyProfile } from "@/store/slices/userSlice";
import { useSkills } from "../hooks/useSkills";
import type { Skill } from "../types/skill.types";
import AssessmentModal from "@/modules/candidate/interviews/components/AssessmentModal";
import ConfirmTestDialog from "./ConfirmTestDialog";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";
import { useSkillAssessmentsQuery } from "@/modules/candidate/interviews/queries/useInterviewsQuery";

const MONTHLY_QUOTA = 5;

// ─── Types ────────────────────────────────────────────────────────────────────

type TypeFilter  = "all" | "technical" | "soft";
type LevelFilter = null | 1 | 2 | 3 | 4 | 5;

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<number, string> = {
  1: "entry", 2: "junior", 3: "mid", 4: "senior", 5: "expert",
};

const LEVEL_CONFIG: Record<number | "all", { dot: string; active: string }> = {
  all: { dot: "bg-foreground",   active: "bg-foreground/10 text-foreground border-foreground/20" },
  1:   { dot: "bg-gray-400",     active: "bg-gray-100 text-gray-700 border-gray-300" },
  2:   { dot: "bg-warning",      active: "bg-warning/10 text-warning border-warning/30" },
  3:   { dot: "bg-info",         active: "bg-info/10 text-info border-info/30" },
  4:   { dot: "bg-secondary",    active: "bg-secondary/10 text-secondary border-secondary/30" },
  5:   { dot: "bg-primary-dark", active: "bg-primary-light text-primary-dark border-primary-border" },
};

const TYPE_CONFIG: Record<TypeFilter, { icon: React.ElementType; active: string }> = {
  all:       { icon: Layers,        active: "bg-card shadow-sm text-gray-800" },
  technical: { icon: Code2,         active: "bg-card shadow-sm text-gray-800" },
  soft:      { icon: MessageCircle, active: "bg-card shadow-sm text-gray-800" },
};


// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, label, count, loading,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50/80 border-b">
      <div className="size-6 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
        <Icon className="size-3 text-gray-500" />
      </div>
      <span className="text-[0.82rem] font-extrabold text-gray-800 tracking-tight">
        {label}
      </span>
      <div className="ml-auto">
        {loading ? (
          <Skeleton className="h-4 w-6" />
        ) : (
          <span className="text-[0.66rem] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── CandidateSkills ─────────────────────────────────────────────────────────

function CandidateSkills() {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(null);

  // Level filtering + pagination are both server-side now (skill.service.js
  // takes a `level` param), so each section pages independently over its
  // own level-filtered total.
  const tech = useSkills({ kind: "technical", level: levelFilter });
  const soft = useSkills({ kind: "soft",      level: levelFilter });

  const techCount  = tech.pagination?.total ?? 0;
  const softCount  = soft.pagination?.total ?? 0;
  const totalCount = techCount + softCount;

  // Completed assessments aren't linked to ProfileSkill docs by id, so match
  // them by kind+name (same key scheme as SkillTestsSection) to find each
  // skill's most recent report to link the "Report" button to.
  const { data: techAssessments } = useSkillAssessmentsQuery("technical");
  const { data: softAssessments } = useSkillAssessmentsQuery("soft");
  const reportIdBySkill = useMemo(() => {
    const all = [...(techAssessments?.results ?? []), ...(softAssessments?.results ?? [])];
    const latest: Record<string, { id: string; ts: number }> = {};
    for (const a of all as any[]) {
      if (a.interviewData?.status === "interrupted") continue;
      const key = `${a.skillType ?? "technical"}::${(a.skill ?? "").toLowerCase()}`;
      const ts = new Date(a.updatedAt || a.createdAt || 0).getTime();
      if (!latest[key] || ts > latest[key].ts) latest[key] = { id: a._id, ts };
    }
    return Object.fromEntries(Object.entries(latest).map(([k, v]) => [k, v.id]));
  }, [techAssessments, softAssessments]);
  const getReportId = (skill: Skill) => reportIdBySkill[`${skill.kind}::${skill.name.toLowerCase()}`];

  const dispatch  = useDispatch<AppDispatch>();
  const profile   = useSelector((state: RootState) => state.user.connectedUser.profile);
  // Refresh the connected profile on mount -- the persisted copy from login
  // doesn't carry the computed quotaResetAt (only GET /profiles/me does), and
  // the quota count itself may be stale if a test was taken elsewhere.
  useEffect(() => { dispatch(getMyProfile()); }, [dispatch]);
  const quotaUsed = Math.min(profile?.quota ?? 0, MONTHLY_QUOTA);
  const quotaFull = quotaUsed >= MONTHLY_QUOTA;
  // Server-computed rolling-window reset datetime (profile.service.js) --
  // first test of the cycle + QUOTA_RESET_DAYS, not a calendar-month
  // boundary. Only shown once it's actually in the future (see
  // AssessmentModal.tsx for why a past/overdue date shouldn't be shown).
  const quotaResetLabel = profile?.quotaResetAt && dayjs(profile.quotaResetAt).isAfter(dayjs())
    ? dayjs(profile.quotaResetAt).format("MMM D, YYYY [at] h:mm A")
    : null;

  const [modalOpen,   setModalOpen]   = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ skill: Skill; type: "technical" | "soft" } | null>(null);

  const toggleLevel = (v: LevelFilter) => setLevelFilter(prev => prev === v ? null : v);

  const showTech = typeFilter === "all" || typeFilter === "technical";
  const showSoft = typeFilter === "all" || typeFilter === "soft";

  const hasActiveFilters = typeFilter !== "all" || levelFilter !== null;
  const clearFilters = () => { setTypeFilter("all"); setLevelFilter(null); };

  return (
    <Card className="gap-0 py-0 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-3.5 border-b flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="size-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
            <Brain className="size-[18px] text-gray-500" />
          </div>

          {/* Title + stats */}
          <div className="flex-1 min-w-0">
            <p className="text-[0.92rem] font-extrabold text-foreground leading-tight">{s("title")}</p>
            {tech.loading || soft.loading ? (
              <Skeleton className="h-3 w-16 mt-1" />
            ) : (
              <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                {s("subtitle", { count: totalCount })}
              </p>
            )}
          </div>

          {/* Skill-test quota (period is configurable via QUOTA_RESET_DAYS,
              so copy never says "monthly") */}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0 cursor-default",
                    quotaFull ? "bg-danger/10 border-danger/20" : "bg-gray-100 border-gray-200",
                  )}
                >
                  <Zap className={cn("size-3.5", quotaFull ? "text-danger" : "text-gray-500")} />
                  <span className={cn("text-[0.68rem] font-semibold", quotaFull ? "text-danger" : "text-gray-500")}>
                    {s("quota_label")}
                  </span>
                  <span className={cn("text-[0.75rem] font-extrabold", quotaFull ? "text-danger" : "text-gray-800")}>
                    {quotaUsed}/{MONTHLY_QUOTA}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[220px] text-center">
                <p className="font-semibold">{s("monthly_quota")}</p>
                <p className="mt-0.5 text-[0.72rem] opacity-90">
                  {quotaFull
                    ? s("quota_tooltip_full", { max: MONTHLY_QUOTA })
                    : s("quota_tooltip_left", { left: MONTHLY_QUOTA - quotaUsed, max: MONTHLY_QUOTA })}
                </p>
                {quotaResetLabel && (
                  <p className="mt-0.5 text-[0.72rem] opacity-90">
                    {s("quota_resets_at", { date: quotaResetLabel })}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Add button */}
          <Button
            size="sm"
            disabled={quotaFull}
            onClick={() => setModalOpen(true)}
            className="shrink-0 gap-1.5 text-xs font-semibold rounded-lg bg-primary-dark hover:bg-primary-dark/90 text-white cursor-pointer"
          >
            <Plus className="size-3.5" />
            {s("add_skill")}
          </Button>
        </div>

        {quotaFull ? (
          <p className="text-[0.62rem] text-danger font-medium">
            {quotaResetLabel ? s("quota_limit_reset", { date: quotaResetLabel }) : s("quota_limit")}
          </p>
        ) : quotaResetLabel && quotaUsed > 0 ? (
          <p className="text-[0.62rem] text-muted-foreground font-medium">
            {s("quota_resets_at", { date: quotaResetLabel })}
          </p>
        ) : null}
      </div>

      <AssessmentModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="px-3 py-3 flex flex-col gap-2.5 border-b bg-gray-50">

        {/* Label row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3 text-muted-foreground" />
            <span className="text-[0.62rem] font-bold text-muted-foreground uppercase tracking-wider">
              {s("filters_label")}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-0.5 text-[0.64rem] font-bold text-secondary-dark hover:text-secondary-dark/80 cursor-pointer"
            >
              <X className="size-2.5" />
              {s("clear_filters")}
            </button>
          )}
        </div>

        {/* Type — segmented control */}
        <div className="flex items-center bg-gray-200/70 rounded-lg p-0.5 gap-0.5">
          {(["all", "technical", "soft"] as TypeFilter[]).map(type => {
            const { icon: Icon, active } = TYPE_CONFIG[type];
            const isActive = typeFilter === type;
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 text-[0.7rem] font-semibold px-2 py-1.5 rounded-md transition-all duration-200 cursor-pointer",
                  isActive ? active : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3 shrink-0" />
                {s(`filter.${type}`)}
              </button>
            );
          })}
        </div>

        {/* Level pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {([null, 1, 2, 3, 4, 5] as (LevelFilter)[]).map(lvl => {
            const key      = lvl ?? "all";
            const { dot, active } = LEVEL_CONFIG[key];
            const isActive = levelFilter === lvl;
            const label    = lvl === null ? s("filter.all_levels") : s(`levels.${LEVEL_LABELS[lvl]}`);
            return (
              <button
                key={String(key)}
                onClick={() => lvl === null ? setLevelFilter(null) : toggleLevel(lvl)}
                className={cn(
                  "flex items-center gap-1 text-[0.64rem] font-semibold px-2 py-0.5 rounded-full border transition-all duration-150 cursor-pointer",
                  isActive
                    ? active
                    : "border-gray-200 bg-white text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full shrink-0 transition-opacity", dot, !isActive && "opacity-40")} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Technical ───────────────────────────────────────────────────── */}
      {showTech && (
        <div>
          <SectionHeader
            icon={Code2} label={s("technical")}
            count={techCount} loading={tech.loading}
          />
          <TechnicalSkills {...tech} levelFilter={levelFilter} onTest={quotaFull ? undefined : (skill) => setConfirmTarget({ skill, type: "technical" })} getReportId={getReportId} />
        </div>
      )}

      {/* ── Soft ────────────────────────────────────────────────────────── */}
      {showSoft && (
        <div className={cn(showTech && "border-t")}>
          <SectionHeader
            icon={MessageCircle} label={s("soft")}
            count={softCount} loading={soft.loading}
          />
          <SoftSkills {...soft} levelFilter={levelFilter} onTest={quotaFull ? undefined : (skill) => setConfirmTarget({ skill, type: "soft" })} getReportId={getReportId} />
        </div>
      )}

      <ConfirmTestDialog
        skill={confirmTarget?.skill ?? null}
        type={confirmTarget?.type ?? "technical"}
        quotaUsed={quotaUsed}
        quotaMax={MONTHLY_QUOTA}
        quotaResetLabel={quotaResetLabel}
        onClose={() => setConfirmTarget(null)}
      />

    </Card>
  );
}

export default CandidateSkills;
