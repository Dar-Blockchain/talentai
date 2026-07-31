import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TOptions } from "i18next";
import { Code2, Users, Layers, Plus } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";
import { useSkills } from "../hooks/useSkills";
import AssessmentModal from "@/modules/candidate/interviews/components/AssessmentModal";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";

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

const TYPE_CONFIG: Record<TypeFilter, { icon: React.ElementType; active: string; dot: string }> = {
  all:       { icon: Layers, active: "bg-card shadow-sm text-foreground",     dot: "bg-foreground" },
  technical: { icon: Code2,  active: "bg-card shadow-sm text-info",           dot: "bg-info" },
  soft:      { icon: Users,  active: "bg-card shadow-sm text-warning",        dot: "bg-warning" },
};


// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, label, count, loading, accentBg, accentText,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  loading: boolean;
  accentBg: string;
  accentText: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-b">
      <div className={cn("w-1 h-3.5 rounded-full shrink-0", accentBg)} />
      <Icon className={cn("size-3.5 shrink-0", accentText)} />
      <span className={cn("text-[0.7rem] font-bold uppercase tracking-widest", accentText)}>
        {label}
      </span>
      <div className="ml-1">
        {loading ? (
          <Skeleton className="h-4 w-6" />
        ) : (
          <span className={cn("text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full text-white", accentBg)}>
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
  const s = (k: string, opts?: TOptions) => t(`candidate.skills.${k}`, opts) as string;

  const tech = useSkills({ kind: "technical", limit: 8 });
  const soft = useSkills({ kind: "soft",      limit: 8 });

  const techCount  = tech.pagination?.total ?? 0;
  const softCount  = soft.pagination?.total ?? 0;
  const totalCount = techCount + softCount;

  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(null);
  const [modalOpen,   setModalOpen]   = useState(false);

  const toggleLevel = (v: LevelFilter) => setLevelFilter(prev => prev === v ? null : v);

  const showTech = typeFilter === "all" || typeFilter === "technical";
  const showSoft = typeFilter === "all" || typeFilter === "soft";

  return (
    <Card className="gap-0 py-0 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b flex items-center gap-3">
        {/* Icon */}
        <div className="size-9 rounded-xl bg-primary-light border border-primary-border flex items-center justify-center shrink-0">
          <Layers className="size-[18px] text-primary-dark" />
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

        {/* Add button */}
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="shrink-0 gap-1.5 text-xs font-semibold rounded-lg bg-primary-dark hover:bg-primary-dark/90 text-white cursor-pointer"
        >
          <Plus className="size-3.5" />
          {s("add_skill")}
        </Button>
      </div>

      <AssessmentModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex flex-col gap-2 border-b bg-muted/20">

        {/* Type — segmented control */}
        <div className="flex items-center bg-muted/70 rounded-lg p-0.5 gap-0.5">
          {(["all", "technical", "soft"] as TypeFilter[]).map(type => {
            const { icon: Icon, active, dot } = TYPE_CONFIG[type];
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
                {isActive
                  ? <span className={cn("size-1.5 rounded-full shrink-0", dot)} />
                  : <Icon className="size-3 shrink-0" />
                }
                {s(`filter.${type}`)}
              </button>
            );
          })}
        </div>

        {/* Level pills */}
        <div className="flex items-center gap-1 flex-wrap">
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
                    : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
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
            accentBg="bg-info" accentText="text-info"
          />
          <TechnicalSkills {...tech} levelFilter={levelFilter} />
        </div>
      )}

      {/* ── Soft ────────────────────────────────────────────────────────── */}
      {showSoft && (
        <div className={cn(showTech && "border-t")}>
          <SectionHeader
            icon={Users} label={s("soft")}
            count={softCount} loading={soft.loading}
            accentBg="bg-warning" accentText="text-warning"
          />
          <SoftSkills {...soft} levelFilter={levelFilter} />
        </div>
      )}

    </Card>
  );
}

export default CandidateSkills;
